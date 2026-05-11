import React, { useState, useEffect } from 'react';
import { Home, Users, BarChart3, Shield, ShieldOff, Plus, X, Zap, Wifi, WifiOff } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [stealth, setStealth] = useState(false);
  const [properties, setProperties] = useState([]);
  const [whalesActive, setWhalesActive] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting');
  const [newProp, setNewProp] = useState({ title: '', price_naira: '', thumbnail_url: '' });

  const fetchData = async () => {
    const { data: P, error: errP } = await supabase
      .from('properties_db')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (errP) {
      setDbStatus('offline');
    } else {
      setProperties(P || []);
      setDbStatus('online');
    }
    
    const { data: L } = await supabase.from('zenith_leads').select('*');
    const whales = L?.filter(l => l.device_type?.toLowerCase().includes('iphone')).length;
    setWhalesActive(whales || 0);
  };

  useEffect(() => {
    fetchData();
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
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      
      {/* HEADER: Z-60 to stay above everything */}
      <header className="sticky top-0 z-[60] flex items-center justify-between border-b border-white/10 bg-black p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-neonBlue rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-black" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Vantage<span className="text-neonBlue">Onyx</span></h1>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${dbStatus === 'online' ? 'border-green-500/30 text-green-500' : 'border-red-500/30 text-red-500'}`}>
          <span className="text-[9px] font-bold uppercase tracking-widest">{dbStatus}</span>
        </div>
      </header>

      {/* CONTENT: pb-40 ensures we can scroll past the fixed nav */}
      <main className="p-4 space-y-6 pb-40">
        <div className="rounded-2xl border border-neonBlue/20 bg-[#0A0A0A] p-6 shadow-2xl">
          <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Live Whale Connections</p>
          <h2 className="text-5xl font-black text-white mt-2">{whalesActive}</h2>
        </div>

        <section>
          <div className="mb-4 flex justify-between items-end px-1">
            <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase italic text-opacity-50">Asset Heatmap</h3>
            <span className="text-[9px] font-mono text-neonBlue uppercase">{properties.length} NODES</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {properties.map(p => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]">
                <img src={p.thumbnail_url} alt="" className="h-28 w-full object-cover" />
                <div className="p-3">
                  <p className="truncate text-[9px] font-black uppercase text-white mb-1">{p.title}</p>
                  <p className="font-mono text-[11px] text-neonBlue font-bold">₦{Number(p.price_naira).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FIXED NAV: Using solid background and z-70 for total visibility */}
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-[#050505] border-t border-white/10 flex items-center justify-around px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]" 
           style={{ height: 'calc(80px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        
        <button className="flex flex-col items-center gap-1 min-w-[60px]">
          <Home className="text-neonBlue" size={20} />
          <span className="text-[8px] font-black uppercase text-neonBlue">Node</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 min-w-[60px] opacity-20">
          <Users className="text-white" size={20} />
          <span className="text-[8px] font-black uppercase text-white">Leads</span>
        </button>

        {/* PLUS BUTTON: Centered and lifted */}
        <div className="relative -top-6">
          <button 
            onClick={() => setShowAddModal(true)}
            className="h-16 w-16 bg-neonBlue rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,243,255,0.4)] active:scale-90 transition-transform"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        <button className="flex flex-col items-center gap-1 min-w-[60px] opacity-20">
          <BarChart3 className="text-white" size={20} />
          <span className="text-[8px] font-black uppercase text-white">Stats</span>
        </button>

        <button onClick={() => setStealth(!stealth)} className="flex flex-col items-center gap-1 min-w-[60px]">
          <Shield className={stealth ? "text-amber-500" : "text-white opacity-20"} size={20} />
          <span className={`text-[8px] font-black uppercase ${stealth ? 'text-amber-500' : 'text-white opacity-20'}`}>
            {stealth ? 'Mask' : 'Shield'}
          </span>
        </button>
      </nav>

      {/* MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-neonBlue/30 p-8 rounded-[2rem] space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-neonBlue font-black uppercase text-[10px] tracking-widest">Deploy Asset</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500"><X size={24} /></button>
            </div>
            <input placeholder="ASSET IDENTITY" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none" value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} />
            <input placeholder="PRICE (₦)" type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none" value={newProp.price_naira} onChange={e => setNewProp({...newProp, price_naira: e.target.value})} />
            <input placeholder="IMAGE URL" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none" value={newProp.thumbnail_url} onChange={e => setNewProp({...newProp, thumbnail_url: e.target.value})} />
            <button onClick={addProperty} className="w-full bg-neonBlue text-black font-black py-4 rounded-xl uppercase text-[10px] mt-2">Authorize</button>
          </div>
        </div>
      )}
    </div>
  );
}
