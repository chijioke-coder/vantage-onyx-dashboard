import React, { useState, useEffect } from 'react';
import { Home, Users, BarChart3, Shield, ShieldOff, Plus, X, Image as ImageIcon, Zap, Wifi, WifiOff } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [stealth, setStealth] = useState(false);
  const [properties, setProperties] = useState([]);
  const [whalesActive, setWhalesActive] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting');
  const [newProp, setNewProp] = useState({ title: '', price_naira: '', thumbnail_url: '' });

  const fetchData = async () => {
    // Fetching from properties_db
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
    
    // Fetching from zenith_leads
    const { data: L } = await supabase.from('zenith_leads').select('*');
    const whales = L?.filter(l => l.device_type?.toLowerCase().includes('iphone')).length;
    setWhalesActive(whales || 0);
  };

  useEffect(() => {
    fetchData();
    
    // Real-time listener for instant updates
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-neonBlue/30 pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/90 backdrop-blur-md p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-neonBlue rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <Zap size={18} className="text-black" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Vantage<span className="text-neonBlue">Onyx</span></h1>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${dbStatus === 'online' ? 'border-green-500/30 bg-green-500/10 text-green-500' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
          {dbStatus === 'online' ? <Wifi size={10} /> : <WifiOff size={10} />}
          <span className="text-[9px] font-bold uppercase">{dbStatus}</span>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* WHALE COUNTER */}
        <div className="rounded-2xl border border-neonBlue/20 bg-gradient-to-br from-[#0A0A0A] to-black p-6 shadow-2xl">
          <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Live Whale Connections</p>
          <h2 className="text-5xl font-black text-white mt-2">{whalesActive}</h2>
        </div>

        {/* ASSET HEATMAP */}
        <section>
          <div className="mb-4 flex justify-between items-end">
            <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase italic">Asset Heatmap</h3>
            <span className="text-[9px] font-mono text-neonBlue bg-neonBlue/10 px-2 py-0.5 rounded-full border border-neonBlue/20">
              {properties.length} NODES ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {properties.map(p => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] active:scale-95 transition-transform">
                <div className="relative h-28 w-full bg-gray-900">
                  <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover opacity-90" />
                </div>
                <div className="p-3">
                  <p className="truncate text-[9px] font-black uppercase text-white mb-1">{p.title}</p>
                  <p className="font-mono text-[11px] text-neonBlue font-bold italic">₦{Number(p.price_naira).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* RESTORED NAVIGATION MENU */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-white/10 bg-black/80 backdrop-blur-xl p-6 z-50">
        <Home className="text-neonBlue" size={22} />
        <Users className="text-gray-600" size={22} />
        <div 
          className="relative -top-10 h-16 w-16 bg-neonBlue rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,243,255,0.5)] active:scale-90 transition-transform"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="text-black" size={32} strokeWidth={3} />
        </div>
        <BarChart3 className="text-gray-600" size={22} />
        <button onClick={() => setStealth(!stealth)}>
          {stealth ? <ShieldOff className="text-amber-500" size={22} /> : <Shield className="text-gray-600" size={22} />}
        </button>
      </nav>

      {/* ADD ASSET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-neonBlue/30 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-neonBlue font-black uppercase tracking-[0.2em] text-[10px]">Asset Deployment</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 p-2"><X size={24} /></button>
            </div>
            <div className="space-y-4">
               <input placeholder="ASSET IDENTITY" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-xs uppercase text-white outline-none focus:border-neonBlue" value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} />
               <input placeholder="MARKET PRICE (₦)" type="number" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:border-neonBlue" value={newProp.price_naira} onChange={e => setNewProp({...newProp, price_naira: e.target.value})} />
               <input placeholder="THUMBNAIL IMAGE URL" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:border-neonBlue" value={newProp.thumbnail_url} onChange={e => setNewProp({...newProp, thumbnail_url: e.target.value})} />
            </div>
            <button onClick={addProperty} className="w-full bg-neonBlue text-black font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.4em] active:bg-white transition-colors">Confirm Deployment</button>
          </div>
        </div>
      )}
    </div>
  );
}
