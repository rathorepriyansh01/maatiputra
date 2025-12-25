import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { DiseaseResult, PricePrediction, Language } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// --- DUMMY DATA FOR FALLBACKS ---

const DUMMY_LEAF_RESULT: DiseaseResult = {
  disease_name: "Leaf Blight",
  confidence: 87,
  treatment_en: "Mancozeb 2g/L spray. Ensure proper drainage to reduce moisture.",
  treatment_hi: "मैंकोजेब 2 ग्राम/लीटर का छिड़काव करें। नमी कम करने के लिए उचित जल निकासी सुनिश्चित करें।",
  is_healthy: false
};

const DUMMY_SOIL_RESULT = {
  soil_type: "Loamy",
  crop_recommendations: ["Wheat", "Soybean", "Mustard"],
  fertilizer_advice: "Urea 50kg/acre + DAP 25kg/acre. Add organic compost.",
  gemini_analysis: "The soil appears fertile but slightly acidic. Requires lime treatment for optimal pH balance."
};

const DUMMY_PRICE_PREDICTION: PricePrediction = {
  crop: "Wheat",
  current_price: 2250,
  predicted_price: 2310,
  trend: 'stable',
  recommendation: 'hold',
  nearest_mandi: "Bhopal",
  isDemo: true
};

