import React, { useState, useEffect, useRef } from 'react';
import { getChatResponse } from '../services/geminiService';
import { fetchWeather } from '../services/weatherService';
import { Send, Mic, User as UserIcon, Bot, MapPin, CloudSun, Droplets, Wind, Thermometer, Info } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { getCurrentLocation } from '../services/weatherService';
import { WeatherData } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  groundingMetadata?: any;
}

interface ChatAssistantProps {
  userLocation?: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ userLocation }) => {
  const { language, t } = useAppContext();
  const [input, setInput] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  
  const welcomeMsg = language === 'hi' 
    ? "नमस्ते! मैं माटीपुत्र सहायक हूँ। आप मुझसे मौसम, आस-पास की दुकानों, या फसल के बारे में पूछ सकते हैं।"
    : `Namaste! I am Maatiputra Sahayak. Ask me about weather, nearby shops, crop prices, or soil health.`;

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: welcomeMsg }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const locationContext = userLocation || "Indore, Madhya Pradesh";

  useEffect(() => {
    const initAssistant = async () => {
      const loc = await getCurrentLocation();
      if (loc) {
        setCoords(loc);
        const wData = await fetchWeather(loc.lat, loc.lon);
        setWeather(wData);
      } else {
        // Fallback to demo weather
        const wData = await fetchWeather();
        setWeather(wData);
      }
    };
    initAssistant();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, weather]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await getChatResponse(history, input, locationContext, coords, language);
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        content: response.text || "...",
        groundingMetadata: response.groundingMetadata
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: "Connection Error." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getWeatherOutlook = (w: WeatherData) => {
    if (language === 'hi') {
      if (w.condition.toLowerCase().includes('rain')) return "आज छिड़काव न करें, बारिश की संभावना है।";
      if (w.temp > 35) return "तेज गर्मी: सिंचाई का ध्यान रखें।";
      return "खेती के कामों के लिए आज का दिन अच्छा है।";
    }
    if (w.condition.toLowerCase().includes('rain')) return "Avoid spraying today, rain expected.";
    if (w.temp > 35) return "High heat: Ensure proper irrigation.";
    return "Great day for regular farm activities.";
  };

  const renderGroundingSources = (metadata: any) => {
    if (!metadata || !metadata.groundingChunks) return null;
    const links = metadata.groundingChunks
      .map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
      .filter(Boolean);

    if (links.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-[10px] font-black text-gray-700 mb-2 flex items-center gap-1 uppercase tracking-widest">
          <MapPin className="w-3 h-3" /> Sources (Google Maps)
        </p>
        <div className="flex flex-wrap gap-2">
          {links.map((link: any, idx: number) => (
            <a 
              key={idx}
              href={link.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-gray-50 text-agri-900 text-[10px] font-black rounded border-2 border-gray-200 hover:bg-agri-100 hover:border-agri-400 transition truncate max-w-[180px]"
            >
              {link.title || "View Map"}
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-white md:m-4 md:rounded-2xl md:shadow-xl md:border-2 md:border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-agri-800 p-4 text-white flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full border border-white/10">
             <Bot className="w-6 h-6 text-green-300" />
          </div>
          <div>
            <h2 className="font-black text-lg tracking-tight uppercase">{t('sahayak')}</h2>
            <p className="text-[10px] text-green-200 font-black flex items-center gap-1 uppercase tracking-widest">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span>
              Live • AI Specialist
            </p>
          </div>
        </div>
        {weather && (
          <div className="hidden sm:flex items-center gap-4 bg-white/10 px-4 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
             <div className="flex items-center gap-1.5 border-r border-white/20 pr-4">
               <Thermometer className="w-4 h-4 text-orange-300" />
               <span className="font-black text-sm">{weather.temp}°C</span>
             </div>
             <div className="flex items-center gap-1.5">
               <CloudSun className="w-4 h-4 text-yellow-300" />
               <span className="font-black text-xs uppercase">{weather.condition}</span>
             </div>
          </div>
        )}
      </div>

      {/* Weather Integrated Bar (Agricultural Outlook) */}
      {weather && (
        <div className="bg-agri-50 border-b-2 border-agri-100 p-3 flex flex-wrap items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-agri-900 bg-white px-2.5 py-1 rounded-lg border border-agri-200 shadow-sm">
                <Wind className="w-3 h-3" />
                <span className="text-[10px] font-black">{weather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center gap-1 text-agri-900 bg-white px-2.5 py-1 rounded-lg border border-agri-200 shadow-sm">
                <Droplets className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] font-black">{weather.humidity}% Humidity</span>
              </div>
           </div>
           <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border-2 border-agri-200 shadow-sm">
              <Info className="w-3.5 h-3.5 text-agri-700" />
              <p className="text-[11px] font-black text-agri-950 uppercase tracking-tighter">
                {language === 'hi' ? 'आज का सुझाव: ' : 'Outlook: '} 
                <span className="text-agri-700">{getWeatherOutlook(weather)}</span>
              </p>
           </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 ${msg.role === 'user' ? 'bg-gray-900 border-gray-700' : 'bg-agri-700 border-agri-900'}`}>
                {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div 
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md font-medium ${
                  msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-none border border-gray-800' 
                  : 'bg-white text-gray-900 border-2 border-gray-100 rounded-tl-none'
                }`}
              >
                {msg.content}
                {msg.role === 'model' && renderGroundingSources(msg.groundingMetadata)}
              </div>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="flex max-w-[70%] gap-3">
               <div className="w-8 h-8 rounded-full bg-agri-700 border-2 border-agri-900 flex items-center justify-center flex-shrink-0 shadow-sm">
                 <Bot className="w-4 h-4 text-white" />
               </div>
               <div className="bg-white p-4 rounded-2xl rounded-tl-none border-2 border-gray-100 shadow-md">
                 <div className="flex gap-1.5">
                   <span className="w-2 h-2 bg-agri-600 rounded-full animate-bounce"></span>
                   <span className="w-2 h-2 bg-agri-600 rounded-full animate-bounce delay-75"></span>
                   <span className="w-2 h-2 bg-agri-600 rounded-full animate-bounce delay-150"></span>
                 </div>
               </div>
             </div>
           </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t-2 border-gray-100">
        <div className="relative flex items-center gap-3">
           <button className="p-3 text-gray-600 hover:text-agri-700 hover:bg-agri-50 rounded-full transition border border-transparent hover:border-agri-100">
             <Mic className="w-5 h-5" />
           </button>
           <div className="flex-1 relative">
             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={handleKeyPress}
               placeholder={language === 'hi' ? "मंडी भाव, मौसम या खाद के बारे में पूछें..." : "Ask about mandi rates, weather, or fertilizer..."}
               className="w-full bg-gray-100 text-gray-900 placeholder-gray-500 border-2 border-transparent rounded-full py-3.5 px-6 focus:ring-0 focus:border-agri-500 focus:bg-white transition font-bold"
             />
           </div>
           <button 
             onClick={handleSend}
             disabled={!input.trim() || loading}
             className="p-3.5 bg-agri-800 text-white rounded-full hover:bg-agri-900 shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed border-2 border-agri-900"
           >
             <Send className="w-5 h-5" />
           </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
           {coords ? (
            <p className="text-[10px] text-agri-800 font-black uppercase tracking-widest flex items-center gap-1 bg-agri-50 px-2 py-0.5 rounded border border-agri-100">
              <MapPin className="w-3 h-3" /> Location Active
            </p>
          ) : (
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">Enable location for precise local advice</p>
          )}
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1">
            <span className="text-agri-600">EN</span> / <span className="text-agri-600">HI</span> Supported
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;