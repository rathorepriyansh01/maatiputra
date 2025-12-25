import React, { useEffect, useState } from 'react';
import { User, AppRoute, WeatherData, NewsArticle } from '../types';
import { 
  CloudSun, Droplets, Wind, ArrowRight, TrendingUp, 
  AlertTriangle, MapPin, RefreshCw, Newspaper, 
  ExternalLink, Share2, Bookmark, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../contexts/AppContext';
import { fetchWeather, getCurrentLocation } from '../services/weatherService';
import { fetchAgriNews } from '../services/newsService';

interface DashboardProps {
  user: User;
  onNavigate: (route: AppRoute) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const { t, language, locationEnabled, toggleLocation } = useAppContext();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Scheme' | 'Market' | 'Tech'>('All');
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadWeather();
    loadNews();
  }, [locationEnabled, language]);

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(article => article.category === activeCategory));
    }
  }, [activeCategory, news]);

  const loadWeather = async () => {
    setLoadingWeather(true);
    let lat, lon;

    if (locationEnabled) {
      const loc = await getCurrentLocation();
      if (loc) {
        lat = loc.lat;
        lon = loc.lon;
      }
    }
    
    const data = await fetchWeather(lat, lon);
    setWeather(data);
    setLoadingWeather(false);
  };

  const loadNews = async () => {
    setLoadingNews(true);
    const articles = await fetchAgriNews(language);
    setNews(articles);
    setFilteredNews(articles);
    setLoadingNews(false);
  };

  const handleShare = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const categories: ('All' | 'Scheme' | 'Market' | 'Tech')[] = ['All', 'Scheme', 'Market', 'Tech'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-12">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-agri-100 rounded-full flex items-center justify-center text-agri-700 font-bold text-xl shadow-inner">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('welcome')}, {user.name} 🙏</h1>
            <p className="text-gray-600 text-sm mt-0.5 font-medium">
               {language === 'hi' ? 'आपके खेत की स्थिति और ताज़ा अपडेट।' : "Your farm status and latest updates."}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3 items-center">
           <button 
             onClick={toggleLocation}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${
               locationEnabled 
               ? 'bg-green-50 text-green-800 border-green-200' 
               : 'bg-gray-50 text-gray-600 border-gray-200'
             }`}
           >
             <MapPin className={`w-3.5 h-3.5 ${locationEnabled ? 'animate-bounce' : ''}`} />
             {locationEnabled ? t('location_on') : t('location_off')}
           </button>

           <div className="px-4 py-2 rounded-xl text-xs font-black bg-slate-900 text-white border-2 border-slate-900 shadow-lg">
             {user.kisanId}
           </div>
        </div>
      </motion.div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Widget */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between"
        >
          {loadingWeather ? (
             <div className="flex items-center justify-center h-32">
               <RefreshCw className="w-8 h-8 animate-spin text-white opacity-50" />
             </div>
          ) : weather ? (
            <>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                      Live Weather
                      {weather.isDemo && <span className="bg-white/20 px-2 py-0.5 rounded-md font-black">DEMO</span>}
                    </p>
                    <h2 className="text-5xl font-black mt-2 drop-shadow-md">{weather.temp}°</h2>
                    <p className="text-white mt-2 text-lg font-bold tracking-tight uppercase opacity-90">{weather.condition}</p>
                  </div>
                  <CloudSun className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
                </div>
              </div>
              <div className="mt-8 flex gap-6 text-xs font-black text-white/80 relative z-10 bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-300" /> {weather.humidity}% Humidity
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-300" /> {weather.windSpeed} km/h Wind
                </div>
              </div>
            </>
          ) : null}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        </motion.div>

        {/* Action Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            onClick={() => onNavigate(AppRoute.SOIL)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer group flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 shadow-inner">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-agri-100 transition-colors">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-agri-700" />
                </div>
              </div>
              <h3 className="font-black text-gray-900 text-xl tracking-tight mb-2">{t('check_soil')}</h3>
              <p className="text-sm text-gray-600 font-bold leading-relaxed">
                {language === 'hi' ? "मृदा स्वास्थ्य कार्ड से उर्वरक सिफारिशें प्राप्त करें।" : "Get fertilizer recommendations from Soil Health Card."}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-agri-900 uppercase tracking-widest bg-agri-50 px-2 py-1 rounded">AI Analysis Ready</span>
            </div>
          </motion.div>

          <motion.div 
             whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
             onClick={() => onNavigate(AppRoute.LEAF)}
             className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer group flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="p-3 bg-red-50 rounded-2xl border border-red-100 text-red-700 shadow-inner">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-agri-100 transition-colors">
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-agri-700" />
                </div>
              </div>
              <h3 className="font-black text-gray-900 text-xl tracking-tight mb-2">{t('scan_crop')}</h3>
              <p className="text-sm text-gray-600 font-bold leading-relaxed">
                 {language === 'hi' ? "रोगों का पता लगाने के लिए फोटो लें।" : "Take a photo to detect diseases instantly."}
              </p>
            </div>
             <div className="mt-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-red-900 uppercase tracking-widest bg-red-50 px-2 py-1 rounded">Vision AI Active</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern News Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-agri-100 rounded-xl text-agri-700 border border-agri-200">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {language === 'hi' ? 'कृषि समाचार' : 'Agriculture News'}
              </h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Updated hourly • From major sources</p>
            </div>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 self-start">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeCategory === cat 
                  ? 'bg-white text-agri-800 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {cat === 'All' ? (language === 'hi' ? 'सभी' : 'All') : cat}
              </button>
            ))}
          </div>
        </div>

        {loadingNews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[1,2,3].map(i => (
               <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
             ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="space-y-6">
            {/* Featured Article - Only show when "All" is selected or first item matches */}
            {activeCategory === 'All' && filteredNews.length > 0 && (
              <motion.div 
                variants={itemVariants}
                onClick={() => window.open(filteredNews[0].url, '_blank')}
                className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-xl border border-gray-200"
              >
                <img 
                  src={filteredNews[0].imageUrl} 
                  alt={filteredNews[0].title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 p-8 w-full">
                  <span className="px-3 py-1 bg-agri-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest mb-4 inline-block">Featured Update</span>
                  <h4 className="text-3xl font-black text-white leading-tight mb-3 drop-shadow-md group-hover:text-agri-300 transition-colors">
                    {filteredNews[0].title}
                  </h4>
                  <p className="text-gray-200 text-lg line-clamp-2 max-w-3xl font-medium mb-6">
                    {filteredNews[0].description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-white/70 text-sm font-bold">
                       <span>{filteredNews[0].source}</span>
                       <span>•</span>
                       <span>{filteredNews[0].publishedAt}</span>
                    </div>
                    <button className="bg-white text-gray-900 px-6 py-2 rounded-xl font-black text-sm hover:bg-agri-100 transition shadow-lg flex items-center gap-2">
                       Read Full Story <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Other Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.slice(activeCategory === 'All' ? 1 : 0).map((article) => (
                <motion.div 
                  key={article.id}
                  variants={itemVariants}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-lg ${
                        article.category === 'Scheme' ? 'bg-purple-600' :
                        article.category === 'Market' ? 'bg-orange-600' :
                        article.category === 'Tech' ? 'bg-blue-600' : 'bg-gray-600'
                      }`}>
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-black uppercase mb-3 tracking-widest">
                      <span>{article.source}</span>
                      <span>{article.publishedAt}</span>
                    </div>
                    <h4 className="font-black text-gray-900 line-clamp-2 mb-3 leading-tight group-hover:text-agri-700 transition-colors text-lg">
                      {article.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-6 font-bold leading-relaxed">
                      {article.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-black text-agri-700 hover:text-agri-900 transition"
                      >
                        {language === 'hi' ? 'विस्तार से' : 'Read More'} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleShare(e, article.url, article.id)}
                          className={`p-2 rounded-lg transition-all ${copiedId === article.id ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-200'}`}
                          title="Share link"
                        >
                          {copiedId === article.id ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        </button>
                        <button className="p-2 bg-gray-50 text-gray-500 hover:bg-gray-200 rounded-lg transition-all" title="Save for later">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <Newspaper className="w-10 h-10 text-gray-300 mb-3" />
             <p className="text-gray-500 font-bold tracking-tight">No news articles found for this category.</p>
          </div>
        )}
      </motion.div>

      {/* Market Prices Snippet */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                <TrendingUp className="text-agri-600 w-5 h-5" />
             </div>
             <div>
                <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">{t('mandi_rates')}</h3>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                  Live Updates from eNAM
                </p>
             </div>
          </div>
          <button 
            onClick={() => onNavigate(AppRoute.FASALDAAM)} 
            className="text-sm text-agri-700 font-black hover:agri-900 transition flex items-center gap-2 bg-agri-50 px-4 py-2 rounded-xl border border-agri-100"
          >
            {t('view_all')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
              <tr>
                <th className="px-6 py-4 border-b border-gray-100">Crop Type</th>
                <th className="px-6 py-4 border-b border-gray-100">Location</th>
                <th className="px-6 py-4 border-b border-gray-100">Market Price</th>
                <th className="px-6 py-4 border-b border-gray-100">24h Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 font-black text-gray-900">Wheat (Gehu)</td>
                <td className="px-6 py-4 text-gray-600 font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" /> Indore Mandi
                </td>
                <td className="px-6 py-4 font-black text-agri-900">₹2,125 <span className="text-[10px] text-gray-400 font-bold">/Q</span></td>
                <td className="px-6 py-4 text-green-700 text-xs font-black">
                  <span className="bg-green-100 px-2 py-1 rounded-md">▲ +2.4%</span>
                </td>
              </tr>
               <tr className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 font-black text-gray-900">Soybean</td>
                <td className="px-6 py-4 text-gray-600 font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" /> Ujjain Mandi
                </td>
                <td className="px-6 py-4 font-black text-gray-900">₹4,850 <span className="text-[10px] text-gray-400 font-bold">/Q</span></td>
                <td className="px-6 py-4 text-red-700 text-xs font-black">
                  <span className="bg-red-100 px-2 py-1 rounded-md">▼ -1.1%</span>
                </td>
              </tr>
               <tr className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4 font-black text-gray-900">Cotton (Kapas)</td>
                <td className="px-6 py-4 text-gray-600 font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" /> Bhopal Mandi
                </td>
                <td className="px-6 py-4 font-black text-gray-900">₹7,210 <span className="text-[10px] text-gray-400 font-bold">/Q</span></td>
                <td className="px-6 py-4 text-green-700 text-xs font-black">
                  <span className="bg-green-100 px-2 py-1 rounded-md">▲ +0.8%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;