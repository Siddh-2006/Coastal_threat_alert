
import pandas as pd
import numpy as np
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
class WindPressureDataset(Dataset):
    def __init__(self, csv_path, seq_len=128, pred_len=24):
        """
        Dataset for wind speed and pressure forecasting
        """
        # Load data
        df = pd.read_csv(csv_path, parse_dates=['date'])

        # Select only wind speed and pressure features
        target_features = [
 'surface_pressure',
 'pressure_tendency',
 'wind_speed_10m',
 'wind_speed_100m',
 'wind_gusts_10m',
 'wind_shear',
 'relative_humidity_2m',
 'dew_point_2m',
 'temperature_2m',
 'precipitation',
 'cloud_cover',
 'wind_direction_10m'
]
        self.df = df[['date'] + target_features].copy()
        self.target_names = target_features

        # Drop rows with NaN values
        initial_count = len(self.df)
        self.df = self.df.dropna()
        final_count = len(self.df)
        print(f"Dropped {initial_count - final_count} rows with NaN values")

        # Extract features
        self.data = self.df[target_features].values.astype(np.float32)
        self.dates = self.df['date']

        # Normalize each feature separately
        self.scalers = {}
        self.data_normalized = np.zeros_like(self.data)

        for i, feature in enumerate(target_features):
            feature_data = self.data[:, i]
            # Remove any remaining inf values
            feature_data = np.nan_to_num(feature_data, nan=0.0, posinf=1e6, neginf=-1e6)

            self.scalers[feature] = StandardScaler()
            self.data_normalized[:, i] = self.scalers[feature].fit_transform(
                feature_data.reshape(-1, 1)
            ).flatten()

        self.seq_len = seq_len
        self.pred_len = pred_len
        self.total_length = seq_len + pred_len
        self.num_features = len(target_features)

        # Create sequences
        self.sequences = []
        self.targets = []

        for i in range(len(self.data_normalized) - self.total_length + 1):
            seq = self.data_normalized[i:i+seq_len]  # Input sequence
            target = self.data_normalized[i+seq_len:i+seq_len+pred_len]  # Target sequence
            self.sequences.append(seq)
            self.targets.append(target)

        # Convert to numpy arrays
        self.sequences = np.array(self.sequences)
        self.targets = np.array(self.targets)

        # Train/validation split (80/20)
        split_idx = int(len(self.sequences) * 0.8)
        self.train_sequences = self.sequences[:split_idx]
        self.train_targets = self.targets[:split_idx]
        self.val_sequences = self.sequences[split_idx:]
        self.val_targets = self.targets[split_idx:]

        print(f"Created {len(self.sequences)} sequences")
        print(f"Train: {len(self.train_sequences)}, Validation: {len(self.val_sequences)}")
        print(f"Features: {self.target_names}")

        # Print data statistics
        for i, feature in enumerate(self.target_names):
            original_data = self.data[:, i]
            print(f"{feature}: {original_data.min():.1f} - {original_data.max():.1f} "
                  f"(mean: {original_data.mean():.1f})")

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        return self.sequences[idx], self.targets[idx]

    def denormalize(self, data, feature_idx):
        """Convert normalized data back to original scale for specific feature"""
        feature_name = self.target_names[feature_idx]
        return self.scalers[feature_name].inverse_transform(data.reshape(-1, 1)).flatten()
