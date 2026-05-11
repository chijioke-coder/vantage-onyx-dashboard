import React, { useState, useEffect } from 'react';
import { Home, Users, Package, BarChart3, Shield, ShieldOff, Search, MessageCircle, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [stealth, setStealth] = useState(false);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [whalesActive, setWhalesActive] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  // Synced state keys to match your Supabase columns
  const [newProp, setNewProp] = useState({ title: '', price_naira: '', thumbnail_url: '', location_tag: 'Lekki' });

  const fetchData = async () => {
    const { data: L } = await supabase.from('zenith_leads').select('*').order('created_at', { ascending: false });
    // Pulling from properties_db with your specific column names
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
    if (!newProp.title || !newProp.price_naira || !newProp.thumbnail_url) {
      alert("All tactical fields required.");
      return;
    }
    // Matching your column schema exactly
    await supabase.from('properties_db').insert([{ 
      ...newProp, 
      view_count: 0,
      status: 'Available' 
    }]);
    setNewProp({ title: '', price_naira: '', thumbnail_url: '', location_tag: 'Lekki' });
    setShowAddModal(false);
    fetchData();
  };

  const deleteProperty = async (id) => {
    await supabase.from('properties_db').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-black pb-24 text-white font-sans">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-neonBlue rounded-full flex items-center justify-center font-black text-black">VO</div>
          <h1 className="text-xl font-black tracking-tighter text-neonBlue uppercase italic">Vantage Onyx</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="p-2 border border-neonBlue/30 bg-neonBlue/10 rounded-lg text-neonBlue">
            <Plus size={20} />
          </button>
          <button onClick={() => setStealth(!stealth)} className="rounded-lg border border-white/10 p-2">
            {stealth ? <ShieldOff className="text-amber-500" /> : <Shield className="text-neonBlue" />}
          </button>
        </div>
      </header>

      <main className="space-y-6 p-4">
        <div className="rounded-2xl border border-neonBlue/20 bg-gradient-to-br from-onyx to-black p-6 shadow-2xl">
          <p className="text-[10px] tracking-widest text-gray-500 uppercase font-bold">Live Whale Connections</p>
          <h2 className="text-5xl font-black text-white">{whalesActive}</h2>
        </div>

        <section>
          <h3 className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase flex justify-between">
            <span>Asset Heatmap</span>
            <span className="text-neonBlue">{properties.length} Active</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {properties.map(p => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] transition-all">
                <div className="relative h-28 w-full bg-gray-900">
                  {/* Using thumbnail_url from your DB */}
                  <img src={p.thumbnail_url} alt="property" className="h-full w-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold text-neonBlue uppercase tracking-tighter">
                    {p.location_tag || 'Lagos'}
                  </div>
                  <button onClick={() => deleteProperty(p.id)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-red-500 backdrop-blur-md"><Trash2 size={12} /></button>
                </div>
                <div className="p-3">
                  {/* Using title and price_naira from your DB */}
                  <p className="truncate text-[10px] font-black uppercase text-white mb-1">{p.title}</p>
                  <p className="font-mono text-xs text-neonBlue font-bold">₦{Number(p.price_naira).toLocaleString()}</p>
                  <div className="mt-2 flex justify-between items-center border-t border-white/5 pt-2">
                    <span className="text-[8px] text-gray-500 uppercase font-medium">Views: {p.view_count || 0}</span>
                    <a href={`https://wa.me/234XXXXXXXXXX?text=Inquiry: ${p.title}`} className="text-green-500"><MessageCircle size={14} /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-neonBlue/30 p-6 rounded-3xl space-y-4 shadow-[0_0_50px_rgba(0,243,255,0.1)]">
            <div className="flex justify-between items-center">
              <h2 className="text-neonBlue font-black uppercase tracking-[0.2em] text-xs">Deploy Asset</h2>
              <button onClick={() => setShowAddModal(false)}><X className="text-gray-500" /></button>
            </div>
            
            <div className="space-y-4">
               <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">Asset Title</label>
                  <input placeholder="E.G. THE IVORY PAVILION" className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs uppercase text-white outline-none focus:border-neonBlue" value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} />
               </div>

               <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">Price (₦)</label>
                  <input placeholder="60000000" type="number" className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white outline-none focus:border-neonBlue" value={newProp.price_naira} onChange={e => setNewProp({...newProp, price_naira: e.target.value})} />
               </div>

               <div className="space-y-1">
                  <label className="text-[9px] text-gray-500 font-bold uppercase ml-1">Thumbnail Image Link</label>
                  <div className="flex items-center bg-black border border-white/10 rounded-xl px-3 focus-within:border-neonBlue transition-all">
                     <ImageIcon size={14} className="text-gray-600" />
                     <input placeholder="HTTPS://POSTIMG.CC/IMAGE.JPG" className="w-full bg-transparent p-3 text-xs text-white outline-none" value={newProp.thumbnail_url} onChange={e => setNewProp({...newProp, thumbnail_url: e.target.value})} />
                  </div>
               </div>
            </div>

            <button onClick={addProperty} className="w-full bg-neonBlue text-black font-black py-4 rounded-xl uppercase text-[11px] tracking-[0.3em] shadow-lg shadow-neonBlue/20">Authorize Upload</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-white/10 bg-black/80 backdrop-blur-lg p-5 z-50">
        <Home className="text-neonBlue" />
        <Users className="text-gray-600" />
        <div className="relative -top-8 h-14 w-14 bg-neonBlue rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.4)]" onClick={() => setShowAddModal(true)}>
            <Plus className="text-black" size={28} />
        </div>
        <BarChart3 className="text-gray-600" />
      </nav>
    </div>
  );
}
