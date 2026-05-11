import React, { useState, useEffect, useMemo } from 'react';
import { Home, Users, LayoutGrid, BarChart3, Shield, Plus, X, Zap, MessageCircle, Search, Terminal as TerminalIcon, Globe, Radar } from 'lucide-react';
import { supabase } from './lib/supabase';

const THEME = {
  black: '#000000',
  surface: '#0A0A0A',
  neonBlue: '#00F3FF',
  neonAmber: '#FFB800',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [stealth, setStealth] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([{ time: new Date().toLocaleTimeString(), msg: "ONYX CORE ONLINE" }]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProp, setNewProp] = useState({ title: '', price_naira: '', thumbnail_url: '' });

  const fetchData = async () => {
    const { data: P } = await supabase.from('properties_db').select('*');
    const { data: L } = await supabase.from('zenith_leads').select('*').order('created_at', { ascending: false });
    const { data: V } = await supabase.from('visitors_db').select('*').limit(15);
    if (P) setProperties(P);
    if (L) setLeads(L);
    if (V) setVisitors(V);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('onyx-sync').on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatCurrency = (val) => `₦${Number(val).toLocaleString()}`;
  const addLog = (msg) => setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg }, ...prev].slice(0, 15));

  // --- SUB-COMPONENTS ---

  const HomeView = () => (
    <div className="space-y-6">
      {/* WHALE RADAR (New feature for the freed space) */}
      <div className="bg-[#0A0A0A] border border-neonBlue/20 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-neonBlue uppercase tracking-widest mb-1">Whale Activity Radar</p>
          <h2 className="text-3xl font-black text-white">{leads.filter(l => l.device_type?.includes('iPhone')).length} <span className="text-xs text-gray-500 uppercase">High-Net Nodes</span></h2>
        </div>
        <div className="animate-spin-slow text-neonBlue/30"><Radar size={48} /></div>
      </div>

      {/* LIVE INTELLIGENCE FEED */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase italic">Live Intelligence Feed</h3>
        <div className="space-y-2">
          {visitors.map((v, i) => (
            <div key={i} className="p-4 bg-[#0A0A0A] border border-white/5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={14} className="text-neonBlue" />
                <span className="text-[10px] font-mono text-gray-300">{v.ip_address || '127.0.0.1'} • {v.location_city || 'Lagos'}</span>
              </div>
              <span className="text-[9px] font-bold text-gray-600 italic">just now</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const InventoryView = () => (
    <div className="space-y-6">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neonBlue" size={16} />
        <input 
          type="text" placeholder="COMMAND + K TO SEARCH..." 
          className="w-full bg-[#0A0A0A] border border-white/10 p-4 pl-12 rounded-xl text-[11px] font-bold tracking-widest outline-none focus:border-neonBlue"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {properties.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]">
            <img src={p.thumbnail_url} className="h-28 w-full object-cover opacity-60" />
            <div className="p-3">
              <p className="truncate text-[9px] font-black uppercase mb-1">{p.title}</p>
              <p className="font-mono text-[10px] text-neonBlue font-bold">{formatCurrency(p.price_naira)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      <header className="flex-none flex items-center justify-between border-b border-white/10 bg-black p-4 z-50">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-neonBlue" fill="#00F3FF" />
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Vantage<span className="text-neonBlue">Onyx</span></h1>
        </div>
        <button onClick={() => setStealth(!stealth)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase ${stealth ? 'border-neonAmber text-neonAmber bg-neonAmber/5' : 'border-white/10 text-gray-500'}`}>
          <Shield size={14} /> {stealth ? 'Masked' : 'Public'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase italic">Operational Leads</h3>
            {leads.map(lead => (
              <div key={lead.id} className={`p-4 rounded-xl border ${lead.device_type?.includes('iPhone') ? 'border-neonAmber/30 bg-neonAmber/5' : 'border-white/5 bg-[#0A0A0A]'}`}>
                <p className="text-[11px] font-black uppercase" style={stealth ? { filter: 'blur(4px)' } : {}}>{lead.full_name || 'Anonymous'}</p>
                <p className="text-[9px] text-gray-500">{lead.phone_number}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'stats' && (
          <div className="p-8 text-center text-gray-600 uppercase text-[10px] font-black tracking-[0.5em]">Analytics Engine Pending...</div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black border-t border-white/10 flex items-center justify-around px-2 z-50 pb-4">
        {[
          { id: 'home', icon: <Home size={22} />, label: 'Home' },
          { id: 'leads', icon: <Users size={22} />, label: 'Leads' },
          { id: 'add', icon: <Plus size={32} strokeWidth={3} />, label: '', special: true },
          { id: 'inventory', icon: <LayoutGrid size={22} />, label: 'Inventory' },
          { id: 'stats', icon: <BarChart3 size={22} />, label: 'Stats' },
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => item.special ? setShowAddModal(true) : setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-neonBlue' : 'text-gray-600'} ${item.special ? 'relative -top-6 h-16 w-16 bg-neonBlue rounded-full text-black shadow-lg shadow-neonBlue/20' : ''}`}
          >
            {item.icon}
            {item.label && <span className="text-[8px] font-black uppercase">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* MODAL & LOGS (Simplified for clarity) */}
      {showAddModal && <div className="fixed inset-0 z-[100] bg-black/90 p-8 flex items-center justify-center">...Add Asset Logic...<button onClick={() => setShowAddModal(false)}>Close</button></div>}
    </div>
  );
}
