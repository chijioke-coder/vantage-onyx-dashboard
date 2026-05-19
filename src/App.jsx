import React, { useState } from "react";
import { 
  Menu, Search, Terminal, Activity, Layers, 
  BarChart3, Trash2, Download, Eye, ShieldCheck 
} from "lucide-react";

// Import your newly created modular components
import Sidebar from "./components/Sidebar";
import CommandModal from "./components/CommandModal";

// Database-backed initial asset values matching your Supabase properties_db structure
const INITIAL_ASSETS = [
  { id: "1", title: "HORIZON PALM TERRACE", price: 480000000, system_slug: "horizon-palm-trace", is_premium_archive: true, download_count: 0, view_count: 142, thumbnail_url: "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png" },
  { id: "2", title: "THE MERIDIAN MANSION", price: 950000000, system_slug: "the-meridian-mansion", is_premium_archive: true, download_count: 0, view_count: 98, thumbnail_url: "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png" },
  { id: "3", title: "VANTAGE VIEW DUPLEX", price: 520000000, system_slug: "vantage-view-duplex", is_premium_archive: true, download_count: 0, view_count: 210, thumbnail_url: "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png" },
  { id: "4", title: "THE ONYX SIGNATURE SUITE", price: 420000000, system_slug: "the-onyx-signature-suite", is_premium_archive: true, download_count: 0, view_count: 315, thumbnail_url: "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png" },
  { id: "5", title: "THE ONYX GRAND PENTHOUSE", price: 850000000, system_slug: "the-onyx-grand-penthouse", is_premium_archive: true, download_count: 0, view_count: 420, thumbnail_url: "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png" },
  { id: "6", title: "ZENITH ROW LUXURY TOWNHOUSE", price: 350000000, system_slug: "zenith-row-luxury-townhouse", is_premium_archive: true, download_count: 0, view_count: 73, thumbnail_url: "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png" }
];

// Fallback high-fidelity image asset block
const GLOBAL_IMAGE_FALLBACK = "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png";

