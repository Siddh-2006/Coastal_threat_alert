import pandas as pd
import numpy as np
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler

# ----------------------
# 1. Wind Speed & Pressure Dataset
# ----------------------
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

# ----------------------
# 2. PatchTST for Wind & Pressure
# ----------------------
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

# ----------------------
# 3. Training Function
# ----------------------
def train_wind_pressure_forecaster(csv_path, seq_len=128, pred_len=24,
                                   batch_size=32, epochs=100, learning_rate=0.001):

    # Load dataset
    dataset = WindPressureDataset(csv_path, seq_len, pred_len)

    # Create data loaders
    train_loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    # Initialize model
    model = WindPressurePatchTST(
        num_features=dataset.num_features,
        seq_len=seq_len,
        pred_len=pred_len,
        patch_len=16,
        stride=8,
        d_model=64,
        n_layers=2,
        n_heads=4
    )

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    model.to(device)

    # Loss and optimizer
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=5, factor=0.5)

    # Training loop
    train_losses = []

    print("Training wind speed and pressure forecaster...")
    for epoch in range(epochs):
        model.train()
        total_loss = 0

        for batch_seq, batch_target in train_loader:
            batch_seq = batch_seq.to(device)
            batch_target = batch_target.to(device)

            optimizer.zero_grad()
            predictions = model(batch_seq)

            loss = criterion(predictions, batch_target)
            loss.backward()

            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        train_losses.append(avg_loss)
        scheduler.step(avg_loss)

        if (epoch + 1) % 5 == 0:
            print(f'Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.6f}')

    return model, dataset, train_losses

# ----------------------
# 4. Prediction Functions
# ----------------------
def predict_wind_pressure(model, dataset, num_predictions=3):
    """Make wind speed and pressure predictions"""
    device = next(model.parameters()).device
    model.eval()

    predictions = []
    actuals = []

    with torch.no_grad():
        for i in range(min(num_predictions, len(dataset.val_sequences))):
            # Get sequence and target
            sequence = torch.FloatTensor(dataset.val_sequences[i]).unsqueeze(0).to(device)
            actual = dataset.val_targets[i]

            # Predict
            pred = model(sequence)
            pred = pred.squeeze(0).cpu().numpy()

            # Store predictions and actuals
            predictions.append(pred)
            actuals.append(actual)

            # Denormalize for display
            wind_pred_denorm = dataset.denormalize(pred[:, 0], 0)  # surface pressure
            pressure_pred_denorm = dataset.denormalize(pred[:, 1], 1)  # Pressure tendency
            wind_10_pred_denorm = dataset.denormalize(pred[:, 2], 2)  # wind_speed_10
            wind_100_pred_denorm = dataset.denormalize(pred[:, 3], 3)  # wind_speed_100
            wind_gust_pred_denorm = dataset.denormalize(pred[:, 4], 4)  # wind_gust

            wind_actual_denorm = dataset.denormalize(actual[:, 0], 0)
            pressure_actual_denorm = dataset.denormalize(actual[:, 1], 1)
            wind_10_actual_denorm = dataset.denormalize(actual[:, 1], 1)
            wind_100_actual_denorm = dataset.denormalize(actual[:, 1], 1)
            wind_gust_actual_denorm = dataset.denormalize(actual[:, 1], 1)

            print(f"\n🔮 Prediction {i+1}:")
            print(f"Wind Speed: {wind_pred_denorm[-1]:.1f} m/s (actual: {wind_actual_denorm[-1]:.1f} m/s)")
            print(f"Pressure: {pressure_pred_denorm[-1]:.1f} hPa (actual: {pressure_actual_denorm[-1]:.1f} hPa)")
            print(f"Wind MAE: {np.mean(np.abs(wind_pred_denorm - wind_actual_denorm)):.2f} m/s")
            print(f"Pressure MAE: {np.mean(np.abs(pressure_pred_denorm - pressure_actual_denorm)):.2f} hPa")

    return predictions, actuals

