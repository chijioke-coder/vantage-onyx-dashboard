import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Home, Users, LayoutGrid, BarChart3, Shield, Plus, X, Zap, MessageCircle, Search, Globe, Radar, Activity, Trash2, Smartphone, Monitor, MapPin } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [stealth, setStealth] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProp, setNewProp] = useState({ title: '', price_naira: '', thumbnail_url: '' });
  const [toasts, setToasts] = useState([]);
  const searchInputRef = useRef(null);

  const fetchData = async () => {
    const { data: P } = await supabase.from('properties_db').select('*').order('view_count', { ascending: false });
    const { data: L } = await supabase.from('zenith_leads').select('*').order('created_at', { ascending: false });
    const { data: V } = await supabase.from('visitors_db').select('*').limit(20).order('created_at', { ascending: false });
    
    if (P) setProperties(P);
    if (L) setLeads(L);
    if (V) setVisitors(V);
  };

  useEffect(() => {
    fetchData();
    // Realtime Sync
    const channel = supabase.channel('onyx-sync').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'zenith_leads' }, (payload) => {
      if (payload.new.device_type?.includes('iPhone')) {
        showToast("🚨 WHALE ACTIVITY DETECTED");
      }
      fetchData();
    }).subscribe();

    // Cmd+K Listener
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('inventory');
        setTimeout(() => searchInputRef.current?.focus(), 10);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const showToast = (msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // --- WHALE INTELLIGENCE LOGIC ---
  const getWhaleScore = (lead) => {
    let score = 0;
    if (lead.device_type?.toLowerCase().includes('iphone')) score += 20;
    if (lead.dwell_time > 180) score += 30;
    if (lead.virtual_tour_clicked) score += 40; // Future column
    if (lead.memo_requested) score += 40; // Future column
    if (lead.visit_count > 2) score += 25; // Future column
    if (lead.intent_to_pay) score += 100; // Your planned WhatsApp trigger
    return score;
  };

  const formatCurrency = (val) => `₦${Number(val).toLocaleString()}`;

  // --- VIEWS ---

  const InventoryView = () => (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute -inset-1 bg-neonBlue/20 rounded-xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200 animate-pulse"></div>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neonBlue" size={16} />
        <input 
          ref={searchInputRef}
          type="text" placeholder="COMMAND + K SEARCH..." 
          className="relative w-full bg-[#0A0A0A] border border-white/10 p-4 pl-12 rounded-xl text-[10px] font-black tracking-widest outline-none focus:border-neonBlue"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {properties.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(p => {
          // Heatmap Pulse Logic
          const isHot = p.view_count > 50;
          const isVeryHot = p.view_count > 150;
          return (
            <div key={p.id} className={`overflow-hidden rounded-xl border bg-[#0A0A0A] transition-all duration-500 ${isVeryHot ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' : isHot ? 'border-orange-500' : 'border-white/10'}`}>
              <div className="relative h-28 overflow-hidden">
                <img src={p.thumbnail_url} className="h-full w-full object-cover opacity-60" />
                <a 
                  href={`https://wa.me/234XXXXXXXXXX?text=Hello, I'm interested in ${p.title} priced at ${formatCurrency(p.price_naira)}`}
                  className="absolute bottom-2 right-2 p-2 bg-green-600 rounded-full text-white shadow-lg active:scale-90 transition-transform"
                >
                  <MessageCircle size={14} fill="white" />
                </a>
              </div>
              <div className="p-3">
                <p className="truncate text-[9px] font-black uppercase text-white mb-1">{p.title}</p>
                <div className="flex justify-between items-center">
                  <p className="font-mono text-[10px] text-neonBlue font-bold">{formatCurrency(p.price_naira)}</p>
                  <button onClick={() => properties.length > 10 && deleteProperty(p.id)} className={`text-red-500/30 ${properties.length <= 10 && 'opacity-0'}`}><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      {/* TOAST SYSTEM */}
      <div className="fixed top-20 left-4 right-4 z-[200] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className="bg-red-600 text-white text-[10px] font-black p-4 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-red-400 animate-bounce text-center uppercase tracking-[0.2em]">
            {t.msg}
          </div>
        ))}
      </div>

      <header className="flex-none flex items-center justify-between border-b border-white/10 bg-black p-4 z-50">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-neonBlue" fill="#00F3FF" />
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Vantage<span className="text-neonBlue">Onyx</span></h1>
        </div>
        <button onClick={() => setStealth(!stealth)} className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase ${stealth ? 'border-neonAmber text-neonAmber bg-neonAmber/10' : 'border-white/10 text-gray-500'}`}>
          {stealth ? 'Masked' : 'Public'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-[#0A0A0A] border border-neonBlue/20 p-6 rounded-2xl flex items-center justify-between overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-neonBlue uppercase tracking-widest mb-1">Intelligence Radar</p>
                <h2 className="text-3xl font-black text-white italic">{leads.filter(l => getWhaleScore(l) > 50).length} <span className="text-xs text-gray-500 uppercase">Whales Locked</span></h2>
              </div>
              <Radar size={80} className="absolute -right-4 -bottom-4 text-neonBlue/10 animate-spin-slow" />
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase px-1 flex justify-between">
                <span>Live Intelligence Feed</span>
                <span className="text-neonBlue animate-pulse">● Live</span>
              </h3>
              {visitors.slice(0, 6).map((v, i) => (
                <div key={i} className="p-3 bg-[#0A0A0A] border border-white/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {v.device_type?.includes('Mobile') ? <Smartphone size={12} className="text-gray-600"/> : <Monitor size={12} className="text-gray-600"/>}
                    <span className="text-[10px] font-mono text-gray-400">{v.ip_address}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={10} className="text-neonBlue"/>
                    <span className="text-[9px] font-bold text-white uppercase">{v.location_city || 'Lagos'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && <InventoryView />}

        {activeTab === 'leads' && (
          <div className="space-y-4">
            {leads.map(lead => {
              const score = getWhaleScore(lead);
              const isWhale = score > 50;
              return (
                <div key={lead.id} className={`p-4 rounded-xl border transition-all ${isWhale ? 'border-neonAmber/40 bg-neonAmber/5 shadow-[0_0_15px_rgba(255,184,0,0.1)]' : 'border-white/5 bg-[#0A0A0A]'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[11px] font-black uppercase" style={stealth ? { filter: 'blur(6px)' } : {}}>{lead.full_name || 'Anonymous'}</p>
                    {isWhale && <span className="bg-neonAmber text-black text-[8px] font-black px-1.5 py-0.5 rounded italic">WHALE SCORE: {score}</span>}
                  </div>
                  <p className="text-[9px] text-gray-500 font-mono tracking-tighter" style={stealth ? { filter: 'blur(6px)' } : {}}>{lead.phone_number}</p>
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-[8px] font-mono text-gray-600 uppercase">
                    <span>{lead.device_type}</span>
                    <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/90 border-t border-white/10 flex items-center justify-around px-2 z-50 pb-4">
        {[
          { id: 'home', icon: <Home size={22} />, label: 'Radar' },
          { id: 'leads', icon: <Users size={22} />, label: 'Intel' },
          { id: 'add', icon: <Plus size={32} strokeWidth={3} />, label: '', special: true },
          { id: 'inventory', icon: <LayoutGrid size={22} />, label: 'Assets' },
          { id: 'stats', icon: <BarChart3 size={22} />, label: 'Stats' },
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => item.special ? setShowAddModal(true) : setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-neonBlue scale-110' : 'text-gray-600'} ${item.special ? 'relative -top-6 h-14 w-14 bg-neonBlue rounded-full text-black' : ''}`}
          >
            {item.icon}
            {item.label && <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
