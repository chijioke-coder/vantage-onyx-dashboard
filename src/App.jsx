import React, { useState, useEffect } from 'react';
import { Home, Users, Package, BarChart3, Shield, ShieldOff, Zap, Search, MessageCircle, Plus, Trash2, X } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [stealth, setStealth] = useState(false);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [whalesActive, setWhalesActive] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProp, setNewProp] = useState({ name: '', price: '', image_url: '' });

  const fetchData = async () => {
    const { data: L } = await supabase.from('zenith_leads').select('*').order('created_at', { ascending: false });
    const { data: P } = await supabase.from('properties_db').select('*').order('created_at', { ascending: false });
    setLeads(L || []);
    setProperties(P || []);
    const whales = L?.filter(l => l.device_type?.includes('iPhone') && l.dwell_time > 180).length;
    setWhalesActive(whales || 0);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addProperty = async () => {
    if (!newProp.name || !newProp.price) return;
    await supabase.from('properties_db').insert([{ ...newProp, view_count: 0 }]);
    setNewProp({ name: '', price: '', image_url: '' });
    setShowAddModal(false);
    fetchData();
  };

  const deleteProperty = async (id) => {
    if (properties.length <= 10) {
      alert("SAFETY LOCK: Minimum 10 properties required for heatmap stability.");
      return;
    }
    await supabase.from('properties_db').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-black pb-24 text-white font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black p-4">
        <div className="flex items-center gap-2">
          <img src="https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png" className="h-8 w-8" alt="logo" />
          <h1 className="text-xl font-black tracking-tighter text-neonBlue uppercase">Vantage Onyx</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="p-2 border border-neonBlue bg-neonBlue/10 rounded-lg text-neonBlue">
            <Plus size={20} />
          </button>
          <button onClick={() => setStealth(!stealth)} className="rounded-lg border border-white/10 p-2">
            {stealth ? <ShieldOff className="text-neonAmber" /> : <Shield className="text-neonBlue" />}
          </button>
        </div>
      </header>

      <main className="space-y-6 p-4">
        {/* STATS */}
        <div className="rounded-xl border border-neonBlue bg-onyx p-6">
          <p className="text-[10px] tracking-widest text-gray-500 uppercase font-bold">Whales Active</p>
          <h2 className="text-4xl font-black text-white">{whalesActive}</h2>
        </div>

        {/* HEATMAP */}
        <section>
          <h3 className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase">Property Interest Heatmap</h3>
          <div className="grid grid-cols-2 gap-2">
            {properties.map(p => (
              <div key={p.id} className={`rounded-lg border bg-onyx p-3 ${p.view_count > 500 ? 'border-red-600 bg-red-950/20' : 'border-white/10'}`}>
                <div className="flex justify-between items-start">
                  <p className="truncate text-[10px] font-bold uppercase w-3/4">{p.name || 'Unnamed'}</p>
                  <button onClick={() => deleteProperty(p.id)} className="text-gray-700 hover:text-red-500"><Trash2 size={10} /></button>
                </div>
                <p className="font-mono text-xs text-neonBlue">₦{Number(p.price).toLocaleString()}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-[8px] text-gray-600 font-bold uppercase">Views: {p.view_count}</span>
                  <a href={`https://wa.me/234XXXXXXXXXX?text=Hello, I'm interested in ${p.name}`} className="text-green-500"><MessageCircle size={14} /></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEED */}
        <section>
          <h3 className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase">Intelligence Feed</h3>
          <div className="space-y-2 text-center py-10 border border-dashed border-white/5 rounded-xl">
             <p className="text-gray-600 text-xs tracking-widest uppercase">Awaiting Live Traffic...</p>
          </div>
        </section>
      </main>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-onyx border border-neonBlue p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-neonBlue font-black uppercase tracking-tighter">New Asset</h2>
              <button onClick={() => setShowAddModal(false)}><X className="text-gray-500" /></button>
            </div>
            <input placeholder="PROPERTY NAME" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs uppercase" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} />
            <input placeholder="PRICE (NUMBERS ONLY)" type="number" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs" value={newProp.price} onChange={e => setNewProp({...newProp, price: e.target.value})} />
            <button onClick={addProperty} className="w-full bg-neonBlue text-black font-black py-4 rounded-xl uppercase text-xs tracking-widest">Deploy to Heatmap</button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-white/10 bg-black p-4 z-50">
        <Home className="text-neonBlue" />
        <Users className="text-gray-600" />
        <Package className="text-neonBlue" onClick={() => setShowAddModal(true)} />
        <BarChart3 className="text-gray-600" />
      </nav>
    </div>
  );
}