def plot_predictions(predictions, actuals, dataset, prediction_idx=0):
    """Plot predictions vs actuals for all 12 target features"""
    pred = predictions[prediction_idx]
    actual = actuals[prediction_idx]
    hours = range(len(pred))

    # Denormalize all features for plotting
    denorm_predictions = []
    denorm_actuals = []

    for i in range(len(dataset.target_names)):
        pred_denorm = dataset.denormalize(pred[:, i], i)
        actual_denorm = dataset.denormalize(actual[:, i], i)
        denorm_predictions.append(pred_denorm)
        denorm_actuals.append(actual_denorm)

    # Create subplots - 4 rows x 3 columns for 12 features
    fig, axes = plt.subplots(4, 3, figsize=(18, 16))
    axes = axes.flatten()  # Flatten to 1D array for easy indexing

    # Define units for each feature for better labeling
    units = {
        'surface_pressure': 'hPa',
        'pressure_tendency': 'hPa/3h',
        'wind_speed_10m': 'm/s',
        'wind_speed_100m': 'm/s',
        'wind_gusts_10m': 'm/s',
        'wind_shear': 'm/s',
        'relative_humidity_2m': '%',
        'dew_point_2m': '°C',
        'temperature_2m': '°C',
        'precipitation': 'mm',
        'cloud_cover': '%',
        'wind_direction_10m': 'degrees'
    }

    # Colors for better visualization
    colors = ['red', 'blue', 'green', 'purple', 'orange', 'brown',
              'pink', 'gray', 'olive', 'cyan', 'magenta', 'teal']

    # Plot each feature
    for i, feature_name in enumerate(dataset.target_names):
        ax = axes[i]
        pred_data = denorm_predictions[i]
        actual_data = denorm_actuals[i]

        ax.plot(hours, pred_data, color=colors[i], linestyle='-',
                label='Predicted', linewidth=2, alpha=0.8)
        ax.plot(hours, actual_data, color=colors[i], linestyle='--',
                label='Actual', linewidth=2, alpha=0.8)

        ax.set_title(f'{feature_name.replace("_", " ").title()}', fontsize=12, fontweight='bold')
        ax.set_xlabel('Hours Ahead', fontsize=10)
        ax.set_ylabel(units.get(feature_name, 'units'), fontsize=10)
        ax.legend(fontsize=9)
        ax.grid(True, alpha=0.3)

        # Calculate and display statistics in the plot
        mae = np.mean(np.abs(pred_data - actual_data))
        rmse = np.sqrt(np.mean((pred_data - actual_data)**2))

        # Add text box with statistics
        textstr = f'MAE: {mae:.2f}\nRMSE: {rmse:.2f}'
        props = dict(boxstyle='round', facecolor='wheat', alpha=0.8)
        ax.text(0.05, 0.95, textstr, transform=ax.transAxes, fontsize=9,
                verticalalignment='top', bbox=props)

    # Hide any unused subplots
    for i in range(len(dataset.target_names), len(axes)):
        axes[i].set_visible(False)

    plt.tight_layout()
    plt.suptitle(f'Weather Forecast Prediction #{prediction_idx + 1}',
                 fontsize=16, fontweight='bold', y=1.02)
    plt.show()

    # Print comprehensive statistics
    print(f"\n📊 Prediction {prediction_idx + 1} Detailed Statistics:")
    print("=" * 60)

    for i, feature_name in enumerate(dataset.target_names):
        pred_data = denorm_predictions[i]
        actual_data = denorm_actuals[i]

        mae = np.mean(np.abs(pred_data - actual_data))
        rmse = np.sqrt(np.mean((pred_data - actual_data)**2))
        bias = np.mean(pred_data - actual_data)  # Forecast bias

        print(f"{feature_name:20s}: MAE={mae:6.2f} {units.get(feature_name, '')}, "
              f"RMSE={rmse:6.2f}, Bias={bias:6.2f}")

    # Overall statistics
    print("=" * 60)
    overall_mae = np.mean([np.mean(np.abs(denorm_predictions[i] - denorm_actuals[i]))
                          for i in range(len(dataset.target_names))])
    overall_rmse = np.mean([np.sqrt(np.mean((denorm_predictions[i] - denorm_actuals[i])**2))
                           for i in range(len(dataset.target_names))])

    print(f"{'OVERALL':20s}: MAE={overall_mae:6.2f}, RMSE={overall_rmse:6.2f}")

