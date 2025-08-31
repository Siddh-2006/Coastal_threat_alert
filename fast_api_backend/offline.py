from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import torch
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import io
import base64
import json
from typing import List, Dict, Any, Optional
import requests
import warnings
from torch import nn
import traceback
import os
port = os.environ.get("PORT", 9000)
threshold_bias = 0.3
warnings.filterwarnings('ignore')

# Define the model architectures
class WindPressurePatchTST(nn.Module):
    def __init__(self, num_features=12, seq_len=128, pred_len=24, patch_len=16, stride=8,
                 d_model=64, n_layers=2, n_heads=4, dropout=0.1):
        super().__init__()

        self.num_features = num_features
        self.seq_len = seq_len
        self.pred_len = pred_len
        self.patch_len = patch_len
        self.stride = stride

        # Calculate number of patches
        self.num_patches = (seq_len - patch_len) // stride + 1

        # Patch embedding (multivariate input)
        self.patch_embed = nn.Linear(patch_len * num_features, d_model)

        # Positional encoding
        self.pos_embed = nn.Parameter(torch.randn(1, self.num_patches, d_model))

        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=n_heads,
            dim_feedforward=d_model*4,
            dropout=dropout,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)

        # Forecasting head - predicts both wind and pressure
        self.forecast_head = nn.Sequential(
            nn.Linear(d_model, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, pred_len * num_features)  # Predict both features
        )

        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # x shape: (batch_size, seq_len, num_features)
        batch_size = x.size(0)

        # Create patches
        patches = []
        for i in range(0, self.seq_len - self.patch_len + 1, self.stride):
            patch = x[:, i:i+self.patch_len, :]  # (batch_size, patch_len, num_features)
            patch = patch.reshape(batch_size, -1)  # (batch_size, patch_len * num_features)
            patches.append(patch)

        patches = torch.stack(patches, dim=1)  # (batch_size, num_patches, patch_len * num_features)

        # Embed patches
        x_emb = self.patch_embed(patches)  # (batch_size, num_patches, d_model)
        x_emb = x_emb + self.pos_embed

        # Transformer encoding
        x_emb = self.dropout(x_emb)
        encoded = self.transformer(x_emb)

        # Use global average pooling over patches
        global_rep = encoded.mean(dim=1)  # (batch_size, d_model)

        # Forecasting
        forecast = self.forecast_head(global_rep)  # (batch_size, pred_len * num_features)
        forecast = forecast.view(batch_size, self.pred_len, self.num_features)  # (batch_size, pred_len, num_features)

        return forecast

# Initialize FastAPI app
app = FastAPI(title="Weather Forecasting & Anomaly Detection API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class ForecastRequest(BaseModel):
    latitude: float
    longitude: float
    start_date: str  # Format: "YYYY-MM-DD"
    end_date: str    # Format: "YYYY-MM-DD"

class ForecastResponse(BaseModel):
    forecast: Dict[str, List[float]]
    anomaly_detection: Dict[str, Any]
    reconstruction_error: float
    plot_data: str  # base64 encoded plot
    timestamp: str
    metadata: Dict[str, Any]

# Global variables for models
forecast_model = None
forecast_scalers = None
forecast_target_names = None
autoencoder_model = None

# Target features in the correct order
TARGET_FEATURES = [
    'surface_pressure', 'pressure_tendency', 'wind_speed_10m', 
    'wind_speed_100m', 'wind_gusts_10m', 'wind_shear', 
    'relative_humidity_2m', 'dew_point_2m', 'temperature_2m', 
    'precipitation', 'cloud_cover', 'wind_direction_10m'
]

# Fetch historical data from Open-Meteo API
def fetch_historical_weather(latitude: float, longitude: float, start_date: str, end_date: str):
    """Fetch historical weather data from Open-Meteo API"""
    url = "https://archive-api.open-meteo.com/v1/archive"
    
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": [
            "temperature_2m", "relative_humidity_2m", "dew_point_2m",
            "surface_pressure", "precipitation", "rain", "snowfall",
            "cloud_cover", "wind_speed_10m", "wind_speed_100m",
            "wind_direction_10m", "wind_gusts_10m",
        ],
        "timezone": "auto"
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Convert to DataFrame
        df = pd.DataFrame(data['hourly'])
        df['time'] = pd.to_datetime(df['time'])
        df.set_index('time', inplace=True)
        
        # Calculate derived features
        df['pressure_tendency'] = df['surface_pressure'].diff(3)   # 3-hour pressure change
        df['wind_shear'] = df['wind_speed_100m'] - df['wind_speed_10m']
        
        # Select and reorder the features we need
        available_features = [f for f in TARGET_FEATURES if f in df.columns]
        df = df[available_features]
        
        # Fill NaN values
        df = df.ffill().bfill()
        
        print(f"✅ Fetched {len(df)} records with features: {list(df.columns)}")
        return df
        
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather data: {str(e)}")

