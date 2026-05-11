import React, { useState, useEffect, useMemo } from 'react';
import { Home, Users, LayoutGrid, BarChart3, Shield, Plus, X, Zap, MessageCircle, Search, Terminal as TerminalIcon } from 'lucide-react';
import { supabase } from './lib/supabase';

// --- STYLING CONSTANTS (Stability Fix: No Blurs) ---
const THEME = {
  black: '#000000',
  surface: '#0A0A0A',
  neonBlue: '#00F3FF',
  neonAmber: '#FFB800',
  border: 'rgba(0, 243, 255, 0.2)'
};

export default function App() {
  // --- STATE ---
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [stealth, setStealth] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([{ time: new Date().toLocaleTimeString(), msg: "SYSTEM INITIALIZED" }]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProp, setNewProp] = useState({ title: '', price_naira: '', thumbnail_url: '' });

  // --- REVENUE LOGIC: WHALE ENGINE ---
  const whaleStats = useMemo(() => {
    const activeWhales = leads.filter(l => 
      l.device_type?.toLowerCase().includes('iphone') && (l.dwell_time > 180 || !l.dwell_time)
    );
    const totalValue = properties.reduce((acc, curr) => acc + (Number(curr.price_naira) || 0), 0);
    return { count: activeWhales.length, portfolio: totalValue };
  }, [leads, properties]);

  const addLog = (msg) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg }, ...prev].slice(0, 20));
  };

  const fetchData = async () => {
    const { data: P } = await supabase.from('properties_db').select('*');
    const { data: L } = await supabase.from('zenith_leads').select('*').order('created_at', { ascending: false });
    const { data: V } = await supabase.from('visitors_db').select('*').limit(10);
    
    if (P) setProperties(P);
    if (L) setLeads(L);
    if (V) setVisitors(V);
  };

  useEffect(() => {
    fetchData();
    // REALTIME ENABLED
    const channel = supabase.channel('onyx-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        addLog(`[SYNC]: ${payload.table.toUpperCase()} UPDATE DETECTED`);
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- RENDER HELPERS ---
  const formatCurrency = (val) => `₦${Number(val).toLocaleString()}`;

  const getHeatmapColor = (views) => {
    if (views > 100) return 'border-red-600 shadow-[inset_0_0_10px_rgba(220,38,38,0.5)]';
    if (views > 50) return 'border-orange-500 shadow-[inset_0_0_10px_rgba(249,115,22,0.5)]';
    return 'border-neonBlue/20';
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* 1. HEADER & STEALTH TOGGLE */}
      <header className="flex-none flex items-center justify-between border-b border-white/10 bg-black p-4 z-50">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-neonBlue" fill="#00F3FF" />
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Vantage<span className="text-neonBlue">Onyx</span></h1>
        </div>
        <button 
          onClick={() => {setStealth(!stealth); addLog(`STEALTH MODE ${!stealth ? 'ENGAGED' : 'DISENGAGED'}`);}}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${stealth ? 'border-neonAmber bg-neonAmber/10 text-neonAmber' : 'border-white/10 text-gray-500'}`}
        >
          <Shield size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">{stealth ? 'Mask Active' : 'Public'}</span>
        </button>
      </header>

      {/* 2. MAIN INTELLIGENCE AREA */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        
        {/* HERO CARDS */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-[#0A0A0A] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Portfolio Value</p>
            <h2 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(whaleStats.portfolio)}</h2>
            <div className="absolute -right-4 -bottom-4 opacity-5"><BarChart3 size={80} /></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A0A0A] border border-neonBlue/30 p-4 rounded-2xl">
              <p className="text-[9px] font-bold text-neonBlue uppercase tracking-widest mb-1">Whales Active</p>
              <h2 className="text-4xl font-black">{whaleStats.count}</h2>
            </div>
            <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-2xl">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Lead Velocity</p>
              <h2 className="text-4xl font-black text-gray-400">{(leads.length / 7).toFixed(1)}<span className="text-xs ml-1">/d</span></h2>
            </div>
          </div>
        </div>

        {/* COMMAND-K SEARCH */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neonBlue group-focus-within:animate-pulse" size={16} />
          <input 
            type="text" 
            placeholder="COMMAND + K TO SEARCH ASSETS..." 
            className="w-full bg-[#0A0A0A] border border-white/10 p-4 pl-12 rounded-xl text-[11px] font-bold tracking-widest outline-none focus:border-neonBlue transition-all shadow-lg"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* PROPERTY HEATMAP */}
        <section>
          <div className="mb-4 flex justify-between items-end px-1">
            <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase italic">Tactical Heatmap</h3>
            <span className="text-[9px] font-mono text-neonBlue uppercase">{properties.length} NODES SYNCED</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {properties.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p.id} className={`overflow-hidden rounded-xl border bg-[#0A0A0A] transition-all ${getHeatmapColor(p.view_count)}`}>
                <div className="relative">
                   <img src={p.thumbnail_url} alt="" className="h-28 w-full object-cover opacity-60" />
                   {p.view_count > 50 && (
                     <div className="absolute top-2 right-2 bg-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase animate-pulse">Hot</div>
                   )}
                </div>
                <div className="p-3">
                  <p className="truncate text-[9px] font-black text-white mb-1 uppercase tracking-tighter">{p.title}</p>
                  <div className="flex justify-between items-center">
                    <p className="font-mono text-[10px] text-neonBlue font-bold">{formatCurrency(p.price_naira)}</p>
                    <a href={`https://wa.me/234XXXXXXXXXX?text=Hello, I'm interested in ${p.title} priced at ${formatCurrency(p.price_naira)}`} className="text-neonBlue opacity-50"><MessageCircle size={14} /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INTELLIGENCE FEED */}
        <section className="space-y-3">
           <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase italic px-1">Live Intelligence Feed</h3>
           <div className="space-y-2">
             {leads.slice(0, 5).map(lead => {
               const isWhale = lead.device_type?.toLowerCase().includes('iphone');
               return (
                 <div key={lead.id} className={`p-4 rounded-xl border ${isWhale ? 'border-neonAmber/30 bg-neonAmber/5' : 'border-white/5 bg-[#0A0A0A]'} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                       <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isWhale ? 'bg-neonAmber text-black' : 'bg-white/5 text-gray-400'}`}>
                         <Users size={16} />
                       </div>
                       <div>
                         <p className={`text-[11px] font-black uppercase tracking-tight ${stealth ? 'select-none' : ''}`} style={stealth ? { filter: 'blur(4px)' } : {}}>
                           {lead.full_name || "Unknown Recon"}
                         </p>
                         <p className="text-[9px] text-gray-500 font-mono">{lead.device_type || 'Desktop'} • {lead.location_city || 'Lagos'}</p>
                       </div>
                    </div>
                    {isWhale && <span className="bg-neonAmber text-black text-[8px] font-black px-2 py-1 rounded italic animate-pulse">WHALE DETECTED</span>}
                 </div>
               );
             })}
           </div>
        </section>

        {/* SYSTEM LOG (TERMINAL) */}
        <section className="hidden md:block bg-black border border-white/10 rounded-xl p-4 font-mono text-[10px]">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <TerminalIcon size={12} />
            <span className="uppercase tracking-widest">System Log</span>
          </div>
          <div className="h-32 overflow-y-auto space-y-1 scrollbar-hide">
            {logs.map((log, i) => (
              <p key={i} className="text-green-500/80"><span className="text-gray-600 mr-2">[{log.time}]</span> {log.msg}</p>
            ))}
          </div>
        </section>
      </main>

      {/* 3. FIXED BOTTOM NAVIGATION DOCK */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black border-t border-white/10 flex items-center justify-around px-2 z-50 pb-4">
        <button className="flex flex-col items-center gap-1 text-neonBlue"><Home size={22} /><span className="text-[8px] font-black uppercase">Home</span></button>
        <button className="flex flex-col items-center gap-1 text-gray-500"><Users size={22} /><span className="text-[8px] font-black uppercase">Leads</span></button>
        <button 
          onClick={() => setShowAddModal(true)}
          className="relative -top-6 h-16 w-16 bg-neonBlue rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,243,255,0.4)] active:scale-95 transition-transform"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500"><LayoutGrid size={22} /><span className="text-[8px] font-black uppercase">Inventory</span></button>
        <button className="flex flex-col items-center gap-1 text-gray-500"><BarChart3 size={22} /><span className="text-[8px] font-black uppercase">Stats</span></button>
      </nav>

      {/* ADD ASSET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-neonBlue/30 p-8 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-neonBlue font-black uppercase text-[10px] tracking-widest italic">Initialize Asset</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400"><X size={24} /></button>
            </div>
            <div className="space-y-4">
               <input placeholder="ASSET NAME" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-neonBlue" value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} />
               <input placeholder="PRICE (₦)" type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-neonBlue" value={newProp.price_naira} onChange={e => setNewProp({...newProp, price_naira: e.target.value})} />
               <input placeholder="IMAGE URL" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-neonBlue" value={newProp.thumbnail_url} onChange={e => setNewProp({...newProp, thumbnail_url: e.target.value})} />
            </div>
            <button 
              onClick={async () => {
                const { error } = await supabase.from('properties_db').insert([{ ...newProp, price_naira: parseInt(newProp.price_naira), status: 'Available', view_count: 0 }]);
                if (!error) { setShowAddModal(false); fetchData(); addLog(`NODE INITIALIZED: ${newProp.title}`); }
              }}
              className="w-full bg-neonBlue text-black font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.4em]"
            >
              Registry Deploy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
