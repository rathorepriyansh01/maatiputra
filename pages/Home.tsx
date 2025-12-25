import React from 'react';
import { AppRoute } from '../types';
import { Sprout, ShieldCheck, TrendingUp, Users } from 'lucide-react';

interface HomeProps {
  onNavigate: (route: AppRoute) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-agri-800 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-098e98e579bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Indian Farm" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Smart Farming for a <span className="text-green-300">Better Harvest</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-green-100">
            Maatiputra connects traditional Indian farming with advanced AI. 
            Soil health, disease detection, and market prices - all in one app.
          </p>
          <div className="mt-10 flex gap-4">
            <button 
              onClick={() => onNavigate(AppRoute.REGISTER)}
              className="px-8 py-3 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-400 transition transform hover:-translate-y-1"
            >
              Join as Kisan
            </button>
            <button 
              onClick={() => onNavigate(AppRoute.LOGIN)}
              className="px-8 py-3 bg-white text-agri-900 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition"
            >
              Login
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-agri-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything a Farmer Needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="text-agri-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Leaf Doctor</h3>
              <p className="text-gray-600">Snap a photo of your crop. Our Vision AI detects diseases instantly and suggests treatments in Hindi.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Sprout className="text-blue-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Soil Health Card</h3>
              <p className="text-gray-600">Upload your government Soil Health Card PDF or enter data manually for personalized fertilizer advice.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-yellow-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fasaldaam</h3>
              <p className="text-gray-600">AI-driven price predictions to help you decide when to sell your produce for maximum profit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;