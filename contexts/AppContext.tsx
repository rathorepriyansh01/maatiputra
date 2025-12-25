import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  locationEnabled: boolean;
  toggleLocation: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  "dashboard": { en: "Dashboard", hi: "डैशबोर्ड" },
  "soil_analysis": { en: "Soil Analysis", hi: "मृदा परीक्षण" },
  "leaf_health": { en: "Leaf Health", hi: "फसल रोग" },
  "fasaldaam": { en: "Fasaldaam", hi: "फसल दाम" },
  "sahayak": { en: "Sahayak (Chat)", hi: "सहायक (चैट)" },
  "welcome": { en: "Namaste", hi: "नमस्ते" },
  "weather": { en: "Weather", hi: "मौसम" },
  "weather_demo": { en: "Demo Data", hi: "डेमो डेटा" },
  "location_on": { en: "Location: ON", hi: "स्थान: चालू" },
  "location_off": { en: "Location: OFF", hi: "स्थान: बंद" },
  "using_default": { en: "Using Default City", hi: "डिफ़ॉल्ट शहर" },
  "check_soil": { en: "Check Soil Health", hi: "मृदा स्वास्थ्य जांचें" },
  "scan_crop": { en: "Scan Crop for Disease", hi: "फसल रोग स्कैन करें" },
  "mandi_rates": { en: "Mandi Rates", hi: "मंडी भाव" },
  "view_all": { en: "View All", hi: "सभी देखें" },
  "logout": { en: "Logout", hi: "लॉग आउट" },
  "analyzing": { en: "Analyzing...", hi: "विश्लेषण हो रहा है..." },
  "upload_text": { en: "Upload Soil Health Card", hi: "मृदा स्वास्थ्य कार्ड अपलोड करें" },
  "click_upload": { en: "Click to Upload", hi: "अपलोड करने के लिए क्लिक करें" },
  "diagnose": { en: "Diagnose", hi: "निदान करें" },
  "healthy": { en: "Healthy", hi: "स्वस्थ" },
  "disease_detected": { en: "Disease Detected", hi: "रोग का पता चला" },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [locationEnabled, setLocationEnabled] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang) setLanguageState(savedLang);

    const savedLoc = localStorage.getItem('location_enabled');
    if (savedLoc !== null) setLocationEnabled(savedLoc === 'true');
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const toggleLocation = () => {
    const newState = !locationEnabled;
    setLocationEnabled(newState);
    localStorage.setItem('location_enabled', String(newState));
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, locationEnabled, toggleLocation, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};