export interface User {
  name: string;
  kisanId: string;
  phone: string;
  location: string;
}

export type Language = 'en' | 'hi';

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  isDemo: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  url: string;
  category: 'Scheme' | 'Market' | 'Tech' | 'Weather';
}

export interface SoilData {
  id: string;
  date: string;
  n: number;
  p: number;
  k: number;
  ph: number;
  crop_recommendations: string[];
  soil_type: string;
  fertilizer_advice: string;
  gemini_analysis: string;
}

export interface DiseaseResult {
  disease_name: string;
  confidence: number;
  treatment_en: string;
  treatment_hi: string;
  is_healthy: boolean;
}

export interface PricePrediction {
  crop: string;
  current_price: number;
  predicted_price: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: 'sell' | 'hold';
  nearest_mandi: string;
  isDemo?: boolean;
}

export enum AppRoute {
  HOME = '/',
  LOGIN = '/login',
  REGISTER = '/register',
  DASHBOARD = '/dashboard',
  SOIL = '/soil',
  LEAF = '/leaf',
  FASALDAAM = '/fasaldaam',
  CHAT = '/chat',
  WEATHER = '/weather',
  MAP = '/map'
}