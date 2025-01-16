import requests
import statistics
from datetime import datetime, timedelta

class WeatherAnalyzer:
    def __init__(self, api_key="c59af85b5caea78569d616126ca7928e"):
        self.api_key = api_key
        self.current_url = "https://api.openweathermap.org/data/2.5/weather"
        self.forecast_url = "https://api.openweathermap.org/data/2.5/forecast"
        self.geocode_url = "https://api.openweathermap.org/geo/1.0/reverse"

    def get_weather_data(self, city_name):
        try:
            current = self._fetch_current_weather(city_name)
            forecast = self._fetch_hourly_forecast(city_name)
            
            return {
                "temperature_data": self._analyze_temperature(current, forecast),
                "humidity_data": self._analyze_humidity(current, forecast),
                "weather_conditions": self._analyze_conditions(current, forecast),
                "water_management": self._analyze_water_management(current),
                "historical_patterns": self._analyze_patterns(forecast)
            }
        except Exception as e:
            return {"error": str(e)}

    def _fetch_current_weather(self, city_name):
        params = {"q": city_name, "appid": self.api_key, "units": "metric"}
        response = requests.get(self.current_url, params=params)
        return response.json()

    def _fetch_hourly_forecast(self, city_name):
        params = {"q": city_name, "appid": self.api_key, "units": "metric"}
        response = requests.get(self.forecast_url, params=params)
        return response.json()

    def _analyze_temperature(self, current, forecast):
        temps = [item['main']['temp'] for item in forecast['list'][:8]]
        return {
            "current": current['main']['temp'],
            "forecast": [{"time": item['dt_txt'], "temp": item['main']['temp']} 
                        for item in forecast['list'][:8]],
            "max": max(temps),
            "min": min(temps),
            "avg": round(statistics.mean(temps), 1),
            "trend": "rising" if temps[-1] > temps[0] else "falling"
        }

    def _analyze_humidity(self, current, forecast):
        humidity_data = [item['main']['humidity'] for item in forecast['list'][:8]]
        return {
            "current": current['main']['humidity'],
            "forecast": [{"time": item['dt_txt'], "humidity": item['main']['humidity']} 
                        for item in forecast['list'][:8]],
            "high_humidity_hours": sum(1 for h in humidity_data if h > 70) * 3,
            "trend": "rising" if humidity_data[-1] > humidity_data[0] else "falling"
        }

    def _analyze_conditions(self, current, forecast):
        return {
            "current": current['weather'][0]['description'],
            "forecast": [{"time": item['dt_txt'], "condition": item['weather'][0]['description']} 
                        for item in forecast['list'][:8]],
            "precipitation_probability": self._calculate_precipitation_probability(forecast)
        }

    def _analyze_water_management(self, current):
        return {
            "temperature": current['main']['temp'],
            "humidity": current['main']['humidity'],
            "wind_speed": current['wind']['speed'],
            "conditions": current['weather'][0]['description']
        }

    def _analyze_patterns(self, forecast):
        rain_data = [forecast.get('rain', {}).get('3h', 0) for forecast in forecast['list'][:8]]
        temps = [item['main']['temp'] for item in forecast['list'][:8]]
        return {
            "total_rainfall": sum(rain_data),
            "temp_range": {"min": min(temps), "max": max(temps)},
            "temp_trend": "rising" if temps[-1] > temps[0] else "falling"
        }

    def _calculate_precipitation_probability(self, forecast):
        rain_count = sum(1 for item in forecast['list'][:8] if 'rain' in item)
        return round((rain_count / 8) * 100, 1)

def get_7_day_forecast(city):
    """
    Return a 7-day forecast for the given city.
    """
    try:
        api_key = "c59af85b5caea78569d616126ca7928e"
        base_url = "https://api.openweathermap.org/data/2.5/forecast"
        
        params = {
            "q": city,
            "appid": api_key,
            "units": "metric",
            "cnt": 7  # Get 7 days of data
        }
        
        response = requests.get(base_url, params=params)
        data = response.json()
        
        if response.status_code != 200:
            return {"error": data.get("message", "Failed to fetch weather data")}
            
        # Get current date for reference
        current_date = datetime.now()
        
        forecast = []
        for i in range(7):
            next_date = current_date + timedelta(days=i)
            forecast.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "day": next_date.strftime("%A"),
                "temp": round(data['list'][i]['main']['temp']),
                "condition": data['list'][i]['weather'][0]['description']
            })
            
        return {"forecast": forecast}
    except Exception as e:
        return {"error": str(e)}
