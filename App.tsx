import React, { useState } from 'react';
import { User, AppRoute } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SoilAnalysis from './pages/SoilAnalysis';
import LeafCheck from './pages/LeafCheck';
import ChatAssistant from './pages/ChatAssistant';
import Fasaldaam from './pages/Fasaldaam';
import WeatherForecast from './pages/WeatherForecast';
import FarmMap from './pages/FarmMap';
import { Loader2 } from 'lucide-react';
import { AppProvider } from './contexts/AppContext';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState<AppRoute>(AppRoute.HOME);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e?: React.FormEvent, forceDemo: boolean = false) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    
    // Simulate backend authentication delay
    setTimeout(() => {
      // In this app, we treat any login attempt as a success but use demo mode 
      // as the primary path since there's no actual backend persistence.
      const isDemoSession = forceDemo || (email !== 'admin@maatiputra.com');
      const randomId = Math.floor(1000 + Math.random() * 9000);
      
      setUser({
        name: email ? email.split('@')[0] : "Ramesh Kumar",
        kisanId: isDemoSession ? `KISAN-IN-DEMO-${randomId}` : "KISAN-PRO-8821",
        phone: "+91 9876543210",
        location: "Indore, MP"
      });
      
      setRoute(AppRoute.DASHBOARD);
      setIsLoggingIn(false);
      
      if (isDemoSession) {
        showToast("Logged in using demo mode");
      } else {
        showToast("Logged in successfully");
      }
    }, 1200);
  };

  const handleLogout = () => {
    setUser(null);
    setRoute(AppRoute.HOME);
    setEmail('');
    setPassword('');
    showToast("Logged out successfully");
  };

  const navigate = (newRoute: AppRoute) => {
    setRoute(newRoute);
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const renderContent = () => {
    switch (route) {
      case AppRoute.HOME:
        return <Home onNavigate={navigate} />;
      case AppRoute.LOGIN:
      case AppRoute.REGISTER:
        return (
          <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
               <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
               <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
             </div>

             <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center relative z-10 border border-gray-100">
               <h2 className="text-3xl font-bold mb-2 text-gray-900 font-display">Welcome Back</h2>
               <p className="text-gray-600 mb-8 font-medium">Login to access your Kisan Dashboard</p>
               
               <form onSubmit={(e) => handleLogin(e)} className="space-y-4 mb-6">
                 <input 
                    type="email" 
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 outline-none focus:ring-2 focus:ring-agri-500 transition font-medium" 
                 />
                 <input 
                    type="password" 
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 outline-none focus:ring-2 focus:ring-agri-500 transition font-medium" 
                 />
                 
                 <button 
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-agri-700 text-white py-3.5 rounded-xl font-bold hover:bg-agri-800 transition shadow-lg hover:shadow-xl flex justify-center items-center gap-2 mt-4"
                 >
                   {isLoggingIn ? <Loader2 className="animate-spin w-5 h-5" /> : 'Login'}
                 </button>
               </form>
               
               <div className="relative my-6">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                 <div className="relative flex justify-center text-sm font-bold uppercase tracking-widest"><span className="px-2 bg-white text-gray-500">Or</span></div>
               </div>

               <button 
                  onClick={() => handleLogin(undefined, true)}
                  disabled={isLoggingIn}
                  className="w-full bg-white border-2 border-agri-100 text-agri-800 py-3 rounded-xl font-bold hover:bg-agri-50 hover:border-agri-200 transition"
                >
                  Demo User Mode
               </button>
               <p className="mt-6 text-sm text-gray-700 font-bold cursor-pointer hover:text-agri-700 underline underline-offset-4" onClick={() => navigate(AppRoute.HOME)}>Back to Home</p>
             </div>
          </div>
        );
      case AppRoute.DASHBOARD:
        return <Dashboard user={user!} onNavigate={navigate} />;
      case AppRoute.SOIL:
        return <SoilAnalysis />;
      case AppRoute.LEAF:
        return <LeafCheck />;
      case AppRoute.CHAT:
        return <ChatAssistant userLocation={user?.location} />;
      case AppRoute.FASALDAAM:
        return <Fasaldaam />;
      case AppRoute.WEATHER:
        return <WeatherForecast />;
      case AppRoute.MAP:
        return <FarmMap />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar user={user} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-2xl animate-fade-in-down flex items-center gap-3 border border-gray-700">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
          <span className="font-bold tracking-wide">{toast}</span>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden relative">
        {user && route !== AppRoute.HOME && route !== AppRoute.LOGIN && route !== AppRoute.REGISTER && (
           <>
             {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}
             <Sidebar isOpen={sidebarOpen} currentRoute={route} onNavigate={navigate} isMobile={true} closeMobile={() => setSidebarOpen(false)} />
           </>
        )}
        <main className="flex-1 overflow-y-auto w-full">{renderContent()}</main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;