# Model loading functions
def load_forecast_model_simple(filepath="./cust_train1/sundarban.pth"):
    """Load forecasting model with fixed architecture"""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    try:
        checkpoint = torch.load(filepath, map_location=device,weights_only=False)
        
        # Extract target names from checkpoint
        target_names = checkpoint.get('target_names', TARGET_FEATURES)
        
        # Create model with fixed architecture
        model = WindPressurePatchTST(
            num_features=len(target_names),
            seq_len=128,
            pred_len=24,
            patch_len=16,
            stride=8,
            d_model=64,
            n_layers=2,
            n_heads=4,
            dropout=0.1
        )
        
        model.load_state_dict(checkpoint['model_state_dict'])
        model.to(device)
        model.eval()
        
        # Recreate scalers
        loaded_scalers = {}
        scaler_params = checkpoint.get('dataset_scalers', {})
        
        for name in target_names:
            if name in scaler_params:
                scaler = StandardScaler()
                scaler.mean_ = np.array([scaler_params[name]['mean_']])
                scaler.scale_ = np.array([scaler_params[name]['scale_']])
                scaler.var_ = np.array([scaler_params[name]['var_']])
                scaler.n_samples_seen_ = scaler_params[name]['n_samples_seen_']
                loaded_scalers[name] = scaler
            else:
                # Create a default scaler if not found
                scaler = StandardScaler()
                scaler.mean_ = np.array([0.0])
                scaler.scale_ = np.array([1.0])
                scaler.var_ = np.array([1.0])
                scaler.n_samples_seen_ = 1
                loaded_scalers[name] = scaler
        
        return model, loaded_scalers, target_names
        
    except Exception as e:
        print(f"Error loading forecast model: {e}")
        print(traceback.format_exc())
        raise

def load_autoencoder_model(filepath="./cust_train1/weather_autoencoder"):
    """Load autoencoder model"""
    try:
        # Import tensorflow only when needed
        from tensorflow.keras.models import load_model
        
        # Load configuration
        config_data = np.load(f"./{filepath}_config.npz")
        time_steps = int(config_data['time_steps'])
        features = int(config_data['features'])
        latent_dim = int(config_data['latent_dim'])
        threshold = float(config_data['threshold'])
        
        # Load Keras model
        keras_model = load_model(f"{filepath}_model.h5", compile=False)
        
        # Load scaler parameters
        scaler_data = np.load(f"{filepath}_scaler.npz")
        scaler = StandardScaler()
        scaler.mean_ = scaler_data['mean']
        scaler.scale_ = scaler_data['scale']
        scaler.var_ = scaler_data['var']
        scaler.n_samples_seen_ = scaler_data['n_samples_seen']
        
        # Create a simple class to hold the model and scaler
        class AutoencoderWrapper:
            def __init__(self, model, scaler, time_steps, features, latent_dim, threshold):
                self.model = model
                self.scaler = scaler
                self.time_steps = time_steps
                self.features = features
                self.latent_dim = latent_dim
                self.threshold = threshold
                
            def prepare_data(self, data, train_ratio=0.8, max_samples=None):
                """Prepare time series data for training with optional sampling"""
                # Normalize data
                scaled_data = self.scaler.transform(data)
                
                # Limit number of samples if specified
                if max_samples and len(scaled_data) > max_samples:
                    indices = np.random.choice(len(scaled_data), max_samples, replace=False)
                    scaled_data = scaled_data[indices]
                
                # Create sequences
                sequences = []
                for i in range(len(scaled_data) - self.time_steps + 1):
                    sequences.append(scaled_data[i:i + self.time_steps])
                
                sequences = np.array(sequences)
                
                # Split into train/test
                train_size = int(len(sequences) * train_ratio)
                X_train = sequences[:train_size]
                X_test = sequences[train_size:]
                
                return X_train, X_test, sequences
        
        autoencoder = AutoencoderWrapper(keras_model, scaler, time_steps, features, latent_dim, threshold)
        return autoencoder
        
    except Exception as e:
        print(f"Error loading autoencoder: {e}")
        print(traceback.format_exc())
        raise

