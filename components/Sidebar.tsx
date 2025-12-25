import React from 'react';
import { Home, FlaskConical, ScanLine, TrendingUp, MessageSquareText, Settings, CloudRain, Map } from 'lucide-react';
import { AppRoute } from '../types';

interface SidebarProps {
  isOpen: boolean;
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  isMobile: boolean;
  closeMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentRoute, onNavigate, isMobile, closeMobile }) => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', route: AppRoute.DASHBOARD },
    { icon: Map, label: 'Farm Map (Satellite)', route: AppRoute.MAP },
    { icon: CloudRain, label: 'Weather Forecast', route: AppRoute.WEATHER },
    { icon: FlaskConical, label: 'Soil Analysis', route: AppRoute.SOIL },
    { icon: ScanLine, label: 'Leaf Health', route: AppRoute.LEAF },
    { icon: TrendingUp, label: 'Fasaldaam', route: AppRoute.FASALDAAM },
    { icon: MessageSquareText, label: 'Sahayak (Chat)', route: AppRoute.CHAT },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:h-[calc(100vh-64px)] border-r border-gray-200
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="h-full flex flex-col py-6">
        <div className="px-4 mb-6">
          <h2 className="text-xs font-black text-gray-600 uppercase tracking-widest">Navigation</h2>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                onNavigate(item.route);
                if (isMobile) closeMobile();
              }}
              className={`
                w-full group flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all
                ${currentRoute === item.route 
                  ? 'bg-agri-100 text-agri-900 border-l-4 border-agri-700 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
              `}
            >
              <item.icon className={`mr-3 h-5 w-5 ${currentRoute === item.route ? 'text-agri-700' : 'text-gray-500 group-hover:text-gray-700'}`} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 mt-auto">
           <button className="w-full group flex items-center px-4 py-3 text-sm font-bold text-gray-700 rounded-xl hover:bg-gray-100">
             <Settings className="mr-3 h-5 w-5 text-gray-500" />
             Settings
           </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;