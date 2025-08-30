import requests
import pandas as pd
from datetime import datetime, timedelta
def fetch_historical_weather_data(latitude, longitude, start_date, end_date,save_path):
    """
    Fetch historical weather data from Open-Meteo API.
    """
    print(f"Fetching historical data from {start_date} to {end_date}...")

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

        df = pd.DataFrame(data['hourly'])
        df['time'] = pd.to_datetime(df['time'])
        df.set_index('time', inplace=True)

        # Derived features
        df['pressure_tendency'] = df['surface_pressure'].diff(3)   # 3-hour pressure change
        df['wind_shear'] = df['wind_speed_100m'] - df['wind_speed_10m']

        print(f"✅ Fetched {len(df)} hourly records with features: {list(df.columns)}")
        df.to_csv(save_path)
        print(f"💾 Data saved to {save_path}")
        return df

    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return None
end_date = (datetime.now()-timedelta(days=1)).strftime("%Y-%m-%d")
start_date = (datetime.now() - timedelta(days=365*7)).strftime("%Y-%m-%d")
df = fetch_historical_weather_data(20.97,89.51, start_date, end_date, save_path="openmetro_weather_2022.csv")
if df is not None:
    df = df.reset_index()                     # time index → column
    df = df.rename(columns={"time": "date"}) # rename to 'date' for PatchTST
    df.to_csv("openmetro_weather_2022.csv", index=False)
    print("💾 CSV converted to PatchTST format with 'date' column")
    print(df.head())