# Load models at startup
@app.on_event("startup")
async def load_models():
    global forecast_model, forecast_scalers, forecast_target_names, autoencoder_model
    
    try:
        # Load forecasting model
        forecast_model, forecast_scalers, forecast_target_names = load_forecast_model_simple()
        print("✅ Forecast model loaded successfully")
        
        # Load autoencoder model
        autoencoder_model = load_autoencoder_model()
        print("✅ Autoencoder model loaded successfully")
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        print(traceback.format_exc())

# Forecasting endpoint
@app.post("/forecast", response_model=ForecastResponse)
async def make_forecast(request: ForecastRequest):
    try:
        # Fetch historical data from Open-Meteo
        historical_df = fetch_historical_weather(
            request.latitude, 
            request.longitude, 
            request.start_date, 
            request.end_date
        )
        
        if len(historical_df) < 128:
            raise HTTPException(
                status_code=400, 
                detail=f"Need at least 128 hours of data. Got only {len(historical_df)} hours."
            )
        
        # Ensure we have all the required features
        missing_features = [f for f in forecast_target_names if f not in historical_df.columns]
        if missing_features:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required features: {missing_features}"
            )
        
        # Take the most recent 128 hours for forecasting
        historical_data = historical_df[forecast_target_names].tail(128).values.astype(np.float32)
        
        # Make forecast using PatchTST
        forecast_results = predict_with_loaded_model(
            forecast_model, forecast_scalers, forecast_target_names, historical_data
        )
        
        # Prepare forecast results
        forecast_dict = {}
        for i, feature_name in enumerate(forecast_target_names):
            forecast_dict[feature_name] = forecast_results[:, i].tolist()
        
        # Detect anomalies using autoencoder
        anomaly_results = detect_anomalies_with_autoencoder(autoencoder_model, forecast_results)
        
        # Generate plot
        plot_base64 = generate_comprehensive_plot(historical_data, forecast_results, forecast_target_names, anomaly_results)
        
        response = ForecastResponse(
            forecast=forecast_dict,
            anomaly_detection=anomaly_results,
            reconstruction_error=anomaly_results['latest_reconstruction_error'],
            plot_data=plot_base64,
            timestamp=datetime.now().isoformat(),
            metadata={
                "location": {"latitude": request.latitude, "longitude": request.longitude},
                "data_period": {"start": request.start_date, "end": request.end_date},
                "historical_data_points": len(historical_df),
                "features_available": list(historical_df.columns),
                "forecast_horizon": 24
            }
        )
        
        return response
        
    except Exception as e:
        print(f"Forecast error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Forecast error: {str(e)}")

def predict_with_loaded_model(model, scalers, target_names, new_data):
    """Make predictions using loaded model"""
    device = next(model.parameters()).device
    model.eval()
    
    # Normalize new data using saved scalers
    normalized_data = np.zeros_like(new_data)
    for i, feature_name in enumerate(target_names):
        feature_data = new_data[:, i].reshape(-1, 1)
        normalized_data[:, i] = scalers[feature_name].transform(feature_data).flatten()
    
    # Create sequence (last 128 hours)
    sequence = normalized_data[-128:]
    sequence_tensor = torch.FloatTensor(sequence).unsqueeze(0).to(device)
    
    # Predict
    with torch.no_grad():
        prediction = model(sequence_tensor)
        prediction = prediction.squeeze(0).cpu().numpy()
    
    # Denormalize predictions
    denorm_predictions = np.zeros_like(prediction)
    for i, feature_name in enumerate(target_names):
        feature_pred = prediction[:, i].reshape(-1, 1)
        denorm_predictions[:, i] = scalers[feature_name].inverse_transform(feature_pred).flatten()
    
    
    return denorm_predictions

