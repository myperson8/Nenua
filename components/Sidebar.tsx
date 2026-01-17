
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Overview', icon: '🏠' },
    { id: AppView.WEATHER, label: 'Weather & Prep', icon: '🌤️' },
    { id: AppView.NOTES, label: 'Cornell Notes', icon: '📝' },
    { id: AppView.CAMERA, label: 'Smart Camera', icon: '📸' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-500 tracking-tight flex items-center gap-2">
          <span className="bg-emerald-500 text-slate-950 p-1 rounded font-black">N</span>
          Nenua AI
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
              currentView === item.id
                ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase font-bold mb-2">Student Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300">AI Tutor Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
