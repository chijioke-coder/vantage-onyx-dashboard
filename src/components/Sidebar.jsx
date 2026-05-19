import React from 'react';
import { X, Home, Users, LayoutGrid, BarChart3, Settings, Database, Edit3, RefreshCw, RefreshCcw, Eye, Download } from 'lucide-react';

export default function Sidebar({ isOpen, onClose, activeTab, setActiveTab }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[240] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer Container */}
      <div className="fixed top-0 left-0 bottom-0 w-[280px] z-[250] bg-[#0A0A0A] border-r border-white/10 flex flex-col justify-between p-4">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <span className="text-[11px] font-black tracking-widest text-gray-500 uppercase">SYSTEM CONTROL</span>
            <button onClick={onClose} className="text-neonBlue"><X size={18} /></button>
          </div>

          {/* Global Primary Sections */}
          <div className="space-y-1 mb-6">
            {[
              { id: 'home', label: 'Home Terminal', icon: <Home size={16} /> },
              { id: 'leads', label: 'Intel Radar', icon: <Users size={16} /> },
              { id: 'inventory', label: 'Assets Management', icon: <LayoutGrid size={16} /> },
              { id: 'stats', label: 'Quant Engine (Stats)', icon: <BarChart3 size={16} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === item.id ? 'bg-neonBlue/10 border border-neonBlue/30 text-neonBlue' : 'text-gray-400 border border-transparent hover:text-white'}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* CONTEXTUAL MODULE ACTIONS SECTION */}
          <div className="pt-4 border-t border-white/5">
            {activeTab === 'inventory' && (
              <div className="space-y-4">
                <span className="text-[9px] font-mono text-neonBlue/60 uppercase tracking-widest block mb-2">Asset Controls</span>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 text-left text-[9px] font-bold text-gray-400 uppercase tracking-wide hover:text-white bg-black/40 border border-white/5 p-2 rounded-lg">
                    <Edit3 size={12} className="text-neonBlue" /> Rename Property
                  </button>
                  <button className="w-full flex items-center gap-2 text-left text-[9px] font-bold text-gray-400 uppercase tracking-wide hover:text-white bg-black/40 border border-white/5 p-2 rounded-lg">
                    <RefreshCw size={12} className="text-neonAmber" /> Replace Profile Node
                  </button>
                  <button className="w-full flex items-center gap-2 text-left text-[9px] font-bold text-gray-400 uppercase tracking-wide hover:text-white bg-black/40 border border-white/5 p-2 rounded-lg">
                    <Database size={12} className="text-green-500" /> Rewrite Descriptions
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-4">
                <span className="text-[9px] font-mono text-neonAmber/60 uppercase tracking-widest block mb-2">Intel Settings</span>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 text-left text-[9px] font-bold text-gray-400 uppercase tracking-wide hover:text-white bg-black/40 border border-white/5 p-2 rounded-lg">
                    <X size={12} className="text-red-500" /> Clear Active Ledger
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4">
                <span className="text-[9px] font-mono text-green-400/60 uppercase tracking-widest block mb-2">Statistical Toggles</span>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 text-left text-[9px] font-bold text-gray-400 uppercase tracking-wide hover:text-white bg-black/40 border border-white/5 p-2 rounded-lg">
                    <RefreshCcw size={12} className="text-green-400" /> Re-Aggregate Clusters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Persistent Bottom Label */}
        <div className="border-t border-white/5 pt-3 flex items-center gap-2 text-[8px] font-mono text-gray-600 uppercase">
          <Database size={10} />
          <span>Secure Identity Core</span>
        </div>
      </div>
    </>
  );
}
