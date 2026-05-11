import React, { useState, useEffect } from 'react';
import { Plus, X, Image as ImageIcon, Zap, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [properties, setProperties] = useState([]);
  const [whalesActive, setWhalesActive] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting');
  const [newProp, setNewProp] = useState({ title: '', price_naira: '', thumbnail_url: '' });

  const fetchData = async () => {
    // Attempting to reach properties_db
    const { data: P, error: errP } = await supabase.from('properties_db').select('*');
    
    if (errP) {
      console.error("DB Error:", errP);
      setDbStatus('offline');
    } else {
      setProperties(P || []);
      setDbStatus('online');
    }
    
    // Attempting to reach zenith_leads
    const { data: L } = await supabase.from('zenith_leads').select('*');
    const whales = L?.filter(l => l.device_type?.toLowerCase().includes('iphone')).length;
    setWhalesActive(whales || 0);
  };

  useEffect(() => {
    fetchData();
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
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      {/* STATUS BAR */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-neonBlue" />
          <h1 className="text-xl font-black italic uppercase">Vantage<span className="text-neonBlue">Onyx</span></h1>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${dbStatus === 'online' ? 'border-green-500/30 bg-green-500/10 text-green-500' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
          {dbStatus === 'online' ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span className="text-[10px] font-bold uppercase">{dbStatus}</span>
        </div>
      </div>

      {/* WHALE COUNTER */}
      <div className="rounded-2xl border border-neonBlue/20 bg-[#0A0A0A] p-6 mb-8 shadow-2xl">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live Whale Connections</p>
        <h2 className="text-6xl font-black mt-2">{whalesActive}</h2>
      </div>

      {/* HEATMAP */}
      <div className="flex justify-between items-end mb-4 px-1">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Heatmap</h3>
        <span className="text-neonBlue text-[10px] font-mono">{properties.length} NODES ACTIVE</span>
      </div>

      {dbStatus === 'offline' && (
        <div className="p-8 border border-dashed border-red-500/20 rounded-2xl text-center bg-red-500/5">
          <AlertCircle className="mx-auto text-red-500 mb-2" />
          <p className="text-xs text-red-400 font-bold uppercase">Critical: Check Vercel API Keys</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {properties.map(p => (
          <div key={p.id} className="rounded-xl border border-white/10 bg-[#0A0A0A] overflow-hidden active:scale-95 transition-transform">
            <img src={p.thumbnail_url} className="h-28 w-full object-cover opacity-80" alt="" />
            <div className="p-3">
              <p className="truncate text-[10px] font-bold uppercase text-white mb-1">{p.title}</p>
              <p className="text-neonBlue font-mono text-xs font-bold italic">₦{Number(p.price_naira).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ACTION BUTTON */}
      <button onClick={() => setShowAddModal(true)} className="fixed bottom-10 right-6 h-16 w-16 bg-neonBlue rounded-full flex items-center justify-center text-black shadow-lg shadow-neonBlue/30 z-50">
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0D0D0D] border border-white/10 p-8 rounded-[2rem] space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-neonBlue font-black uppercase text-[10px] tracking-widest">Add New Asset</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500"><X size={24} /></button>
            </div>
            <div className="space-y-4">
               <input placeholder="ASSET NAME" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs uppercase text-white outline-none focus:border-neonBlue" value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} />
               <input placeholder="PRICE (NUMBERS ONLY)" type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-neonBlue" value={newProp.price_naira} onChange={e => setNewProp({...newProp, price_naira: e.target.value})} />
               <input placeholder="IMAGE URL" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-neonBlue" value={newProp.thumbnail_url} onChange={e => setNewProp({...newProp, thumbnail_url: e.target.value})} />
            </div>
            <button onClick={addProperty} className="w-full bg-neonBlue text-black font-black py-4 rounded-xl uppercase text-[10px] tracking-widest active:bg-cyan-400 transition-colors">Confirm Deployment</button>
          </div>
        </div>
      )}
    </div>
  );
}
