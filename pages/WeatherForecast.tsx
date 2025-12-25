import React, { useEffect, useState } from 'react';
import { fetchForecast, getCurrentLocation } from '../services/weatherService';
import { Loader2, CloudRain, MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../contexts/AppContext';

const WeatherForecast: React.FC = () => {
  const { t, locationEnabled } = useAppContext();
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Your Location");

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    setLoading(true);
    let lat, lon;

    // Default to Bhopal if location not available
    const defaultLat = 23.2599; 
    const defaultLon = 77.4126;

    if (locationEnabled) {
      const loc = await getCurrentLocation();
      if (loc) {
        lat = loc.lat;
        lon = loc.lon;
        setLocationName("Current Location");
        
        // Try getting city name
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.county;
            if (city) setLocationName(city);
        } catch(e) {}

      } else {
          lat = defaultLat;
          lon = defaultLon;
          setLocationName("Bhopal (Demo)");
      }
    } else {
       lat = defaultLat;
       lon = defaultLon;
       setLocationName("Bhopal (Demo)");
    }

    const data = await fetchForecast(lat!, lon!);
    setForecast(data);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CloudRain className="text-blue-600" /> {t('weather')} Forecast
          </h1>
          <p className="text-gray-500 mt-1">Detailed 7-day outlook for your farm.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-medium text-gray-700">
           <MapPin className="w-4 h-4 text-agri-600" /> {locationName}
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
           <Loader2 className="w-8 h-8 text-agri-600 animate-spin" />
        </div>
      ) : (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
            <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={forecast}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#374151'}} />
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#374151'}} unit="°C" />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#374151'}} unit="mm" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                        <Bar yAxisId="right" dataKey="rain" name="Rain (mm)" fill="#60a5fa" barSize={30} radius={[4, 4, 0, 0]} />
                        <Line yAxisId="left" type="monotone" dataKey="maxTemp" name="Max Temp" stroke="#dc2626" strokeWidth={3} dot={{r: 4}} />
                        <Line yAxisId="left" type="monotone" dataKey="minTemp" name="Min Temp" stroke="#2563eb" strokeWidth={3} dot={{r: 4}} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
               {forecast.slice(0, 4).map((day, idx) => (
                   <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                       <p className="font-bold text-gray-900">{day.date}</p>
                       <div className="my-2 flex justify-center">
                           <CloudRain className="w-6 h-6 text-blue-400" />
                       </div>
                       <p className="text-sm text-gray-600">
                           <span className="text-red-500 font-bold">{day.maxTemp}°</span> / <span className="text-blue-500 font-bold">{day.minTemp}°</span>
                       </p>
                       <p className="text-xs text-blue-500 mt-1">{day.rain}mm Rain</p>
                   </div>
               ))}
            </div>
        </motion.div>
      )}
    </div>
  );
};

export default WeatherForecast;