# Alternative: Simplified version for specific feature groups
def plot_feature_groups(predictions, actuals, dataset, prediction_idx=0):
    """Plot features grouped by category"""
    pred = predictions[prediction_idx]
    actual = actuals[prediction_idx]
    hours = range(len(pred))

    # Group features by category
    feature_groups = {
        'Wind Features': ['wind_speed_10m', 'wind_speed_100m', 'wind_gusts_10m', 'wind_shear', 'wind_direction_10m'],
        'Pressure Features': ['surface_pressure', 'pressure_tendency'],
        'Temperature/Humidity': ['temperature_2m', 'dew_point_2m', 'relative_humidity_2m'],
        'Precipitation/Clouds': ['precipitation', 'cloud_cover']
    }

    units = {
        'surface_pressure': 'hPa', 'pressure_tendency': 'hPa/3h',
        'wind_speed_10m': 'm/s', 'wind_speed_100m': 'm/s', 'wind_gusts_10m': 'm/s',
        'wind_shear': 'm/s', 'wind_direction_10m': '°',
        'relative_humidity_2m': '%', 'dew_point_2m': '°C', 'temperature_2m': '°C',
        'precipitation': 'mm', 'cloud_cover': '%'
    }

    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    axes = axes.flatten()

    for group_idx, (group_name, features) in enumerate(feature_groups.items()):
        ax = axes[group_idx]

        for feature_name in features:
            if feature_name in dataset.target_names:
                feature_idx = dataset.target_names.index(feature_name)
                pred_data = dataset.denormalize(pred[:, feature_idx], feature_idx)
                actual_data = dataset.denormalize(actual[:, feature_idx], feature_idx)

                ax.plot(hours, pred_data, '-', label=f'Pred {feature_name}', linewidth=1.5)
                ax.plot(hours, actual_data, '--', label=f'Actual {feature_name}', linewidth=1.5, alpha=0.7)

        ax.set_title(group_name, fontsize=12, fontweight='bold')
        ax.set_xlabel('Hours Ahead')
        ax.set_ylabel('Value')
        ax.legend(fontsize=8)
        ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()

# Usage example:
# plot_predictions(predictions, actuals, dataset, prediction_idx=0)
# plot_feature_groups(predictions, actuals, dataset, prediction_idx=0)

def plot_training_loss(train_losses):
    """Plot training loss"""
    plt.figure(figsize=(10, 5))
    plt.plot(train_losses, 'b-', linewidth=2)
    plt.title('Training Loss', fontsize=16)
    plt.xlabel('Epoch', fontsize=12)
    plt.ylabel('MSE Loss', fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.yscale('log')
    plt.show()

# ----------------------
# 5. Main Execution
# ----------------------
if __name__ == "__main__":
    print("🌪️ Wind Speed & Pressure Forecaster using PatchTST")
    print("=" * 60)

    # Train the model
    model, dataset, train_losses = train_wind_pressure_forecaster(
        csv_path="openmetro_weather_2022.csv",
        seq_len=128,
        pred_len=24,
        batch_size=32,
        epochs=100,
        learning_rate=0.001
    )
     # Save forecasting model


    # Plot training loss
    plot_training_loss(train_losses)

    # Make predictions
    print("\n" + "=" * 60)
    print("Making predictions...")
    predictions, actuals = predict_wind_pressure(model, dataset, num_predictions=3)

    # Plot results
    plot_predictions(predictions, actuals, dataset, prediction_idx=0)

    print("\n" + "=" * 60)
    print("✅ Wind Speed & Pressure Forecasting Completed!")
    print(f"Trained on {len(dataset.train_sequences)} sequences")
    print(f"Features: {dataset.target_names}")
def save_forecast_model_simple(model, dataset, filepath="wind_pressure_forecaster.pth"):
    """Simpler save function without trying to extract model config"""
    save_dict = {
        'model_state_dict': model.state_dict(),
        'dataset_scalers': {name: {
            'mean_': scaler.mean_,
            'scale_': scaler.scale_,
            'var_': scaler.var_,
            'n_samples_seen_': scaler.n_samples_seen_
        } for name, scaler in dataset.scalers.items()},
        'target_names': dataset.target_names,
        'model_type': 'WindPressurePatchTST'  # Identifier for loading
    }
    torch.save(save_dict, filepath)
    print(f"✅ Forecast model saved to {filepath}")
save_forecast_model_simple(model, dataset, "./cust_train1/sundarban.pth")