const WMO_CODES: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
  71: "Slight snow", 80: "Slight showers", 95: "Thunderstorm"
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const cleanJson = (text: string) => {
  if (!text) return "{}";
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const checkApiKey = () => {
  return !!process.env.API_KEY;
};

// 1. Soil Analysis
export const analyzeSoilWithGemini = async (textData: string, lang: Language) => {
  await delay(2000);

  if (!checkApiKey()) {
    console.warn("Using Demo Data for Soil Analysis");
    return DUMMY_SOIL_RESULT;
  }
  
  const model = "gemini-2.5-flash";
  const prompt = `
    You are an expert Indian Agronomist. Analyze this soil health card data:
    ${textData}
    
    Current User Language: ${lang === 'hi' ? 'Hindi (हिंदी)' : 'English'}.
    
    Provide the response in JSON format.
    IMPORTANT: If the user language is Hindi, translate all text fields (advice, analysis, crop names) to Hindi.
    
    Structure:
    {
      "soil_type": "string",
      "crop_recommendations": ["string", "string", "string"],
      "fertilizer_advice": "string",
      "gemini_analysis": "string (short summary)"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Soil Analysis API Error:", error);
    return DUMMY_SOIL_RESULT;
  }
};

// 2. Leaf Disease Detection
export const analyzeLeafImage = async (base64Image: string, lang: Language): Promise<DiseaseResult> => {
  if (!checkApiKey()) {
    await delay(2500); 
    return DUMMY_LEAF_RESULT;
  }

  const model = "gemini-2.5-flash-image";
  const prompt = `
    Analyze this image. Is it a plant leaf? 
    If NO, return {"is_leaf": false}.
    If YES, identify any disease. If healthy, say "Healthy".
    
    Current User Language: ${lang === 'hi' ? 'Hindi' : 'English'}.
    
    Strictly Output RAW JSON only.
    Structure:
    {
      "is_leaf": boolean,
      "disease_name": "string (In ${lang === 'hi' ? 'Hindi' : 'English'})",
      "confidence": number (0-100),
      "treatment_en": "string (Always English)",
      "treatment_hi": "string (Always Hindi translation)",
      "is_healthy": boolean
    }
  `;

  try {
    const apiCall = ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
    });

    const response: any = await Promise.race([
      apiCall,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 15000))
    ]);

    const cleanText = cleanJson(response.text);
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Leaf Vision Error:", error);
    return DUMMY_LEAF_RESULT;
  }
};

// 3. Fasaldaam
export const predictCropPrice = async (crop: string, district: string, month: string): Promise<PricePrediction> => {
  if (!checkApiKey()) {
    await delay(1500);
    return { ...DUMMY_PRICE_PREDICTION, crop: crop || 'Wheat', nearest_mandi: district || 'Local Mandi', isDemo: true };
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    Predict market trend for ${crop} in ${district} for ${month}.
    Return JSON:
    {
      "current_price": number,
      "predicted_price": number,
      "trend": "up" | "down" | "stable",
      "recommendation": "sell" | "hold",
      "nearest_mandi": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const result = JSON.parse(response.text || "{}");
    return {
      crop: crop,
      current_price: result.current_price || 2000,
      predicted_price: result.predicted_price || 2100,
      trend: result.trend || 'stable',
      recommendation: result.recommendation || 'hold',
      nearest_mandi: result.nearest_mandi || district,
      isDemo: false
    };
  } catch (error) {
    return { ...DUMMY_PRICE_PREDICTION, crop, nearest_mandi: district, isDemo: true };
  }
};

// 4. Chatbot
export const getChatResponse = async (
  history: any[], 
  message: string, 
  userLocation: string, 
  coords: { lat: number; lon: number } | null,
  lang: Language
) => {
  if (!checkApiKey()) {
    await delay(1000);
    return {
      text: lang === 'hi' 
        ? "यह एक डेमो प्रतिक्रिया है। एआई सेवाएँ वर्तमान में अनुपलब्ध हैं।" 
        : "This is a demo response. AI services are currently unavailable.",
      groundingMetadata: null
    };
  }
  
  const model = "gemini-2.5-flash";
  
  const weatherTool: FunctionDeclaration = {
    name: "get_current_weather",
    description: "Get the live current weather and daily forecast for a specific location.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: { 
          type: Type.STRING,
          description: "The city/town name. If the user refers to 'here' or doesn't specify, use the Context Location."
        },
      },
      required: ["location"],
    },
  };

  // Default to Bhopal (Central India) if no coords provided
  const effectiveCoords = coords || { lat: 23.2599, lon: 77.4126 };

  const systemInstruction = `
    You are 'Maatiputra', a friendly agricultural expert.
    Context Location: ${userLocation}.
    Response Language: ${lang === 'hi' ? 'HINDI (Devanagari script)' : 'ENGLISH'}.
    
    Rules:
    1. If asked about weather, use 'get_current_weather'.
    2. If asked about places (shops, mandis, offices) or geography, use the Google Maps tool implicitly.
    3. Keep answers concise, practical, and helpful for Indian farmers.
  `;

  try {
    const chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.content || " " }]
    }));

    const chat = ai.chats.create({
      model,
      config: { 
        systemInstruction,
        tools: [
          { functionDeclarations: [weatherTool] },
          { googleMaps: {} }
        ],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: effectiveCoords.lat,
              longitude: effectiveCoords.lon
            }
          }
        }
      },
      history: chatHistory
    });

    let result = await chat.sendMessage({ message: message });

    const calls = result.functionCalls;
    if (calls && calls.length > 0) {
      const call = calls[0];
      if (call.name === "get_current_weather") {
        const args: any = call.args || {};
        const locQuery = args.location || userLocation;
        
        let weatherData: any = { error: "Service Unavailable" };
        try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locQuery)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();
            if (geoData.results?.length > 0) {
                const { latitude, longitude, name, admin1 } = geoData.results[0];
                const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
                const wData = await wRes.json();
                
                const currentCondition = WMO_CODES[wData.current.weather_code] || "Unknown";
                const dailyConditions = (wData.daily.weather_code || []).map((c: number) => WMO_CODES[c] || "Unknown");

                weatherData = {
                  location: `${name}, ${admin1 || ''}`,
                  current: {
                    temp_c: wData.current.temperature_2m,
                    humidity: wData.current.relative_humidity_2m,
                    wind_speed_kmh: wData.current.wind_speed_10m,
                    condition: currentCondition
                  },
                  daily_forecast: {
                    dates: wData.daily.time,
                    max_temp_c: wData.daily.temperature_2m_max,
                    min_temp_c: wData.daily.temperature_2m_min,
                    rain_mm: wData.daily.precipitation_sum,
                    conditions: dailyConditions
                  }
                };
            } else {
               weatherData = { error: "Location not found" };
            }
        } catch(e) { console.error(e) }

        // Send the function response
        result = await chat.sendMessage({
            message: [{
                functionResponse: {
                    name: "get_current_weather",
                    response: { result: weatherData },
                    id: call.id
                }
            }]
        });
      }
    }
    
    // Return text AND grounding metadata
    return {
      text: result.text || "",
      groundingMetadata: result.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Chat Error:", error);
    return {
      text: lang === 'hi' ? "क्षमा करें, मैं अभी जवाब नहीं दे सकता।" : "Sorry, I am unable to answer right now.",
      groundingMetadata: null
    };
  }
};
