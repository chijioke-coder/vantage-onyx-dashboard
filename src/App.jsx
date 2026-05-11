import React, { useState, useEffect } from 'react';
import { Home, Users, Package, BarChart3, Shield, ShieldOff, Zap, Search, MessageCircle } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [stealth, setStealth] = useState(false);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [whalesActive, setWhalesActive] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: L } = await supabase.from('zenith_leads').select('*').order('created_at', { ascending: false });
      const { data: P } = await supabase.from('properties_db').select('*');
      setLeads(L || []);
      setProperties(P || []);
      
      const whales = L?.filter(l => l.device_type?.includes('iPhone') && l.dwell_time > 180).length;
      setWhalesActive(whales || 0);
    };
    fetchData();

    // Real-time listener
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-black pb-24 text-white font-sans selection:bg-neonBlue/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black p-4">
        <div className="flex items-center gap-2">
          <img src="https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png" className="h-8 w-8" alt="logo" />
          <h1 className="text-xl font-black tracking-tighter text-neonBlue">VANTAGE ONYX</h1>
        </div>
        <button onClick={() => setStealth(!stealth)} className="rounded-lg border border-neonBlue/30 p-2 active:bg-neonBlue/10">
          {stealth ? <ShieldOff className="text-neonAmber" /> : <Shield className="text-neonBlue" />}
        </button>
      </header>

      <main className="space-y-6 p-4">
        {/* HERO STATS */}
        <div className="grid grid-cols-1">
          <div className="rounded-xl border border-neonBlue bg-onyx p-6">
            <p className="text-[10px] tracking-widest text-gray-500 uppercase font-bold">Whales Active</p>
            <h2 className="text-4xl font-black text-white">{whalesActive}</h2>
          </div>
        </div>

        {/* PROPERTY HEATMAP */}
        <section>
          <h3 className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase">Property Interest Heatmap</h3>
          <div className="grid grid-cols-2 gap-2">
            {properties.map(p => (
              <div key={p.id} className={`rounded-lg border bg-onyx p-3 ${
                p.view_count > 500 ? 'border-red-600 bg-red-950/20' : 'border-white/10'
              }`}>
                <p className="truncate text-[10px] font-bold uppercase">{p.name}</p>
                <p className="font-mono text-xs text-neonBlue">₦{p.price?.toLocaleString()}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-[8px] text-gray-600 font-bold uppercase">Views: {p.view_count}</span>
                  <a href={`https://wa.me/234XXXXXXXXXX?text=Hello, I'm interested in ${p.name}`} className="text-green-500">
                    <MessageCircle size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INTELLIGENCE FEED */}
        <section>
          <h3 className="mb-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase">Intelligence Feed</h3>
          <div className="space-y-2">
            {leads.map(l => {
              const isWhale = l.device_type?.includes('iPhone') && l.dwell_time > 180;
              return (
                <div key={l.id} className={`rounded-lg border p-4 ${isWhale ? 'border-neonAmber bg-amber-950/10' : 'border-white/5 bg-onyx'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold uppercase tracking-tight ${stealth ? 'bg-white/10 text-transparent select-none' : ''}`}>
                      {l.full_name}
                    </span>
                    {isWhale && <span className="flex items-center gap-1 rounded bg-neonAmber/20 px-2 py-0.5 text-[8px] font-black text-neonAmber"><Zap size={10} /> WHALE</span>}
                  </div>
                  <p className="mt-1 text-[9px] tracking-tighter text-gray-500 uppercase font-medium">
                    {l.device_type} • {l.location} • {l.dwell_time}s DWELL
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* NAVIGATION DOCK */}
      <nav className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t border-white/10 bg-black p-4 z-50">
        <Home className="text-neonBlue" />
        <Users className="text-gray-600" />
        <Package className="text-gray-600" />
        <BarChart3 className="text-gray-600" />
      </nav>

      {/* COMMAND BAR */}
      <div className="fixed bottom-20 left-4 right-4 flex items-center gap-2 rounded-full border border-neonBlue/30 bg-black p-3">
        <Search size={16} className="text-neonBlue" />
        <input type="text" placeholder="COMMAND-K SEARCH..." className="bg-transparent text-[10px] outline-none w-full text-white placeholder:text-gray-700" />
      </div>
    </div>
  );
}
