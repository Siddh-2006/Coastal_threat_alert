from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import numpy as np
import torch
from typing import List
from your_module import WindPressureDataset, WindPressurePatchTST, WeatherAutoencoder

# 1. Load models and dataset at startup
app = FastAPI(title="Live Weather Forecast & Anomaly Detection")

@app.on_event("startup")
def startup_load():
    global dataset, patch_model, autoencoder, target_names

    dataset = WindPressureDataset("openmetro_weather_2022.csv", seq_len=128, pred_len=24)
    target_names = dataset.target_names

    # Load PatchTST forecasting model
    patch_model = WindPressurePatchTST(
        num_features=dataset.num_features,
        seq_len=128,
        pred_len=24
    )
    patch_model.load_state_dict(torch.load("models/patch_model.pt", map_location=torch.device("cpu")))
    patch_model.eval()

    # Load autoencoder model and scaler
    autoencoder = WeatherAutoencoder(time_steps=24, features=dataset.num_features, latent_dim=8)
    import tensorflow as tf, numpy as np
    autoencoder.model = tf.keras.models.load_model("models/weather_autoencoder_model.h5")
    scaler_data = np.load("models/weather_autoencoder_scaler.npz")
    autoencoder.scaler.mean_ = scaler_data["mean"]
    autoencoder.scaler.scale_ = scaler_data["scale"]
    autoencoder.scaler.var_ = scaler_data["var"]
    autoencoder.scaler.n_samples_seen_ = scaler_data["n_samples_seen"]
    config = np.load("models/weather_autoencoder_config.npz")
    autoencoder.threshold = config["threshold"]

# 2. Response schema
class ForecastResponse(BaseModel):
    forecast: List[List[float]]        # [24 x num_features]
    anomalies: List[bool]
    mse_scores: List[float]
    threshold: float
    feature_names: List[str]

# 3. Fetch data from Open-Meteo
def fetch_meteo(lat: float, lon: float, hours: int = 128):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join(target_names),
        "forecast_hours": hours,
        "timezone": "auto"
    }
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    data = resp.json().get("hourly", {})
    if not data:
        raise HTTPException(status_code=502, detail="Invalid response from weather API.")
    return data

# 4. Convert into proper array
def assemble_data(hourly_data, hours: int):
    arr = []
    for feat in target_names:
        if feat not in hourly_data:
            raise HTTPException(status_code=400, detail=f"Missing feature in API response: {feat}")
        arr.append(np.array(hourly_data[feat][:hours]))
    return np.stack(arr, axis=1)  # shape: [hours, num_features]

# 5. Forecast endpoint
@app.post("/forecast_live", response_model=ForecastResponse)
def forecast_live(lat: float, lon: float):
    HOURS_IN = dataset.seq_len + dataset.pred_len
    hourly = fetch_meteo(lat, lon, hours=HOURS_IN)
    data = assemble_data(hourly, HOURS_IN)  # shape: [128, features]

    if data.shape[0] < dataset.seq_len:
        raise HTTPException(status_code=400, detail=f"Need at least {dataset.seq_len} hours of data.")

    seq = data[-dataset.seq_len:]
    normalized = np.hstack([
        dataset.scalers[feat].transform(seq[:, i].reshape(-1, 1))
        for i, feat in enumerate(target_names)
    ])
    x = torch.FloatTensor(normalized).unsqueeze(0)

    with torch.no_grad():
        pred_norm = patch_model(x).squeeze(0).cpu().numpy()

    pred_denorm = np.hstack([
        dataset.scalers[feat].inverse_transform(pred_norm[:, i].reshape(-1, 1))
        for i, feat in enumerate(target_names)
    ])

    anomalies, mse_scores, threshold, _ = autoencoder.detect_anomalies(data)

    return ForecastResponse(
        forecast=pred_denorm.tolist(),
        anomalies=anomalies.tolist(),
        mse_scores=mse_scores.tolist(),
        threshold=float(threshold),
        feature_names=target_names
    )
