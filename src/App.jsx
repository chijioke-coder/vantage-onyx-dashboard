import React, { useState, useEffect } from 'react';
import { Home, Users, Package, BarChart3, Shield, ShieldOff, Zap, Search, MessageCircle, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
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
    if (!newProp.name || !newProp.price || !newProp.image_url) {
      alert("MISSION CRITICAL: All fields including Thumbnail Link are required.");
      return;
    }
    await supabase.from('properties_db').insert([{ ...newProp, view_count: 0 }]);
    setNewProp({ name: '', price: '', image_url: '' });
    setShowAddModal(false);
    fetchData();
  };

  const deleteProperty = async (id) => {
    await supabase.from('properties_db').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-black pb-24 text-white font-sans selection:bg-neonBlue/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black p-4">
        <div className="flex items-center gap-2">
          <img src="https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png" className="h-8 w-8" alt="logo" />
          <h1 className="text-xl font-black tracking-tighter text-neonBlue uppercase">Vantage Onyx</h1>
        </div>
        <div className="flex gap-2">
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

        {/* PROPERTY HEATMAP */}
        <section>
          <h3 className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase">Property Interest Heatmap</h3>
          <div className="grid grid-cols-2 gap-2">
            {properties.map(p => (
              <div key={p.id} className={`overflow-hidden rounded-lg border bg-onyx transition-all ${p.view_count > 500 ? 'border-red-600 bg-red-950/10' : 'border-white/10'}`}>
                <div className="relative h-24 w-full bg-gray-900">
                  <img src={p.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=500'} alt="property" className="h-full w-full object-cover opacity-80" />
                  <button onClick={() => deleteProperty(p.id)} className="absolute top-1 right-1 p-1 bg-black/60 rounded text-red-500"><Trash2 size={12} /></button>
                </div>
                <div className="p-2">
                  <p className="truncate text-[9px] font-black uppercase text-white">{p.name || 'Untitled Asset'}</p>
                  <p className="font-mono text-[11px] text-neonBlue">₦{Number(p.price).toLocaleString()}</p>
                  <div className="mt-1 flex justify-between items-center border-t border-white/5 pt-1">
                    <span className="text-[7px] text-gray-500 uppercase">Views: {p.view_count}</span>
                    <a href={`https://wa.me/234XXXXXXXXXX?text=Vantage Onyx Inquiry: ${p.name}`} className="text-green-500"><MessageCircle size={12} /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INTELLIGENCE FEED */}
        <section>
          <h3 className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase">Intelligence Feed</h3>
          <div className="space-y-2">
            {leads.length > 0 ? leads.map(l => (
              <div key={l.id} className="rounded-lg border border-white/5 bg-onyx p-4">
                <span className={`font-bold uppercase text-[10px] ${stealth ? 'bg-white/10 text-transparent' : ''}`}>{l.full_name}</span>
                <p className="text-[8px] text-gray-500 mt-1 uppercase">{l.device_type} • {l.location}</p>
              </div>
            )) : (
              <div className="py-10 text-center border border-dashed border-white/5 rounded-xl">
                 <p className="text-[9px] text-gray-700 tracking-[0.2em] uppercase font-bold">System Listening for Real-Time Leads...</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-neonBlue/50 p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h2 className="text-neonBlue font-black uppercase tracking-widest text-sm italic">Add New Asset</h2>
              <button onClick={() => setShowAddModal(false)}><X className="text-gray-500" /></button>
            </div>
            
            <div className="space-y-1">
               <label className="text-[8px] text-neonBlue font-bold uppercase ml-1">Asset Identity</label>
               <input placeholder="E.G. BANANA ISLAND PENTHOUSE" className="w-full bg-black border border-white/10 p-3 rounded-xl text-[10px] uppercase text-white outline-none focus:border-neonBlue" value={newProp.name} onChange={e => setNewProp({...newProp, name: e.target.value})} />
            </div>

            <div className="space-y-1">
               <label className="text-[8px] text-neonBlue font-bold uppercase ml-1">Market Price (₦)</label>
               <input placeholder="NUMBERS ONLY" type="number" className="w-full bg-black border border-white/10 p-3 rounded-xl text-[10px] text-white outline-none focus:border-neonBlue" value={newProp.price} onChange={e => setNewProp({...newProp, price: e.target.value})} />
            </div>

            <div className="space-y-1">
               <label className="text-[8px] text-neonBlue font-bold uppercase ml-1">Thumbnail Image Direct Link</label>
               <div className="flex items-center bg-black border border-white/10 rounded-xl px-3 focus-within:border-neonBlue transition-all">
                  <ImageIcon size={14} className="text-gray-600" />
                  <input placeholder="HTTPS://IMAGE-URL.JPG" className="w-full bg-transparent p-3 text-[10px] text-white outline-none" value={newProp.image_url} onChange={e => setNewProp({...newProp, image_url: e.target.value})} />
               </div>
            </div>

            <button onClick={addProperty} className="w-full bg-neonBlue text-black font-black py-4 rounded-xl uppercase text-[10px] tracking-[0.3em] hover:bg-white transition-colors">Confirm Deployment</button>
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
