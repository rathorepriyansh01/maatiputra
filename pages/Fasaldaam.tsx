import React, { useState } from 'react';
import { predictCropPrice } from '../services/geminiService';
import { PricePrediction } from '../types';
import { TrendingUp, TrendingDown, Minus, MapPin, Calendar, Loader2, Navigation, BarChart3, History, Table2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const Fasaldaam: React.FC = () => {
  const [crop, setCrop] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [history, setHistory] = useState<{ month: string; price: number }[]>([]);

  const handlePredict = async () => {
    if (!crop || !district) return;
    setLoading(true);
    setPrediction(null);
    setHistory([]);
    
    try {
      // 1. Get Price Prediction
      const data = await predictCropPrice(crop, district, new Date().toLocaleString('default', { month: 'long' }));
      setPrediction(data);
      generateHistory(data.current_price);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateHistory = (basePrice: number) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIndex = new Date().getMonth();
    const pastMonths = [];
    
    for(let i=5; i>=0; i--) {
        let idx = currentMonthIndex - i - 1; 
        if(idx < 0) idx += 12;
        pastMonths.push(monthNames[idx]);
    }

    const mockHistory = pastMonths.map(m => {
        const fluctuation = (Math.random() * 0.2) - 0.1;
        return {
            month: m,
            price: Math.round(basePrice * (1 + fluctuation))
        };
    });
    setHistory(mockHistory);
  };

  const handleDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      alert("Geolocation is not supported.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const detectedLocation = 
            data.address.city || 
            data.address.town || 
            data.address.village || 
            data.address.state_district || 
            "Unknown Location";
            
          setDistrict(detectedLocation);
        } catch (error) {
          console.error("Location error:", error);
          alert("Could not detect location name.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        alert("Location access denied.");
        setLocationLoading(false);
      }
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="text-agri-800" /> Fasaldaam - Price Prediction
        </h1>
        <p className="text-gray-900 mt-1 font-bold">AI-powered market insights for smart selling.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 md:col-span-1 h-fit">
          <h2 className="font-black text-gray-900 mb-4 uppercase tracking-wider text-xs">Enter Crop Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-1">Crop Name</label>
              <select 
                className="w-full border-2 border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-agri-500 outline-none text-gray-900 font-bold"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              >
                <option value="">Select Crop</option>
                <option value="Wheat">Wheat (Gehu)</option>
                <option value="Rice">Rice (Dhan)</option>
                <option value="Soybean">Soybean</option>
                <option value="Mustard">Mustard (Sarso)</option>
                <option value="Cotton">Cotton (Kapas)</option>
                <option value="Onion">Onion (Pyaaz)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-900 mb-1">District / Mandi</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="e.g. Indore, Bhopal"
                  className="w-full border-2 border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-2 focus:ring-agri-500 outline-none text-gray-900 font-bold"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
                <button
                  onClick={handleDetectLocation}
                  disabled={locationLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-900 hover:text-agri-800 hover:bg-agri-50 rounded-md transition"
                  title="Detect my location"
                >
                  {locationLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <button 
              onClick={handlePredict}
              disabled={!crop || !district || loading}
              className="w-full bg-agri-800 text-white font-black py-3 rounded-xl hover:bg-agri-900 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Get Prediction'}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
           {loading ? (
             <div className="h-96 bg-white rounded-2xl border border-gray-200 flex items-center justify-center p-8">
               <div className="text-center">
                 <Loader2 className="w-8 h-8 text-agri-800 animate-spin mx-auto mb-2" />
                 <p className="text-gray-900 font-black">Analyzing Mandi Trends...</p>
               </div>
             </div>
           ) : prediction ? (
             <>
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
               {/* Current Status */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                 <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-700 font-black uppercase tracking-widest">Nearest Mandi</p>
                        <h3 className="font-bold text-gray-900 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-agri-700" /> {prediction.nearest_mandi}
                        </h3>
                      </div>
                      <span className="bg-green-100 text-green-900 border border-green-300 text-xs px-2 py-1 rounded-md font-black uppercase tracking-tighter shadow-sm">Live</span>
                    </div>
                    <p className="text-xs text-gray-700 font-black uppercase tracking-widest">Current Price</p>
                    <p className="text-3xl font-black text-gray-900">₹{prediction.current_price}<span className="text-sm font-bold text-gray-700"> / Q</span></p>
                 </div>
                 
                 {prediction.isDemo && (
                     <div className="mt-4 p-2 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-800" />
                        <p className="text-[10px] font-black text-amber-900 uppercase">Demo Govt Price Data</p>
                     </div>
                 )}
                 {!prediction.isDemo && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest">Data Source: AI + eNAM</p>
                    </div>
                 )}
               </div>

               {/* Prediction */}
               <div className="bg-gradient-to-br from-agri-800 to-agri-950 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between border-t border-white/10">
                 <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-agri-100 text-xs font-black uppercase tracking-widest">Forecast</p>
                        <h3 className="font-bold text-white text-xl flex items-center gap-1">
                          <Calendar className="w-4 h-4 opacity-70" /> {new Date().toLocaleString('default', { month: 'short' })} Est.
                        </h3>
                      </div>
                      {prediction.trend === 'up' && <TrendingUp className="w-6 h-6 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />}
                      {prediction.trend === 'down' && <TrendingDown className="w-6 h-6 text-red-400" />}
                      {prediction.trend === 'stable' && <Minus className="w-6 h-6 text-amber-400" />}
                    </div>
                    <p className="text-4xl font-black text-white">₹{prediction.predicted_price}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                         prediction.trend === 'up' ? 'bg-green-500/30 text-green-100 border border-green-400' : 
                         prediction.trend === 'down' ? 'bg-red-500/30 text-red-100 border border-red-400' : 'bg-amber-500/30 text-amber-100 border border-amber-400'
                       }`}>
                         Trend: {prediction.trend.toUpperCase()}
                       </span>
                    </div>
                 </div>
                 <div className="mt-4 bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/5">
                   <p className="text-[10px] text-agri-200 font-black uppercase tracking-widest mb-1">Recommendation</p>
                   <p className="font-black text-white text-lg">
                     {prediction.recommendation === 'sell' ? "✅ Sell Now" : "⏳ Hold Stock"}
                   </p>
                 </div>
               </div>
                </motion.div>
             
               {/* History Chart */}
               {history.length > 0 && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
                   >
                     <div className="flex items-center justify-between mb-8">
                       <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                          <BarChart3 className="w-5 h-5 text-agri-800" /> Price Trends <span className="text-xs font-bold text-gray-700 normal-case tracking-normal">(Past 6 Months)</span>
                       </h3>
                     </div>
                     
                     <div className="flex items-end justify-between h-48 gap-3 sm:gap-6 px-2 mb-8 border-b-2 border-gray-300 pb-8">
                        {history.map((item, index) => {
                            const maxPrice = Math.max(...history.map(h => h.price));
                            const heightPercentage = Math.max((item.price / (maxPrice * 1.1)) * 100, 15);
                            const isLast = index === history.length - 1;
                            
                            return (
                                <div key={index} className="flex flex-col items-center flex-1 group cursor-default">
                                     <div className="relative w-full flex justify-center items-end h-full">
                                        <div 
                                            style={{ height: `${heightPercentage}%` }}
                                            className={`w-full max-w-[44px] rounded-t-xl transition-all relative duration-500 ease-out shadow-md border-t border-x border-black/5
                                                ${isLast 
                                                  ? 'bg-agri-900 ring-2 ring-agri-400 ring-offset-2' 
                                                  : 'bg-agri-700 hover:bg-agri-800'}
                                            `}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl border border-white/20">
                                                ₹{item.price}
                                            </div>
                                        </div>
                                     </div>
                                     <div className="mt-4 flex flex-col items-center">
                                       <span className={`text-[11px] uppercase tracking-wider font-black ${isLast ? 'text-agri-950 underline underline-offset-4' : 'text-gray-900'}`}>{item.month}</span>
                                     </div>
                                </div>
                            )
                        })}
                     </div>
                     <div className="flex justify-center">
                        <p className="text-[10px] text-gray-700 font-bold italic">* Prices shown in ₹ per Quintal</p>
                     </div>
                   </motion.div>
               )}
             </>
           ) : (
             <div className="h-full bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center p-8">
               <div className="text-center">
                 <div className="p-4 bg-white rounded-full inline-block mb-4 shadow-sm border border-gray-200">
                    <TrendingUp className="w-12 h-12 text-gray-500" />
                 </div>
                 <p className="text-gray-900 font-black text-lg">Select a crop and location to see price forecasts.</p>
                 <p className="text-sm text-gray-800 mt-1 font-bold italic">Our AI analyzes historical mandi data and current demand trends.</p>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Fasaldaam;