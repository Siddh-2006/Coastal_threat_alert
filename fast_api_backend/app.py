from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
import numpy as np
import matplotlib.pyplot as plt
import uuid
import os
avialable_area={"ind_sb1":"sundarban_forecast.pth"}
app = FastAPI()

# === Dummy Models (replace with your trained models) ===
def load_forecast_model(filepath):
    """Load the forecasting model"""
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    checkpoint = torch.load(filepath, map_location=device)

    # Recreate model architecture
    config = checkpoint['model_config']
    model = WindPressurePatchTST(
        num_features=config['num_features'],
        seq_len=config['seq_len'],
        pred_len=config['pred_len'],
        patch_len=config['patch_len'],
        stride=config['stride'],
        d_model=config['d_model'],
        n_layers=config['n_layers'],
        n_heads=config['n_heads']
    )

    # Load weights
    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(device)
    model.eval()
    print(f"✅ Forecast model loaded from {filepath}")
    return model, checkpoint['dataset_scalers'], checkpoint['target_names']

def load_model_from_area(area):
    if not area in avialable_area:
        return {"error":"we dont serve the region currently"}
    else:
         # DEMONSTRATE LOADING
        print("\n" + "=" * 60)
        print("DEMONSTRATING MODEL LOADING:")
        print("=" * 60)

        # Load forecasting model
        print("Loading forecasting model...")
        
        loaded_forecast_model, loaded_scalers, loaded_target_names = load_forecast_model(avialable_area[area])

def forecast_with_patchtst(data, horizon=24):
    """Dummy forecast function - replace with your model"""
    # Example: repeat last value + small noise
    forecast = np.tile(data[-1:], (horizon, 1)) + np.random.normal(0, 0.1, (horizon, data.shape[1]))
    return forecast

def detect_anomalies(data, reconstructions, threshold=0.05):
    """Simple anomaly detection with MSE"""
    mse = np.mean((data - reconstructions) ** 2, axis=1)
    anomalies = mse > threshold
    return anomalies, mse

# === Your plotting function ===
def plot_anomalies(data, anomalies, mse, threshold, reconstructions):
    time_points = np.arange(len(data))

    fig, axes = plt.subplots(3, 1, figsize=(12, 10))
    
    # Wind Speed
    axes[0].plot(time_points, data[:, 0], 'b-', label='Wind Speed', alpha=0.7)
    axes[0].set_ylabel('Wind Speed (m/s)')
    axes[0].legend()
    axes[0].set_title('Wind Speed with Anomalies')

    # Pressure
    axes[1].plot(time_points, data[:, 1], 'g-', label='Pressure', alpha=0.7)
    axes[1].set_ylabel('Pressure (hPa)')
    axes[1].legend()
    axes[1].set_title('Pressure with Anomalies')

    # Reconstruction error
    axes[2].plot(mse, 'b-', label='Reconstruction Error')
    axes[2].axhline(y=threshold, color='r', linestyle='--', label='Threshold')
    axes[2].scatter(np.where(anomalies)[0], mse[anomalies],
                    color='red', s=50, label='Anomalies')
    axes[2].set_ylabel('MSE')
    axes[2].set_xlabel('Time Step')
    axes[2].legend()
    axes[2].set_title('Reconstruction Error and Anomaly Detection')

    plt.tight_layout()

    # Save plot to a temporary file
    filename = f"anomaly_plot_{uuid.uuid4().hex}.png"
    plt.savefig(filename)
    plt.close(fig)
    return filename

# === API Endpoint ===
@app.get("/forecast_and_anomaly/{area}")
def forecast_and_anomaly():
    # Example: simulate input data (wind speed + pressure)
    # Replace with real API input
    data = np.random.rand(100, 2)  

    # Forecast next 24 hours
    forecast = forecast_with_patchtst(data, horizon=24)

    # Fake reconstructions = noisy version of original data
    reconstructions = data + np.random.normal(0, 0.01, data.shape)

    # Detect anomalies
    anomalies, mse = detect_anomalies(data, reconstructions, threshold=0.02)

    # Generate anomaly plot
    plot_path = plot_anomalies(data, anomalies, mse, 0.02, reconstructions)

    response = {
        "forecast": forecast.tolist(),
        "anomalies": anomalies.tolist(),
        "mse": mse.tolist(),
        "plot_path": plot_path
    }
    return JSONResponse(content=response)

@app.get("/get_plot/{filename}")
def get_plot(filename: str):
    """Serve saved anomaly plots"""
    filepath = filename
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type="image/png")
    return {"error": "File not found"}
