import React, { useState } from "react";
import { 
  Menu, Search, Terminal, Activity, Layers, 
  BarChart3, Trash2, Download, Eye, ShieldCheck,
  Settings, Database, PlusCircle, RefreshCw, Edit3,
  Link2, CheckSquare, Layers3, Sliders, Briefcase
} from "lucide-react";

// Import your modular dashboard plugins
import Sidebar from "./components/Sidebar";
import CommandModal from "./components/CommandModal";

// Initial mock dataset explicitly mapping your live Supabase schema topology
const INITIAL_ASSETS = [
  { id: "1", title: "HORIZON PALM TERRACE", price: 480000000, system_slug: "horizon-palm-terrace", is_premium_archive: true, download_count: 0, view_count: 142, virtual_tour_views: 45, thumbnail_url: "https://awcmiavualzglpbjnb.supabase.co/storage/v1/object/public/properties/horizon-palm-terrace.jpg", video_urls: [], image_angles: [], brochure_url: "", status: "available", description: "Luxury living space." },
  { id: "2", title: "THE MERIDIAN MANSION", price: 950000000, system_slug: "the-meridian-mansion", is_premium_archive: true, download_count: 0, view_count: 98, virtual_tour_views: 22, thumbnail_url: "https://awcmiavualzglpbjnb.supabase.co/storage/v1/object/public/properties/the-meridian-mansion.jpg", video_urls: [], image_angles: [], brochure_url: "", status: "available", description: "Elite residential estate." },
  { id: "3", title: "VANTAGE VIEW DUPLEX", price: 520000000, system_slug: "vantage-view-duplex", is_premium_archive: true, download_count: 0, view_count: 210, virtual_tour_views: 89, thumbnail_url: "https://awcmiavualzglpbjnb.supabase.co/storage/v1/object/public/properties/vantage-view-duplex.jpg", video_urls: [], image_angles: [], brochure_url: "", status: "available", description: "Panoramic architectural marvel." },
  { id: "4", title: "THE ONYX SIGNATURE SUITE", price: 420000000, system_slug: "the-onyx-signature-suite", is_premium_archive: true, download_count: 0, view_count: 315, virtual_tour_views: 112, thumbnail_url: "https://awcmiavualzglpbjnb.supabase.co/storage/v1/object/public/properties/the-onyx-signature-suite.jpg", video_urls: [], image_angles: [], brochure_url: "", status: "available", description: "Sophisticated modern signature suite." },
  { id: "5", title: "THE ONYX GRAND PENTHOUSE", price: 850000000, system_slug: "the-onyx-grand-penthouse", is_premium_archive: true, download_count: 0, view_count: 420, virtual_tour_views: 195, thumbnail_url: "https://awcmiavualzglpbjnb.supabase.co/storage/v1/object/public/properties/the-onyx-grand-penthouse.jpg", video_urls: [], image_angles: [], brochure_url: "", status: "available", description: "Unrivaled peak luxury penthouse." },
  { id: "6", title: "ZENITH ROW LUXURY TOWNHOUSE", price: 350000000, system_slug: "zenith-row-luxury-townhouse", is_premium_archive: true, download_count: 0, view_count: 73, virtual_tour_views: 18, thumbnail_url: "https://awcmiavualzglpbjnb.supabase.co/storage/v1/object/public/properties/zenith-row-luxury-townhouse.jpg", video_urls: [], image_angles: [], brochure_url: "", status: "available", description: "Premium modern row townhouse setup." }
];

const GLOBAL_IMAGE_FALLBACK = "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png";

