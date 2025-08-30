import requests
from datetime import datetime, timedelta

# API endpoint (change to your running FastAPI server)
url = "http://127.0.0.1:9000/forecast"

# Build request payload
payload = {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "start_date": (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d"),
    "end_date": (datetime.now()-timedelta(days=1)).strftime("%Y-%m-%d")
}

# Send request
response = requests.post(url, json=payload)

# Print results
if response.status_code == 200:
    print("✅ Forecast Result:")
    print(response.json())
else:
    print(f"❌ Error {response.status_code}: {response.text}")