export default function App() {
  // Global Interface Controls Linked directly to your component states
  const [activeTab, setActiveTab] = useState("home"); // home, leads, inventory, stats
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Content Filtering and Management Arrays
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [globalSearch, setGlobalSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");

  // Safeguard validation protocol ensuring data anchor parameters stay at 5+
  const deleteAssetNode = (id, title) => {
    // Self-healing database anchor check
    const currentAssetCount = Array.isArray(assets) ? assets.length : 0;
    if (currentAssetCount <= 5) {
      alert(`Operation Blocked: Minimum baseline anchor threshold met (5 properties). Delete actions are suppressed to protect structural dashboard rendering layouts.`);
      return;
    }
    if (confirm(`Confirm permanent erasure of asset sequence matrix row: ${title}?`)) {
      setAssets(assets.filter(asset => asset.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-neonBlue selection:text-black antialiased overflow-x-hidden">
      
      {/* ================= GLOBAL FIXED BRAND BAR ================= */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/80 backdrop-blur-md z-[200] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-zinc-400 hover:text-neonBlue transition-colors focus:outline-none"
          >
            <Menu size={20} />
          </button>
          <div onClick={() => setActiveTab("home")} className="flex items-center gap-2 cursor-pointer group">
            <span className="text-neonBlue font-black text-xl tracking-tighter italic group-hover:scale-105 transition-transform">⚡ VANTAGE<span className="text-white not-italic font-light">ONYX</span></span>
          </div>
        </div>

        {/* Desktop Application Navigation Headers */}
        <nav className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-widest font-black">
          {[
            { id: "home", label: "Home Terminal" },
            { id: "leads", label: "Intel Radar" },
            { id: "inventory", label: "Assets Management" },
            { id: "stats", label: "Quant Engine" }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`transition-all hover:text-neonBlue ${activeTab === tab.id ? "text-neonBlue font-black border-b border-neonBlue pb-1" : "text-gray-400"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Global filter wrapper */}
          <div className="relative hidden sm:block w-48 lg:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="GLOBAL DATA SEARCH..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 pl-8 pr-3 py-1.5 text-[9px] text-white tracking-widest uppercase focus:outline-none focus:border-neonBlue transition-colors rounded-none"
            />
          </div>
          <button 
            onClick={() => setIsCommandOpen(true)}
            className="p-2 border border-white/10 bg-[#0A0A0A] text-zinc-400 hover:text-neonBlue hover:border-neonBlue transition-colors"
            title="Open Console Shell"
          >
            <Terminal size={14} />
          </button>
          <span className="text-[9px] uppercase font-bold px-2 py-1 bg-[#0A0A0A] border border-white/10 tracking-wider text-zinc-400 select-none">PUBLIC</span>
        </div>
      </header>

      {/* ================= MODULAR INTERACTION PLUGINS ================= */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <CommandModal 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)} 
      />

      {/* ================= CORE ACTION FRAME RENDERING ================= */}
      <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto z-10 relative">
        
        {/* VIEW AREA 1: HOME CONTROLLER HUB */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <div className="p-6 border border-white/10 bg-[#0A0A0A] relative overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <p className="text-[9px] font-mono uppercase tracking-widest text-neonBlue mb-1">Vantage Control Room</p>
              <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider max-w-2xl">Ultra Operational Management Executive Summary</h1>
              <p className="text-xs text-gray-400 mt-2 max-w-xl leading-relaxed">System parameters secure. Click modular metrics cards below to quickly access structural database subsets dynamically.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => setActiveTab("leads")} className="p-5 border border-white/10 bg-[#0A0A0A] hover:border-neonBlue/40 cursor-pointer transition-all group rounded-xl">
                <div className="flex items-center justify-between mb-4"><span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">01 // Intel Radar</span><Activity size={16} className="text-gray-600 group-hover:text-neonBlue transition-colors" /></div>
                <div className="text-2xl font-black text-white tracking-tighter">0 WHALES</div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">LOCKED IN RUNTIME TUNNEL</p>
              </div>
              <div onClick={() => setActiveTab("leads")} className="p-5 border border-white/10 bg-[#0A0A0A] hover:border-neonBlue/40 cursor-pointer transition-all group rounded-xl">
                <div className="flex items-center justify-between mb-4"><span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">02 // Live Logs</span><ShieldCheck size={16} className="text-gray-600 group-hover:text-neonBlue transition-colors" /></div>
                <div className="text-2xl font-black text-white tracking-tighter">SECURE</div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">REALTIME AUDIT ROUTER FEED</p>
              </div>
              <div onClick={() => setActiveTab("inventory")} className="p-5 border border-white/10 bg-[#0A0A0A] hover:border-neonBlue/40 cursor-pointer transition-all group rounded-xl">
                <div className="flex items-center justify-between mb-4"><span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">03 // Asset Nodes</span><Layers size={16} className="text-gray-600 group-hover:text-neonBlue transition-colors" /></div>
                <div className="text-2xl font-black text-white tracking-tighter">{(Array.isArray(assets) ? assets.length : 0)} PROPERTIES</div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">SYNCED IN SYSTEM REGISTRY</p>
              </div>
              <div onClick={() => setActiveTab("stats")} className="p-5 border border-white/10 bg-[#0A0A0A] hover:border-neonBlue/40 cursor-pointer transition-all group rounded-xl">
                <div className="flex items-center justify-between mb-4"><span className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">04 // Quant Yield</span><BarChart3 size={16} className="text-gray-600 group-hover:text-neonBlue transition-colors" /></div>
                <div className="text-2xl font-black text-white tracking-tighter">99.8%</div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">ACCURACY PERFORMANCE RATIO</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW AREA 2: INTEL RADAR & TELEMETRY LEDGER */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            <div className="border border-white/10 bg-[#0A0A0A] p-6 rounded-2xl">
              <span className="text-[10px] text-neonBlue font-mono uppercase tracking-widest">INTELLIGENCE DATASTREAM</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-white">0</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">TARGET IDENTIFIERS ACTIVE</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="p-4 border border-white/10 bg-[#0A0A0A] flex justify-between items-center text-xs rounded-xl">
                <span className="font-mono font-bold tracking-wider text-white uppercase">ANONYMOUS SOURCE OVERRIDE</span>
                <span className="text-[9px] text-gray-500 font-mono">LAGOS, NG // ROUTE LOCKED</span>
              </div>
              <div className="p-4 border border-white/10 bg-[#0A0A0A] flex justify-between items-center text-xs rounded-xl">
                <span className="font-mono font-bold tracking-wider text-white uppercase">ANONYMOUS SOURCE OVERRIDE</span>
                <span className="text-[9px] text-gray-500 font-mono">IKEJA, NG // ROUTE LOCKED</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW AREA 3: PORTFOLIO PROPERTIES GRID */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base uppercase tracking-wider text-white font-mono font-black">Synchronized Asset Registers</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Active data clusters in backend memory allocation pipelines</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="FILTER ARCHIVES..." 
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 pl-8 pr-3 py-1.5 text-[9px] text-white tracking-widest uppercase focus:outline-none focus:border-neonBlue transition-colors rounded-none"
                />
              </div>
            </div>

            {/* Asset Storage Cards Core Mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Array.isArray(assets) ? assets : [])
                .filter(asset => (asset?.title || "").toLowerCase().includes((assetSearch || "").toLowerCase()))
                .map((asset) => {
                  // Self-healing database parameters mapping logic
                  const cleanTitle = asset?.title || "UNRESOLVED ASSET NODE";
                  const cleanPrice = Number(asset?.price) || 0;
                  const cleanDownloadCount = Number(asset?.download_count) || 0;
                  const cleanViewCount = Number(asset?.view_count) || 0;
                  
                  // Self-healing dynamic slug formatter fallback 
                  const cleanSlug = asset?.system_slug || cleanTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "");

                  return (
                    <div key={asset?.id || Math.random().toString()} className="border border-white/10 bg-[#0A0A0A] flex flex-col relative group overflow-hidden rounded-2xl">
                      <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden border-b border-white/10">
                        <img 
                          src={asset?.thumbnail_url || GLOBAL_IMAGE_FALLBACK} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = GLOBAL_IMAGE_FALLBACK;
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <span className="text-[8px] tracking-widest font-bold px-2 py-0.5 bg-black/80 border border-white/10 text-neonBlue uppercase rounded-md font-mono">
                            SLUG: {cleanSlug}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-[11px] uppercase font-mono tracking-widest font-black text-white mb-1 truncate">{cleanTitle}</h3>
                          <p className="text-xs font-mono text-neonBlue font-bold">₦{cleanPrice.toLocaleString()}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500 font-mono">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Download size={11} /> {cleanDownloadCount}</span>
                            <span className="flex items-center gap-1"><Eye size={11} /> {cleanViewCount}</span>
                          </div>
                          <button 
                            onClick={() => deleteAssetNode(asset.id, cleanTitle)}
                            className="text-gray-600 hover:text-red-500 p-1 transition-colors"
                            title="Purge Active Asset Node Row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* VIEW AREA 4: QUANT ENGINE MATRIX */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h2 className="text-[10px] uppercase tracking-widest font-mono text-gray-600 font-bold">Statistical Cluster Intelligence Matrix Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-white/10 bg-[#0A0A0A] p-5 font-mono rounded-2xl">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-4">Pipeline Generation Traffic Metrics</p>
                <div className="h-32 flex items-end gap-2 border-b border-l border-white/10 p-2">
                  <div className="w-full bg-white/5 h-12 hover:bg-neonBlue transition-all rounded-t-md" />
                  <div className="w-full bg-white/5 h-24 hover:bg-neonBlue transition-all rounded-t-md" />
                  <div className="w-full bg-white/5 h-16 hover:bg-neonBlue transition-all rounded-t-md" />
                  <div className="w-full bg-white/5 h-32 hover:bg-neonBlue transition-all rounded-t-md" />
                </div>
              </div>
              <div className="border border-white/10 bg-[#0A0A0A] p-5 font-mono rounded-2xl">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-4">Action Yield Ratio Metrics</p>
                <div className="h-32 flex items-end gap-2 border-b border-l border-white/10 p-2">
                  <div className="w-full bg-white/5 h-20 hover:bg-neonBlue transition-all rounded-t-md" />
                  <div className="w-full bg-white/5 h-8 hover:bg-neonBlue transition-all rounded-t-md" />
                  <div className="w-full bg-white/5 h-28 hover:bg-neonBlue transition-all rounded-t-md" />
                  <div className="w-full bg-white/5 h-14 hover:bg-neonBlue transition-all rounded-t-md" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