class WeatherAutoencoder:
    def __init__(self, time_steps=24, features=12, latent_dim=8):
        self.time_steps = time_steps
        self.features = features
        self.latent_dim = latent_dim
        self.scaler = StandardScaler()
        self.model = self._build_model()
        self.threshold = None

    def _build_model(self):
        """Build LSTM-based autoencoder"""
        from tensorflow.keras.models import Model
        from tensorflow.keras.layers import Input, LSTM, Dense, RepeatVector, TimeDistributed
        from tensorflow.keras.optimizers import Adam

        # Encoder
        inputs = Input(shape=(self.time_steps, self.features))
        encoded = LSTM(32, activation='relu', return_sequences=True)(inputs)
        encoded = LSTM(16, activation='relu', return_sequences=False)(encoded)
        encoded = Dense(self.latent_dim, activation='relu')(encoded)

        # Decoder
        decoded = RepeatVector(self.time_steps)(encoded)
        decoded = LSTM(16, activation='relu', return_sequences=True)(decoded)
        decoded = LSTM(32, activation='relu', return_sequences=True)(decoded)
        decoded = TimeDistributed(Dense(self.features))(decoded)

        autoencoder = Model(inputs, decoded)
        autoencoder.compile(optimizer=Adam(learning_rate=0.001),
                           loss='mse', metrics=['mae'])

        return autoencoder

    def prepare_data(self, data, train_ratio=0.8, max_samples=None):
        """Prepare time series data for training with optional sampling"""
        # Normalize data
        scaled_data = self.scaler.fit_transform(data)

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

    def train(self, X_train, X_test, epochs=100, batch_size=32, early_stopping_patience=10):
        """Train the autoencoder with early stopping"""
        from tensorflow.keras.callbacks import EarlyStopping

        early_stop = EarlyStopping(monitor='val_loss', patience=early_stopping_patience,
                                 restore_best_weights=True)

        history = self.model.fit(
            X_train, X_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=(X_test, X_test),
            callbacks=[early_stop],
            verbose=1
        )

        return history

    def detect_anomalies(self, data, threshold_std=2.0):
        """Detect anomalies based on reconstruction error"""
        # Prepare data
        sequences = self.prepare_data(data)[2]

        # Get reconstructions
        reconstructions = self.model.predict(sequences)

        # Calculate reconstruction error
        mse = np.mean(np.square(sequences - reconstructions), axis=(1, 2))

        # Set threshold (mean + n*std)
        self.threshold = np.mean(mse) + threshold_std * np.std(mse)

        # Identify anomalies
        anomalies = mse > self.threshold

        return anomalies, mse, self.threshold, reconstructions
    def plot_anomalies(self, data, anomalies, mse, threshold, reconstructions):
          """Plot anomaly detection results"""
          time_points = np.arange(len(data))

          fig, axes = plt.subplots(3, 1, figsize=(12, 10))

          # Plot wind speed
          axes[0].plot(time_points, data[:, 0], 'b-', label='Wind Speed', alpha=0.7)
          axes[0].set_ylabel('Wind Speed (m/s)')
          axes[0].legend()
          axes[0].set_title('Wind Speed with Anomalies')

          # Plot pressure
          axes[1].plot(time_points, data[:, 1], 'g-', label='Pressure', alpha=0.7)
          axes[1].set_ylabel('Pressure (hPa)')
          axes[1].legend()
          axes[1].set_title('Pressure with Anomalies')

          # Plot reconstruction error and anomalies
          axes[2].plot(mse, 'b-', label='Reconstruction Error')
          axes[2].axhline(y=threshold, color='r', linestyle='--', label='Threshold')
          axes[2].scatter(np.where(anomalies)[0], mse[anomalies],
                        color='red', s=50, label='Anomalies')
          axes[2].set_ylabel('MSE')
          axes[2].set_xlabel('Time Step')
          axes[2].legend()
          axes[2].set_title('Reconstruction Error and Anomaly Detection')

          plt.tight_layout()
          plt.show()
# Load full dataset for PatchTST
full_dataset = WindPressureDataset("openmetro_weather_2022.csv", seq_len=128, pred_len=24)

# # Train PatchTST on full data (2-3 years recommended)
# print("Training PatchTST on full dataset...")
# forecast_model, train_losses = train_wind_pressure_forecaster(
#     csv_path="openmetro_weather_2022.csv",
#     target_features=full_dataset.target_names,
#     seq_len=128,
#     pred_len=24,
#     batch_size=32,
#     epochs=50
# )

# Train Autoencoder on subset (much less data)
print("Training Autoencoder on subset...")

# Choose one of these subset strategies:
# 1. Recent data only (last 6 months)
recent_data = full_dataset.data[-9000:]  # 6 months

# 2. Fixed number of samples
subset_data = full_dataset.data[:5000]  # First 5000 samples

# 3. Seasonal data only
def get_seasonal_data(dates, data, months):
    mask = np.array([date.month in months for date in dates])
    return data[mask]

seasonal_data = get_seasonal_data(full_dataset.dates, full_dataset.data, [6, 7, 8])  # Summer only

# Initialize and train autoencoder on subset
autoencoder = WeatherAutoencoder(time_steps=24, features=full_dataset.num_features, latent_dim=8)

# Use the subset data for training
X_train, X_test, sequences = autoencoder.prepare_data(
    recent_data,
    train_ratio=0.8,
   # Further limit if needed
)

history = autoencoder.train(X_train, X_test, epochs=50, batch_size=32, early_stopping_patience=8)

# Detect anomalies to set threshold
anomalies, mse_scores, threshold, reconstructions = autoencoder.detect_anomalies(subset_data)

#autoencoder.plot_anomalies(data_for_autoencoder, anomalies, mse_scores, threshold, reconstructions)
print(f"Autoencoder trained on {len(subset_data)} samples (vs {len(full_dataset.data)} for PatchTST)")
print(f"Anomaly threshold: {threshold:.4f}")
def save_autoencoder_model(autoencoder, filepath="weather_autoencoder"):
    """Save the autoencoder model and scaler"""
    # Save Keras model
    autoencoder.model.save(f"{filepath}_model.h5")

    # Save scaler parameters
    scaler_params = {
        'mean': autoencoder.scaler.mean_,
        'scale': autoencoder.scaler.scale_,
        'var': autoencoder.scaler.var_,
        'n_samples_seen': autoencoder.scaler.n_samples_seen_
    }
    np.savez(f"{filepath}_scaler.npz", **scaler_params)

    # Save configuration
    config = {
        'time_steps': autoencoder.time_steps,
        'features': autoencoder.features,
        'latent_dim': autoencoder.latent_dim,
        'threshold': autoencoder.threshold
    }
    np.savez(f"{filepath}_config.npz", **config)

    print(f"✅ Autoencoder saved to {filepath}_* files")

save_autoencoder_model(autoencoder, "./cust_train1/weather_autoencoder")