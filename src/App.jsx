import React, { useState, useEffect } from 'react';
import { Home, Users, Package, BarChart3, Shield, ShieldOff, Search, MessageCircle, Plus, Trash2, X, Image as ImageIcon, Zap } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [stealth, setStealth] = useState(false);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [whalesActive, setWhalesActive] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // State for adding new assets - Synced with your DB columns
  const [newProp, setNewProp] = useState({ 
    title: '', 
    price_naira: '', 
    thumbnail_url: '', 
    location_tag: 'Lekki' 
  });

  // THE MASTER FETCH ENGINE
  const fetchData = async () => {
    // 1. Fetch Leads from zenith_leads
    const { data: L, error: errL } = await supabase
      .from('zenith_leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 2. Fetch Properties from properties_db
    const { data: P, error: errP } = await supabase
      .from('properties_db')
      .select('*')
      .order('created_at', { ascending: false });

    if (errP) console.error("Property Fetch Error:", errP);
    if (errL) console.error("Leads Fetch Error:", errL);
    
    setLeads(L || []);
    setProperties(P || []);
    
    // Calculate Whales (iPhone users with high dwell time)
    const whales = L?.filter(l => 
      (l.device_type?.toLowerCase().includes('iphone')) && 
      l.dwell_time > 180
    ).length;
    
    setWhalesActive(whales || 0);
  };

  useEffect(() => {
    fetchData();

    // REAL-TIME HANDSHAKE (Requires Publication toggles we discussed)
    const channel = supabase.channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties_db' }, () => {
        console.log("Real-time property update detected!");
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zenith_leads' }, () => {
        console.log("Real-time lead detected!");
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // DEPLOYMENT LOGIC
  const addProperty = async () => {
    if (!newProp.title || !newProp.price_naira || !newProp.thumbnail_url) {
      alert("MISSION CRITICAL: All tactical fields required.");
      return;
    }
    
    const { error } = await supabase.from('properties_db').insert([{ 
      title: newProp.title,
      price_naira: parseInt(newProp.price_naira),
      thumbnail_url: newProp.thumbnail_url,
      location_tag: newProp.location_tag,
      view_count: 0,
      status: 'Available' 
    }]);

    if (error) {
      alert("Deployment Failed: Check your Supabase RLS policies.");
    } else {
      setNewProp({ title: '', price_naira: '', thumbnail_url: '', location_tag: 'Lekki' });
      setShowAddModal(false);
      fetchData();
    }
  };

  const deleteProperty = async (id) => {
    await supabase.from('properties_db').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-black pb-32 text-white font-sans selection:bg-neonBlue/30">
      {/* TACTICAL HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/90 backdrop-blur-md p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-neonBlue rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <Zap size={18} className="text-black" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Vantage<span className="text-neonBlue">Onyx</span></h1>
        </div>
        <button onClick={() => setStealth(!stealth)} className="rounded-lg border border-white/10 p-2 active:bg-white/5">
          {stealth ? <ShieldOff className="text-amber-500" /> : <Shield className="text-neonBlue" />}
        </button>
      </header>

      <main className="space-y-6 p-4">
        {/* WHALE COUNTER */}
        <div className="rounded-2xl border border-neonBlue/20 bg-gradient-to-br from-[#0A0A0A] to-black p-6 shadow-2xl">
          <div className="flex justify-between items-start">
            <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">Live Whale Connections</p>
            <div className="h-2 w-2 rounded-full bg-neonBlue animate-pulse" />
          </div>
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
              <div key={p.id} className="group overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0A] transition-all active:scale-95">
                <div className="relative h-28 w-full bg-gray-900">
                  <img src={p.thumbnail_url} alt="" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-neonBlue uppercase tracking-tighter border border-white/5">
                    {p.location_tag || 'Lagos'}
                  </div>
                  <button onClick={() => deleteProperty(p.id)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-red-500 backdrop-blur-md border border-white/5">
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="p-3">
                  <p className="truncate text-[10px] font-black uppercase text-white mb-1 tracking-tight">{p.title}</p>
                  <p className="font-mono text-xs text-neonBlue font-bold tracking-tighter">₦{Number(p.price_naira).toLocaleString()}</p>
                  <div className="mt-2 flex justify-between items-center border-t border-white/5 pt-2">
                    <span className="text-[8px] text-gray-600 uppercase font-bold">Views: {p.view_count || 0}</span>
                    <a href={`https://wa.me/234XXXXXXXXXX?text=Inquiry: ${p.title}`} className="text-green-500 active:scale-125 transition-transform">
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FEED */}
        <section className="pb-10">
          <h3 className="mb-3 text-[10px] font-black tracking-widest text-gray-500 uppercase italic">Intelligence Feed</h3>
          <div className="space-y-2">
            {leads.length > 0 ? leads.slice(0, 10).map(l => (
              <div key={l.id} className="rounded-xl border border-white/5 bg-[#080808] p-4 flex items-center justify-between">
                <div>
                  <span className={`text-[11px] font-black uppercase tracking-tight ${stealth ? 'bg-white/10 text-transparent select-none rounded' : 'text-white'}`}>
                    {l.full_name}
                  </span>
                  <p className="text-[8px] text-gray-600 mt-0.5 uppercase font-bold tracking-tighter">
                    {l.device_type} • {l.location}
                  </p>
                </div>
                {l.device_type?.toLowerCase().includes('iphone') && <div className="h-2 w-2 rounded-full bg-neonAmber shadow-[0_0_10px_rgba(255,171,0,0.5)]" />}
              </div>
            )) : (
              <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                 <p className="text-[9px] text-gray-700 tracking-[0.3em] uppercase font-black">Scanning For Live Lead Frequency...</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ADD ASSET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-neonBlue/30 p-8 rounded-[2.5rem] space-y-6 shadow-[0_0_60px_rgba(0,243,255,0.15)]">
            <div className="flex justify-between items-center">
              <h2 className="text-neonBlue font-black uppercase tracking-[0.3em] text-[10px] italic underline underline-offset-8">Authorize New Asset</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-white/5 rounded-full text-gray-500"><X size={18} /></button>
            </div>
            
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-600 font-black uppercase ml-1">Asset Identity</label>
                  <input placeholder="E.G. THE IVORY PAVILION" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-xs uppercase text-white outline-none focus:border-neonBlue transition-all" value={newProp.title} onChange={e => setNewProp({...newProp, title: e.target.value})} />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-600 font-black uppercase ml-1">Market Price (₦)</label>
                  <input placeholder="60,000,000" type="number" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:border-neonBlue" value={newProp.price_naira} onChange={e => setNewProp({...newProp, price_naira: e.target.value})} />
               </div>

               <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-600 font-black uppercase ml-1">Thumbnail Link</label>
                  <div className="flex items-center bg-black border border-white/10 rounded-2xl px-4 focus-within:border-neonBlue transition-all">
                     <ImageIcon size={16} className="text-gray-700" />
                     <input placeholder="HTTPS://POSTIMG.CC/IMAGE.JPG" className="w-full bg-transparent p-4 text-xs text-white outline-none" value={newProp.thumbnail_url} onChange={e => setNewProp({...newProp, thumbnail_url: e.target.value})} />
                  </div>
               </div>
            </div>

            <button onClick={addProperty} className="w-full bg-neonBlue text-black font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.4em] shadow-lg shadow-neonBlue/20 active:scale-95 transition-all">Execute Deployment</button>
          </div>
        </div>
      )}

      {/* TACTICAL NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-white/10 bg-black/80 backdrop-blur-xl p-6 z-50">
        <Home className="text-neonBlue" size={20} />
        <Users className="text-gray-700" size={20} />
        <div className="relative -top-10 h-16 w-16 bg-neonBlue rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,243,255,0.5)] active:scale-90 transition-transform" onClick={() => setShowAddModal(true)}>
            <Plus className="text-black" size={32} strokeWidth={3} />
        </div>
        <BarChart3 className="text-gray-700" size={20} />
      </nav>
    </div>
  );
}
