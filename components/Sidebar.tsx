
import React from 'react';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems: { id: AppTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'create', label: 'Create Post', icon: 'fa-plus' },
    { id: 'strategy', label: 'Strategy & ROI', icon: 'fa-chess-knight' },
    { id: 'settings', label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          AutoPost AI
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Content Engine</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-medium">Jane Doe</p>
            <p className="text-xs text-slate-500">Scale Plan - $1/vid</p>
          </div>
        </div>
      </div>
    </div>
  );
};