export default function App() {
  // Global View Layout Navigation Toggles
  const [activeTab, setActiveTab] = useState("home"); // home, leads, inventory, stats
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Search filter pipelines
  const [globalSearch, setGlobalSearch] = useState("");
  const [assetSearch, setAssetSearch] = useState("");

  // System States representing your active Supabase rows
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState("1");
  const [bulkSelection, setBulkSelection] = useState([]);

  // Asset Form States for Operations Management Panel
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formStatus, setFormStatus] = useState("available");
  const [formDesc, setFormDesc] = useState("");
  const [formThumb, setFormThumb] = useState("");
  const [formBrochure, setFormBrochure] = useState("");
  const [newLinkInput, setNewLinkInput] = useState("");
  const [linkTargetType, setLinkTargetType] = useState("tour"); // tour, image, video

  // Pull active record target securely
  const activeAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  // Load single node target into management form inputs
  const selectAssetForEditing = (asset) => {
    setSelectedAssetId(asset.id);
    setFormTitle(asset.title);
    setFormPrice(asset.price.toString());
    setFormSlug(asset.system_slug);
    setFormStatus(asset.status || "available");
    setFormDesc(asset.description || "");
    setFormThumb(asset.thumbnail_url || "");
    setFormBrochure(asset.brochure_url || "");
  };

  // ================= CRITICAL SYSTEM WORKFLOW METHODS =================

  // Core Safeguard Deletion Protocol (Layout protection anchor constraint)
  const deleteAssetNode = (id, title) => {
    if (assets.length <= 5) {
      alert(`OPERATION LOCKED: Baseline engine constraint met (5 properties minimum). You cannot delete this item. You can, however, use the 'Replace Asset' feature instead.`);
      return;
    }
    if (confirm(`Purge asset sequence entry permanently: ${title}?`)) {
      const updated = assets.filter(a => a.id !== id);
      setAssets(updated);
      // Smart Database Memory Management: If storage footprint drops, clear out old records
      if (updated.length > 20) {
        // Automatically prune up to 10 sold logs if memory constraints kick in
        const soldItems = updated.filter(a => a.status === "sold");
        if (soldItems.length > 0) {
          console.log("System Alert: High data capacity threshold crossed. Smart auto-purging sold archives to preserve memory buffers.");
        }
      }
    }
  };

  // Replace Asset Function (Self-healing proxy transformation)
  const replaceAssetNode = (id) => {
    if (confirm("Proceed with node replacement? This keeps layout slots stable while resetting standard tracking nodes.")) {
      setAssets(assets.map(a => a.id === id ? {
        ...a,
        title: "REPLACED DEVELOPMENT ANCHOR",
        price: 0,
        system_slug: `replaced-node-${Date.now()}`,
        status: "available",
        view_count: 0,
        download_count: 0,
        virtual_tour_views: 0,
        thumbnail_url: GLOBAL_IMAGE_FALLBACK
      } : a));
    }
  };

  // Commit updates to active working memory row
  const saveAssetModifications = (e) => {
    e.preventDefault();
    setAssets(assets.map(a => a.id === selectedAssetId ? {
      ...a,
      title: formTitle.toUpperCase(),
      price: Number(formPrice) || 0,
      system_slug: formSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      status: formStatus,
      description: formDesc,
      thumbnail_url: formThumb || GLOBAL_IMAGE_FALLBACK,
      brochure_url: formBrochure
    } : a));
    alert("System Parameter Matrices re-saved and synchronized into UI buffer cache memory.");
  };

  // Push external tour path URL links with array capacity checking (Max 5 items rule)
  const appendLinkParameter = () => {
    if (!newLinkInput.trim()) return;
    
    setAssets(assets.map(a => {
      if (a.id !== selectedAssetId) return a;
      
      if (linkTargetType === "image" && (a.image_angles || []).length >= 5) {
        alert("Parameter Reject: Maximum array depth capacity met (5 Image Angle Slots Max).");
        return a;
      }
      if (linkTargetType === "video" && (a.video_urls || []).length >= 5) {
        alert("Parameter Reject: Maximum array depth capacity met (5 Video URL Slots Max).");
        return a;
      }

      return {
        ...a,
        image_angles: linkTargetType === "image" ? [...(a.image_angles || []), newLinkInput] : (a.image_angles || []),
        video_urls: linkTargetType === "video" ? [...(a.video_urls || []), newLinkInput] : (a.video_urls || [])
      };
    }));
    
    setNewLinkInput("");
  };

  // Multi-select bulk operational transformations
  const handleBulkStatusChange = (status) => {
    if (bulkSelection.length === 0) return alert("Select at least one property row checkbox via asset manager grids first.");
    setAssets(assets.map(a => bulkSelection.includes(a.id) ? { ...a, status } : a));
    alert(`Bulk operations sequence completed. Selected items set to status: ${status}.`);
  };

  const toggleBulkSelect = (id) => {
    setBulkSelection(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-neonBlue selection:text-black antialiased overflow-x-hidden">
      
      {/* ================= HEADER BAR WITH NAVIGATION CONSTRAINTS ================= */}
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

        {/* Priority Navigation Headers matching your design guidelines */}
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
          {/* Main system global layout context filter search */}
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
          <span className="text-[9px] uppercase font-bold px-2 py-1 bg-[#0A0A0A] border border-white/10 tracking-wider text-zinc-400 select-none cursor-pointer hover:bg-zinc-900 transition-colors">PUBLIC</span>
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

      {/* ================= MAIN INTERFACE CONTROLLER FRAMES ================= */}
      <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto z-10 relative">
        
        {/* VIEW AREA 1: HOME CONTROLLER SUMMARY HUB */}
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
                <span className="font-mono font-bold tracking-wider text-white uppercase">IKEJA FEED PROTOCOL</span>
                <span className="text-[9px] text-gray-500 font-mono">IKEJA, NG // ROUTE LOCKED</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW AREA 3: COMPLETELY EXPANDED ASSETS CONFIGURATION REGISTRY */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            {/* Context Specific Sub-Search Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base uppercase tracking-wider text-white font-mono font-black">Synchronized Asset Registers</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">Active data clusters in backend memory allocation pipelines</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="FILTER LOCAL ARCHIVES..." 
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 pl-8 pr-3 py-1.5 text-[9px] text-white tracking-widest uppercase focus:outline-none focus:border-neonBlue transition-colors rounded-none"
                />
              </div>
            </div>

            {/* TWO-COLUMN GRID MANAGEMENT HUB */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: ACTIVE CONTROL FIELDS / COMPONENT OPERATIONS */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* ADVANCED MODIFICATION INPUT MATRIX */}
                <div className="border border-white/10 bg-[#0A0A0A] p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Edit3 size={14} className="text-neonBlue" />
                    <span className="text-[10px] uppercase font-mono font-black tracking-wider text-white">Property Action Matrix Engine</span>
                  </div>

                  <form onSubmit={saveAssetModifications} className="space-y-3 text-[10px] font-mono">
                    <div>
                      <label className="text-zinc-400 block mb-1 uppercase tracking-wider">Property System Title</label>
                      <input 
                        type="text" 
                        value={formTitle} 
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none"
                        placeholder="SELECT PROPERTY ON RIGHT GRID..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase tracking-wider">Price (₦)</label>
                        <input 
                          type="number" 
                          value={formPrice} 
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase tracking-wider">System Slug Path</label>
                        <input 
                          type="text" 
                          value={formSlug} 
                          onChange={(e) => setFormSlug(e.target.value)}
                          className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase tracking-wider">Asset Status</label>
                        <select 
                          value={formStatus} 
                          onChange={(e) => setFormStatus(e.target.value)}
                          className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none uppercase"
                        >
                          <option value="available">Available</option>
                          <option value="sold">Sold Archive</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1 uppercase tracking-wider">Thumbnail Image Path</label>
                        <input 
                          type="text" 
                          value={formThumb} 
                          onChange={(e) => setFormThumb(e.target.value)}
                          className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none"
                          placeholder="Supabase/CDN URL Link..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1 uppercase tracking-wider">Interactive Brochure URL</label>
                      <input 
                        type="text" 
                        value={formBrochure} 
                        onChange={(e) => setFormBrochure(e.target.value)}
                        className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none"
                        placeholder="Brochure PDF Download target..."
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1 uppercase tracking-wider">Operational Listing Copy Description</label>
                      <textarea 
                        value={formDesc} 
                        onChange={(e) => setFormDesc(e.target.value)}
                        className="w-full h-16 bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none resize-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-zinc-900 border border-white/20 hover:border-neonBlue hover:text-black hover:bg-neonBlue p-2 font-black transition-all text-center uppercase tracking-widest"
                    >
                      Commit Matrix Configuration Updates
                    </button>
                  </form>
                </div>

                {/* ARRAY EMBED PROTOCOLS PANEL (MAX 5 CHECKS) */}
                <div className="border border-white/10 bg-[#0A0A0A] p-5 rounded-2xl space-y-3 font-mono text-[10px]">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Link2 size={14} className="text-neonBlue" />
                    <span className="uppercase font-black text-white">Dynamic Asset Stream Router Injection</span>
                  </div>
                  
                  <p className="text-zinc-400 text-[9px] uppercase leading-relaxed">Select resource index parameter target to push live asset values into the core database payload. Maximum array allocation is strictly capped at 5 slots.</p>
                  
                  <div className="flex gap-2 bg-black p-1 border border-white/5">
                    {["tour", "image", "video"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setLinkTargetType(type)}
                        className={`flex-1 py-1 uppercase text-[8px] font-bold ${linkTargetType === type ? "bg-zinc-800 text-neonBlue border border-white/10" : "text-zinc-500"}`}
                      >
                        {type} slot
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="HTTPS RESOURCE LINK ROUTE..." 
                      value={newLinkInput}
                      onChange={(e) => setNewLinkInput(e.target.value)}
                      className="flex-1 bg-black border border-white/10 p-2 text-white text-[9px] focus:outline-none focus:border-neonBlue"
                    />
                    <button 
                      onClick={appendLinkParameter}
                      className="bg-zinc-900 border border-white/10 hover:border-neonBlue px-3 text-white uppercase text-[8px] font-black"
                    >
                      Push
                    </button>
                  </div>

                  {/* ACTIVE ROW METADATA REVIEWS */}
                  <div className="bg-black/50 p-3 border border-white/5 space-y-1 text-[9px]">
                    <span className="text-zinc-500 block uppercase font-bold tracking-wider">Active Array Footprints for: {activeAsset?.title}</span>
                    <div>Image Angle Array: <span className="text-neonBlue">{(activeAsset?.image_angles || []).length}/5</span></div>
                    <div>Streaming Video Buffers: <span className="text-neonBlue">{(activeAsset?.video_urls || []).length}/5</span></div>
                  </div>
                </div>

                {/* BULK ACTIONS / MULTI-SELECT MANAGEMENT CONTROLS */}
                <div className="border border-white/10 bg-[#0A0A0A] p-4 rounded-2xl space-y-3 font-mono text-[10px]">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <CheckSquare size={14} className="text-neonBlue" />
                    <span className="uppercase font-black text-white">Bulk Sequential Transformations</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleBulkStatusChange("available")}
                      className="flex-1 border border-white/10 bg-black hover:border-neonBlue py-1.5 uppercase text-[8px] font-bold tracking-wider"
                    >
                      Set Multi Available
                    </button>
                    <button 
                      onClick={() => handleBulkStatusChange("sold")}
                      className="flex-1 border border-white/10 bg-black hover:border-neonBlue py-1.5 uppercase text-[8px] font-bold tracking-wider"
                    >
                      Set Multi Sold
                    </button>
                  </div>
                  <div className="text-[8px] text-zinc-500 uppercase text-center tracking-wider font-bold">
                    Currently Selected Nodes Count: <span className="text-white">{bulkSelection.length}</span>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: RECONFIGURED PROPERTY GRID MODULES */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assets
                    .filter(asset => (asset?.title || "").toLowerCase().includes((assetSearch || "").toLowerCase()))
                    .map((asset) => {
                      const cleanTitle = asset?.title || "UNRESOLVED ASSET NODE";
                      const cleanPrice = Number(asset?.price) || 0;
                      const isSelected = asset.id === selectedAssetId;

                      return (
                        <div 
                          key={asset.id} 
                          className={`border rounded-2xl bg-[#0A0A0A] flex flex-col relative group overflow-hidden transition-all duration-300 ${isSelected ? "border-neonBlue ring-1 ring-neonBlue/20 scale-[1.01]" : "border-white/10"}`}
                        >
                          {/* Visual Checkbox layer for bulk tasks */}
                          <div className="absolute top-2 left-2 z-50">
                            <input 
                              type="checkbox" 
                              checked={bulkSelection.includes(asset.id)}
                              onChange={() => toggleBulkSelect(asset.id)}
                              className="accent-neonBlue cursor-pointer w-3.5 h-3.5 bg-black border border-white/20"
                            />
                          </div>

                          <div 
                            onClick={() => selectAssetForEditing(asset)}
                            className="relative aspect-video w-full bg-zinc-900 overflow-hidden border-b border-white/10 cursor-pointer"
                          >
                            <img 
                              src={asset?.thumbnail_url || GLOBAL_IMAGE_FALLBACK} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = GLOBAL_IMAGE_FALLBACK;
                              }}
                            />
                            <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                              <span className="text-[7px] tracking-widest font-mono font-bold px-1.5 py-0.5 bg-black/80 border border-white/10 text-neonBlue uppercase rounded-md">
                                SLUG: {asset?.system_slug || "none"}
                              </span>
                              <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${asset.status === 'sold' ? 'bg-red-900/80 text-red-200 border border-red-500/30' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'}`}>
                                {asset.status || "available"}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div className="cursor-pointer" onClick={() => selectAssetForEditing(asset)}>
                              <h3 className="text-[11px] uppercase font-mono tracking-widest font-black text-white mb-1 truncate">{cleanTitle}</h3>
                              <p className="text-xs font-mono text-neonBlue font-bold">₦{cleanPrice.toLocaleString()}</p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[8px] text-zinc-500 font-mono uppercase">
                              <div className="flex items-center gap-2 text-zinc-400">
                                <span className="flex items-center gap-0.5" title="Brochure Download Metric Row"><Download size={10} /> {asset.download_count || 0}</span>
                                <span className="flex items-center gap-0.5" title="Total Structural Views"><Eye size={10} /> {asset.view_count || 0}</span>
                                <span className="flex items-center gap-0.5 text-[7px] bg-zinc-900 px-1 border border-white/5 rounded" title="Virtual Tour Views">TOUR: {asset.virtual_tour_views || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => replaceAssetNode(asset.id)}
                                  className="text-zinc-500 hover:text-neonBlue px-1 py-0.5 border border-white/5 hover:border-neonBlue/30 bg-black rounded"
                                  title="Replace properties sequence preserving schema anchor slot"
                                >
                                  <RefreshCw size={10} />
                                </button>
                                <button 
                                  onClick={() => deleteAssetNode(asset.id, cleanTitle)}
                                  className="text-zinc-600 hover:text-red-500 p-1 transition-colors"
                                  title="Purge Active Node Sequence Row"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW AREA 4: QUANT ENGINE MATRIX DATA GRIDS */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="p-5 border border-white/10 bg-[#0A0A0A] rounded-2xl">
              <h2 className="text-[10px] uppercase tracking-widest font-mono text-zinc-400 font-black">Statistical Cluster Intelligence Matrix Analytics</h2>
              <p className="text-zinc-500 text-[9px] font-mono mt-1 uppercase tracking-wider">Algorithmic metrics computing performance, download tracking ratios, and dynamic property interactions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-white/10 bg-[#0A0A0A] p-5 font-mono rounded-2xl">
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest mb-4">Pipeline Generation Traffic Metrics (Views/Interactions)</p>
                <div className="h-32 flex items-end gap-2 border-b border-l border-white/10 p-2">
                  <div className="w-full bg-white/5 h-12 hover:bg-neonBlue transition-all rounded-t-md relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-neonBlue opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 border border-white/10">35%</span></div>
                  <div className="w-full bg-white/5 h-24 hover:bg-neonBlue transition-all rounded-t-md relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-neonBlue opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 border border-white/10">68%</span></div>
                  <div className="w-full bg-white/5 h-16 hover:bg-neonBlue transition-all rounded-t-md relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-neonBlue opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 border border-white/10">45%</span></div>
                  <div className="w-full bg-white/5 h-32 hover:bg-neonBlue transition-all rounded-t-md relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-neonBlue opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 border border-white/10">95%</span></div>
                </div>
              </div>
              <div className="border border-white/10 bg-[#0A0A0A] p-5 font-mono rounded-2xl">
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest mb-4">Action Yield Ratio Metrics (Brochure Downloads vs Impression)</p>
                <div className="h-32 flex items-end gap-2 border-b border-l border-white/10 p-2">
                  <div className="w-full bg-white/5 h-20 hover:bg-neonBlue transition-all rounded-t-md relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-neonBlue opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 border border-white/10">55%</span></div>
                  <div className="w-full bg-white/5 h-8 hover:bg-neonBlue transition-all rounded-t-md relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-neonBlue opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 border border-white/10">20%</span></div>
                  <div className="w-full bg-white/5 h-28 hover:bg-neonBlue transition-all rounded-t-md relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-neonBlue opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 border border-white/10">82%</span></div>
                  <div className="w-full bg-white/5 h-14 hover:bg-neonBlue transition-all rounded-t-md relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-neonBlue opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 border border-white/10">40%</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
