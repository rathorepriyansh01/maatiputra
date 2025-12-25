import React from 'react';
import { Sprout, Menu, Bell, LogOut, Globe } from 'lucide-react';
import { User } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface NavbarProps {
  user: User | null;
  toggleSidebar: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, toggleSidebar, onLogout }) => {
  const { language, setLanguage, t } = useAppContext();

  return (
    <nav className="bg-agri-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-agri-700 md:hidden focus:outline-none"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center gap-2 ml-2 md:ml-0">
              <Sprout className="h-8 w-8 text-green-300" />
              <span className="font-display font-bold text-xl tracking-wide">MAATIPUTRA</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-agri-900/50 rounded-full p-1 border border-agri-600 shadow-inner">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-black rounded-full transition ${language === 'en' ? 'bg-white text-agri-900 shadow-md' : 'text-white/90 hover:text-white'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 text-xs font-black rounded-full transition ${language === 'hi' ? 'bg-white text-agri-900 shadow-md' : 'text-white/90 hover:text-white'}`}
              >
                हिंदी
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 rounded-full hover:bg-agri-700 relative hidden sm:block text-white"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-agri-800" />
                </button>
                <button 
                  onClick={onLogout}
                  className="p-2 rounded-full hover:bg-red-600 text-white transition-colors"
                  title={t('logout')}
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <span className="text-sm font-bold text-white hidden sm:block">Welcome</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;