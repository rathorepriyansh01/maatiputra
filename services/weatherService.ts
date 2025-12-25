import { WeatherData } from '../types';

// Default Demo Data (Bhopal)
const DEMO_WEATHER: WeatherData = {
  temp: 28,
  condition: "Clear Sky",
  humidity: 65,
  windSpeed: 8,
  location: "Bhopal (Demo)",
  isDemo: true
};

const WMO_CODES: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 80: "Slight showers", 95: "Thunderstorm"
};

export const fetchWeather = async (lat?: number, lon?: number): Promise<WeatherData> => {
  // If no coordinates provided, return demo data
  if (!lat || !lon) {
    return DEMO_WEATHER;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s Timeout

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Weather API failed");

    const data = await response.json();
    const current = data.current;

    return {
      temp: Math.round(current.temperature_2m),
      condition: WMO_CODES[current.weather_code] || "Unknown",
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      location: "Current Location",
      isDemo: false
    };

  } catch (error) {
    console.warn("Weather fetch failed, using fallback:", error);
    return DEMO_WEATHER;
  }
};

export const fetchForecast = async (lat: number, lon: number) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&forecast_days=7`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.daily) {
      return data.daily.time.map((t: string, i: number) => ({
        date: new Date(t).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        maxTemp: data.daily.temperature_2m_max[i],
        minTemp: data.daily.temperature_2m_min[i],
        rain: data.daily.precipitation_sum[i],
        code: data.daily.weather_code[i]
      }));
    }
    return [];
  } catch (e) {
    console.error("Forecast Error:", e);
    return [];
  }
};

export const getCurrentLocation = (): Promise<{ lat: number; lon: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.warn("Location permission denied or unavailable:", error.message);
        resolve(null);
      },
      { timeout: 5000, enableHighAccuracy: false }
    );
  });
};