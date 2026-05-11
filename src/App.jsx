import React, { useState, useEffect } from 'react';
import { Home, Users, BarChart3, Shield, Plus, X, Zap } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [stealth, setStealth] = useState(false);
  const [properties, setProperties] = useState([]);
  const [whalesActive, setWhalesActive] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState(null);
  const [newProp, setNewProp] = useState({ title: '', price_naira: '', thumbnail_url: '' });

  const fetchData = async () => {
    // FIXED: Removed the .order('created_at') which was causing the 403/Forbidden error
    const { data: P, error: errP } = await supabase
      .from('properties_db')
      .select('*');
    
    if (errP) {
      setDbStatus('offline');
      setErrorMessage(errP.message);
    } else {
      setProperties(P || []);
      setDbStatus('online');
      setErrorMessage(null);
    }
    
    // Count iPhone leads
    const { data: L } = await supabase.from('zenith_leads').select('*');
    const whales = L?.filter(l => l.device_type?.toLowerCase().includes('iphone')).length;
    setWhalesActive(whales || 0);
  };

  useEffect(() => {
    fetchData();
    // Real-time updates
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties_db' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addProperty = async () => {
    if (!newProp.title || !newProp.price_naira || !newProp.thumbnail_url) return;
    const { error } = await supabase.from('properties_db').insert([{ 
      title: newProp.title,
      price_naira: parseInt(newProp.price_naira),
      thumbnail_url: newProp.thumbnail_url,
      status: 'Available'
    }]);
    if (!error) {
      setShowAddModal(false);
      setNewProp({ title: '', price_naira: '', thumbnail_url: '' });
      fetchData();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* HUD HEADER */}
      <header className="flex-none flex items-center justify-between border-b border-white/10 bg-black p-4 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-neonBlue rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-black" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Vantage<span className="text-neonBlue">Onyx</span></h1>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${dbStatus === 'online' ? 'border-green-500/30 bg-green-500/10 text-green-500' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
          <div className={`h-1.5 w-1.5 rounded-full ${dbStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[9px] font-black uppercase tracking-widest ml-1">{dbStatus}</span>
        </div>
      </header>

      {/* ERROR HUD */}
      {errorMessage && (
        <div className="bg-red-600/20 border-b border-red-500/50 p-2 text-center animate-pulse">
          <p className="text-[9px] font-mono text-red-400 uppercase tracking-tighter">DATA_FETCH_FAILURE: {errorMessage}</p>
        </div>
      )}

      {/* MAIN INTELLIGENCE */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="rounded-2xl border border-neonBlue/20 bg-[#0A0A0A] p-6 shadow-2xl relative">
          <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Live Whale Connections</p>
          <h2 className="text-6xl font-black text-white mt-2 tracking-tighter">{whalesActive}</h2>
          <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-neonBlue animate-ping" />
        </div>

        <section>
          <div className="mb-4 flex justify-between items-end px-1">
            <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase italic">Asset Heatmap</h3>
            <span className="text-[9px] font-mono text-neonBlue uppercase">{properties.length} NODES ACTIVE</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-32">
            {properties.map(p => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] shadow-lg active:scale-95 transition-transform">
                <img src={p.thumbnail_url} alt="" className="h-28 w-full object-cover opacity-80" />
                <div className="p-3">
                  <p className="truncate text-[9px] font-black uppercase text-white mb-1">{p.title}</p>
                  <p className="font-mono text-[11px] text-neonBlue font-bold italic">₦{Number(p.price_naira).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-50 pb-2">
        <button className="flex flex-col items-center gap-1 min-w-[60px]">
          <Home className="text-neonBlue" size={22} />
          <span className="text-[8px] font-black uppercase text-neonBlue">Node</span>
        </button>
        <button className="flex flex-col items-center gap-1 min-w-[60px] opacity-20"><Users size={22} /><span className="text-[8px] font-black uppercase">Leads</span></button>
        <div className="relative -top-6">
          <button onClick={() => setShowAddModal(true)} className="h-16 w-16 bg-neonBlue rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,243,255,0.5)] active:scale-90 transition-transform">
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 min-w-[60px] opacity-20"><BarChart3 size={22} /><span className="text-[8px] font-black uppercase">Stats</span></button>
        <button onClick={() => setStealth(!stealth)} className="flex flex-col items-center gap-1 min-w-[60px]">
          <Shield className={stealth ? "text-amber-500" : "text-white opacity-20"} size={22} />
          <span className={`text-[8px] font-black uppercase tracking-tighter ${stealth ? 'text-amber-500' : 'text-white opacity-20'}`}>{stealth ? 'Mask' : 'Shield'}</span>
        </button>
      </nav>

      {/* ASSET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-neonBlue/30 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-neonBlue font-black uppercase text-[10px] tracking-widest">Asset Registry</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 p-2"><X size={24} /></button>
            </div>
            <div className="space-y-4">
               <input placeholder="ASSET NAME" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:border-neonBlue transition-all" value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} />
               <input placeholder="PRICE (₦)" type="number" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:border-neonBlue transition-all" value={newProp.price_naira} onChange={e => setNewProp({...newProp, price_naira: e.target.value})} />
               <input placeholder="IMAGE URL" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:border-neonBlue transition-all" value={newProp.thumbnail_url} onChange={e => setNewProp({...newProp, thumbnail_url: e.target.value})} />
            </div>
            <button onClick={addProperty} className="w-full bg-neonBlue text-black font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.4em] active:scale-95 transition-transform">Initialize Node</button>
          </div>
        </div>
      )}
    </div>
  );
}
