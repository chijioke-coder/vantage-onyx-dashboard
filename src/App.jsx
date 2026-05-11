import React, { useState, useEffect } from 'react';
import { Home, Users, BarChart3, Shield, Plus, X, Zap } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [stealth, setStealth] = useState(false);
  const [properties, setProperties] = useState([]);
  const [whalesActive, setWhalesActive] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting');
  const [errorMessage, setErrorMessage] = useState(null); // Debug state
  const [newProp, setNewProp] = useState({ title: '', price_naira: '', thumbnail_url: '' });

  const fetchData = async () => {
    // Attempt fetch from properties_db
    const { data: P, error: errP } = await supabase
      .from('properties_db')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (errP) {
      setDbStatus('offline');
      setErrorMessage(errP.message); // Capture the exact error
    } else {
      setProperties(P || []);
      setDbStatus('online');
      setErrorMessage(null);
    }
    
    const { data: L } = await supabase.from('zenith_leads').select('*');
    const whales = L?.filter(l => l.device_type?.toLowerCase().includes('iphone')).length;
    setWhalesActive(whales || 0);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* HEADER */}
      <header className="flex-none flex items-center justify-between border-b border-white/10 bg-black p-4 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-neonBlue rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-black" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Vantage<span className="text-neonBlue">Onyx</span></h1>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${dbStatus === 'online' ? 'border-green-500/30 text-green-500' : 'border-red-500/30 text-red-500'}`}>
          <span className="text-[9px] font-black uppercase tracking-widest">{dbStatus}</span>
        </div>
      </header>

      {/* DEBUG OVERLAY - Only shows if Offline */}
      {dbStatus === 'offline' && errorMessage && (
        <div className="bg-red-600/20 border-b border-red-500/50 p-2 text-center">
          <p className="text-[10px] font-mono text-red-400 uppercase tracking-tighter">
            System Error: {errorMessage}
          </p>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="rounded-2xl border border-neonBlue/20 bg-[#0A0A0A] p-6 shadow-2xl">
          <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Live Whale Connections</p>
          <h2 className="text-6xl font-black text-white mt-2 tracking-tighter">{whalesActive}</h2>
        </div>

        <section>
          <div className="mb-4 flex justify-between items-end px-1">
            <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase italic">Asset Heatmap</h3>
            <span className="text-[9px] font-mono text-neonBlue uppercase">{properties.length} NODES</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-32">
            {properties.map(p => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A]">
                <img src={p.thumbnail_url} alt="" className="h-28 w-full object-cover opacity-80" />
                <div className="p-3">
                  <p className="truncate text-[9px] font-black text-white mb-1 uppercase">{p.title}</p>
                  <p className="font-mono text-[11px] text-neonBlue font-bold italic">₦{Number(p.price_naira).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER NAV */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/90 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 z-50">
        <button className="flex flex-col items-center gap-1 opacity-100"><Home className="text-neonBlue" size={22} /><span className="text-[8px] font-black uppercase text-neonBlue">Node</span></button>
        <button className="flex flex-col items-center gap-1 opacity-20"><Users size={22} /><span className="text-[8px] font-black uppercase">Leads</span></button>
        <button onClick={() => setShowAddModal(true)} className="relative -top-6 h-16 w-16 bg-neonBlue rounded-full flex items-center justify-center text-black shadow-lg"><Plus size={32} strokeWidth={3} /></button>
        <button className="flex flex-col items-center gap-1 opacity-20"><BarChart3 size={22} /><span className="text-[8px] font-black uppercase">Stats</span></button>
        <button className="flex flex-col items-center gap-1 opacity-20"><Shield size={22} /><span className="text-[8px] font-black uppercase">Shield</span></button>
      </nav>
    </div>
  );
}