def detect_anomalies_with_autoencoder(autoencoder, data):
    """Detect anomalies using autoencoder"""
    try:
        # Prepare data for autoencoder
        _, _, sequences = autoencoder.prepare_data(data)
        
        # Get reconstructions
        reconstructions = autoencoder.model.predict(sequences)
        
        # Calculate reconstruction error
        mse = np.mean(np.square(sequences - reconstructions), axis=(1, 2))
        
        # Identify anomalies
        anomalies = mse > autoencoder.threshold-threshold_bias
        
        # Get the latest error if available
        latest_error = float(mse[-1]) if len(mse) > 0 else 0.0
        
        return {
            "has_anomaly": bool(anomalies[-1]) if len(anomalies) > 0 else False,
            "latest_reconstruction_error": latest_error,
            "anomaly_threshold": float(autoencoder.threshold-threshold_bias),
            "total_anomalies": int(np.sum(anomalies)),
            "anomaly_indices": np.where(anomalies)[0].tolist(),
            "reconstruction_errors": mse.tolist()[-24:]  # Last 24 errors
        }
        
    except Exception as e:
        print(f"Anomaly detection error: {e}")
        print(traceback.format_exc())
        return {
            "has_anomaly": False,
            "latest_reconstruction_error": 0.0,
            "anomaly_threshold": 0.0,
            "total_anomalies": 0,
            "anomaly_indices": [],
            "reconstruction_errors": [],
            "error": str(e)
        }

def generate_comprehensive_plot(historical_data, forecast, target_names, anomaly_results):
    """Generate comprehensive plot with historical data, forecast, and anomalies"""
    plt.figure(figsize=(16, 12))
    
    # Plot key features
    key_features = ['temperature_2m', 'wind_speed_10m', 'surface_pressure', 'relative_humidity_2m']
    colors = ['red', 'blue', 'green', 'orange']
    
    for i, feature_name in enumerate(target_names):
        if feature_name in key_features:
            feature_idx = target_names.index(feature_name)
            
            # Historical data (last 48 hours)
            historical_hours = range(-48, 0)
            historical_to_plot = historical_data[-48:, feature_idx]
            
            # Forecast (next 24 hours)
            forecast_hours = range(0, 24)
            forecast_to_plot = forecast[:, feature_idx]
            
            plt.plot(historical_hours, historical_to_plot, 
                    color=colors[key_features.index(feature_name)], 
                    linestyle='-', linewidth=2, label=f'Historical {feature_name}')
            
            plt.plot(forecast_hours, forecast_to_plot, 
                    color=colors[key_features.index(feature_name)], 
                    linestyle='--', linewidth=2, label=f'Forecast {feature_name}')
    
    # Add anomaly indicators
    if anomaly_results['has_anomaly']:
        plt.axvline(x=-1, color='red', linestyle=':', linewidth=3, alpha=0.7, 
                   label=f'Anomaly detected (error: {anomaly_results["latest_reconstruction_error"]:.3f})')
    
    plt.axvline(x=0, color='black', linestyle='-', linewidth=2, alpha=0.7, label='Now')
    plt.xlabel('Hours (0 = current time)')
    plt.ylabel('Values')
    plt.title('Weather Forecast with Anomaly Detection\n'
             f'Anomaly Threshold: {anomaly_results["anomaly_threshold"]:.3f} | '
             f'Current Error: {anomaly_results["latest_reconstruction_error"]:.3f}')
    plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
    plt.grid(True, alpha=0.3)
    
    # Convert plot to base64
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
    buf.seek(0)
    plot_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()
    
    return plot_base64

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "forecast_model_loaded": forecast_model is not None,
        "autoencoder_loaded": autoencoder_model is not None,
        "timestamp": datetime.now().isoformat()
    }

# Model information endpoint
@app.get("/model-info")
async def model_info():
    return {
        "forecast_features": forecast_target_names if forecast_target_names else [],
        "forecast_horizon": 24,
        "autoencoder_time_steps": autoencoder_model.time_steps if autoencoder_model else None,
        "autoencoder_threshold": autoencoder_model.threshold-threshold_bias if autoencoder_model else None
    }

# Example request endpoint
@app.get("/example-request")
async def example_request():
    """Show example API request"""
    return {
        "example_request": {
            "latitude": 28.6139,
            "longitude": 77.2090,
            "start_date": (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d"),
            "end_date": datetime.now().strftime("%Y-%m-%d")
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=port)