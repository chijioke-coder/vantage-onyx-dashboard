import React, { useState, useEffect } from "react";
import { 
  Menu, Search, Terminal, Activity, Layers, 
  Trash2, Download, Eye, RefreshCw, Edit3, 
  Link2, CheckSquare, Database, X, ShieldAlert, Users, TrendingUp
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import CommandModal from "./components/CommandModal";

// Corrected import path targeting your src/lib architecture
import { 
  initDynamicSupabase, 
  saveDatabaseConfig, 
  getDatabaseConfig, 
  disconnectDatabase 
} from "./lib/supabase";

const FALLBACK_MEDIA_URL = "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Connection Parameters State
  const [dbUrl, setDbUrl] = useState("");
  const [dbKey, setDbKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Live Telemetry Datasets
  const [assets, setAssets] = useState([]);
  const [downloadLogs, setDownloadLogs] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [realtors, setRealtors] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [bulkSelection, setBulkSelection] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search Context Filters
  const [assetSearch, setAssetSearch] = useState("");

  // Input Data Buffers (Aligned directly with your updated global price context)
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formStatus, setFormStatus] = useState("Available");
  const [formLocation, setFormLocation] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formThumb, setFormThumb] = useState("");
  const [formBrochure, setFormBrochure] = useState("");
  
  // Media router explicit target slot states
  const [selectedMediaSlot, setSelectedMediaSlot] = useState(1);
  const [mediaType, setMediaType] = useState("image"); // image, tour, tour_title, video
  const [mediaUrlInput, setMediaUrlInput] = useState("");

  const activeAsset = assets.find(a => a.id === selectedAssetId) || null;

  // Compute Total Counters for Relative Percentage Distributions
  const totalPropertyViews = assets.reduce((acc, curr) => acc + (curr.view_count || 0), 0);
  const totalTourViews = assets.reduce((acc, curr) => acc + (curr.virtual_tour_views || 0), 0);

  // Pull existing authorization credentials from sandboxed storage on mount
  useEffect(() => {
    const { url, key } = getDatabaseConfig();
    if (url && key) {
      setDbUrl(url);
      setDbKey(key);
      setIsConnected(true);
    }
  }, []);

  // Sync whole environment topologies across all linked relational schemas
  const syncDashboardDataPipeline = async () => {
    const client = initDynamicSupabase();
    if (!client) return;
    setLoading(true);
    try {
      // 1. Fetch properties inventory state
      const { data: propData, error: propErr } = await client
        .from("properties_db")
        .select("*")
        .order("title", { ascending: true });
      if (propErr) throw propErr;
      setAssets(propData || []);

      // Auto-populate default form node selection targets
      if (propData && propData.length > 0 && !selectedAssetId) {
        loadAssetIntoFormContext(propData[0]);
      }

      // 2. Fetch CRM Vantage Download Logs
      const { data: logData, error: logErr } = await client
        .from("vantage_download_logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (!logErr) setDownloadLogs(logData || []);

      // 3. Fetch Background Visitors Metrics
      const { data: visitorData, error: visErr } = await client
        .from("visitors_db")
        .select("*")
        .order("created_at", { ascending: false });
      if (!visErr) setVisitors(visitorData || []);

      // 4. Fetch Active Team Force Realtors
      const { data: realtorData, error: realErr } = await client
        .from("realtors_registry")
        .select("*");
      if (!realErr) setRealtors(realtorData || []);

    } catch (err) {
      console.error("Pipeline Synchronisation Fault:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      syncDashboardDataPipeline();
    }
  }, [isConnected]);

  const commitCredentialsConnection = (e) => {
    e.preventDefault();
    if (!dbUrl.trim() || !dbKey.trim()) return;
    saveDatabaseConfig(dbUrl, dbKey);
    setIsConnected(true);
    setShowConfigModal(false);
    setTimeout(() => syncDashboardDataPipeline(), 300);
  };

  const clearCredentialsConnection = () => {
    disconnectDatabase();
    setDbUrl("");
    setDbKey("");
    setIsConnected(false);
    setAssets([]);
    setDownloadLogs([]);
    setVisitors([]);
    setRealtors([]);
    alert("Connection Terminal Disconnected.");
  };

  const loadAssetIntoFormContext = (asset) => {
    setSelectedAssetId(asset.id);
    setFormTitle(asset.title || "");
    setFormPrice((asset.price || 0).toString());
    setFormSlug(asset.system_slug || "");
    setFormStatus(asset.status || "Available");
    setFormLocation(asset.location_tag || "");
    setFormDesc(asset.description || "");
    setFormThumb(asset.thumbnail_url || "");
    setFormBrochure(asset.brochure_url || "");
  };

  // CRUD Mutations points mapped exactly to your parameters
  const saveAssetModifications = async (e) => {
    e.preventDefault();
    const client = initDynamicSupabase();
    if (!client || !selectedAssetId) return;

    const payload = {
      title: formTitle.toUpperCase(),
      price: Number(formPrice) || 0,
      system_slug: formSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      status: formStatus,
      location_tag: formLocation,
      description: formDesc,
      thumbnail_url: formThumb || FALLBACK_MEDIA_URL,
      brochure_url: formBrochure
    };

    try {
      const { error } = await client.from("properties_db").update(payload).eq("id", selectedAssetId);
      if (error) throw error;
      alert("Asset matrix variables successfully synced live.");
      syncDashboardDataPipeline();
    } catch (err) {
      alert(`Write Exception: ${err.message}`);
    }
  };

  // Direct injection routing for explicit media slot selections
  const injectMediaToExplicitSlot = async () => {
    if (!mediaUrlInput.trim() || !activeAsset) return;
    const client = initDynamicSupabase();
    if (!client) return;

    // Resolve column identifier target key dynamically
    let targetKey = "";
    if (mediaType === "image") {
      if (selectedMediaSlot > 4) return alert("Target out of index: Only 4 explicit image angle slots available.");
      targetKey = `img_angle_${selectedMediaSlot}`;
    } else if (mediaType === "tour") {
      targetKey = `tour_url_${selectedMediaSlot}`;
    } else if (mediaType === "tour_title") {
      targetKey = `tour_title_${selectedMediaSlot}`;
    } else if (mediaType === "video") {
      targetKey = `video_url_${selectedMediaSlot}`;
    }

    try {
      const { error } = await client
        .from("properties_db")
        .update({ [targetKey]: mediaUrlInput })
        .eq("id", activeAsset.id);

      if (error) throw error;
      setMediaUrlInput("");
      alert(`Injected asset link straight into [${targetKey.toUpperCase()}]`);
      syncDashboardDataPipeline();
    } catch (err) {
      alert(`Slot Routing Exception: ${err.message}`);
    }
  };

  const handleBulkStatusTransformation = async (newStatus) => {
    if (bulkSelection.length === 0) return alert("Zero bulk checklist selection targets specified.");
    const client = initDynamicSupabase();
    if (!client) return;

    try {
      const { error } = await client.from("properties_db").update({ status: newStatus }).in("id", bulkSelection);
      if (error) throw error;
      alert(`Bulk update complete. Modified ${bulkSelection.length} property items to ${newStatus}.`);
      setBulkSelection([]);
      syncDashboardDataPipeline();
    } catch (err) {
      alert(`Bulk Mutation Fault: ${err.message}`);
    }
  };

  const deleteLeadLogNode = async (id) => {
    if (!confirm("Irreversibly erase this premium lead logging trace sequence?")) return;
    const client = initDynamicSupabase();
    if (!client) return;
    try {
      await client.from("vantage_download_logs").delete().eq("id", id);
      syncDashboardDataPipeline();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans tracking-tight antialiased selection:bg-neonBlue selection:text-black">
      
      {/* ================= GLOBAL FIXED MASTER TOPBAR ================= */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/80 backdrop-blur-md z-[200] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <span onClick={() => setActiveTab("home")} className="text-neonBlue font-black text-xl tracking-tighter italic cursor-pointer">
            ⚡ VANTAGE<span className="text-white not-italic font-light">ONYX</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-widest font-mono font-black">
          {["home", "leads", "inventory"].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`transition-all pb-1 ${activeTab === t ? "text-neonBlue border-b border-neonBlue" : "text-gray-400 hover:text-neonBlue"}`}>
              {t === "home" ? "Terminal Hub" : t === "leads" ? "Intel Radar" : "Assets Manager"}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowConfigModal(true)} 
            className={`flex items-center gap-1.5 px-3 py-1 text-[9px] uppercase font-bold border font-mono transition-all tracking-widest ${isConnected ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/20" : "border-red-500/30 text-red-400 bg-red-950/20"}`}
          >
            <Database size={11} />
            {isConnected ? "CLUSTER ONLINE" : "BIND INTERCEPTOR"}
          </button>
          <button onClick={() => setIsCommandOpen(true)} className="p-2 border border-white/10 bg-[#0A0A0A] text-zinc-400 hover:text-white">
            <Terminal size={14} />
          </button>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CommandModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* ================= OBFUSCATED CREDENTIALS MAPPING MODAL ================= */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="border border-white/10 bg-[#0A0A0A] w-full max-w-md p-6 relative rounded-2xl font-mono">
            <button onClick={() => setShowConfigModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={16} /></button>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Database className="text-neonBlue" size={16} />
              <h2 className="font-black uppercase text-xs text-white tracking-widest">Supabase Node Dynamic Access Router</h2>
            </div>
            <form onSubmit={commitCredentialsConnection} className="space-y-4 text-[10px]">
              <div>
                <label className="text-zinc-400 block mb-1 uppercase tracking-wider">PROJECT CORE INTERFACES URL</label>
                <input type="text" value={dbUrl} onChange={(e) => setDbUrl(e.target.value)} placeholder="https://your-uid.supabase.co" className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" required />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1 uppercase tracking-wider">ANON SECRET COMPONENT TOKEN</label>
                <input type="password" value={dbKey} onChange={(e) => setDbKey(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIsIn..." className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" required />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-neonBlue text-black font-black uppercase py-2 tracking-widest hover:opacity-90">Inject Secure Interceptor</button>
                {isConnected && <button type="button" onClick={clearCredentialsConnection} className="bg-red-950 text-red-400 border border-red-500/30 px-3 uppercase font-bold"> Sever Cloud Link </button>}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MASTER LAYOUT HUB FRAME CONTAINER ================= */}
      <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto relative z-10">
        
        {!isConnected && (
          <div className="border border-red-500/20 bg-red-950/10 p-8 rounded-2xl flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4 my-12 font-mono">
            <ShieldAlert size={32} className="text-red-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase text-white tracking-widest">Active Database Bridge Connection Missing</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed">Vantage Onyx is running in standalone local test architecture. Click the cloud token to bind your Zenith Horizon database deployment instance.</p>
            <button onClick={() => setShowConfigModal(true)} className="border border-red-500/30 text-red-400 bg-red-950/20 px-4 py-1.5 uppercase text-[9px] font-black tracking-widest hover:bg-red-500 hover:text-black transition-all">Instantiate Handshake Node</button>
          </div>
        )}

        {isConnected && (
          <>
            {/* TERMINAL OVERVIEW DASHBOARD TERMINAL */}
            {activeTab === "home" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 border border-white/10 bg-[#0A0A0A] rounded-2xl">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-neonBlue mb-1">Executive Summary Control Terminal</p>
                  <h1 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">Dynamic Luxury Footprint Telemetry Engine</h1>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div onClick={() => setActiveTab("leads")} className="p-5 border border-white/10 bg-[#0A0A0A] hover:border-neonBlue/30 transition-all cursor-pointer rounded-xl font-mono">
                    <div className="flex items-center justify-between mb-3"><span className="text-[9px] uppercase tracking-widest text-zinc-500">INTEL RADAR RECORDS</span><Users size={14} className="text-zinc-600" /></div>
                    <div className="text-xl font-black text-white">{downloadLogs.length} WHALES</div>
                    <p className="text-[8px] text-emerald-400 uppercase tracking-wide mt-1">● Live Capture Streams Hot</p>
                  </div>
                  <div onClick={() => setActiveTab("inventory")} className="p-5 border border-white/10 bg-[#0A0A0A] hover:border-neonBlue/30 transition-all cursor-pointer rounded-xl font-mono">
                    <div className="flex items-center justify-between mb-3"><span className="text-[9px] uppercase tracking-widest text-zinc-500">INVENTORY SEGMENTS</span><Layers size={14} className="text-zinc-600" /></div>
                    <div className="text-xl font-black text-white">{assets.length} REGISTERS</div>
                    <p className="text-[8px] text-zinc-400 uppercase tracking-wide mt-1">Properties Matrix Configured</p>
                  </div>
                  <div className="p-5 border border-white/10 bg-[#0A0A0A] rounded-xl font-mono">
                    <div className="flex items-center justify-between mb-3"><span className="text-[9px] uppercase tracking-widest text-zinc-500">AGGREGATE SYSTEM TRAFFIC</span><Activity size={14} className="text-zinc-600" /></div>
                    <div className="text-xl font-black text-white">{visitors.length} VISITS</div>
                    <p className="text-[8px] text-zinc-400 uppercase tracking-wide mt-1">Background Telemetry Pipeline</p>
                  </div>
                  <div className="p-5 border border-white/10 bg-[#0A0A0A] rounded-xl font-mono">
                    <div className="flex items-center justify-between mb-3"><span className="text-[9px] uppercase tracking-widest text-zinc-500">ACTIVE TEAM REALTORS</span><TrendingUp size={14} className="text-zinc-600" /></div>
                    <div className="text-xl font-black text-white">{realtors.filter(r => r.status !== "not available").length} ONLINE</div>
                    <p className="text-[8px] text-zinc-400 uppercase tracking-wide mt-1">Total Registry Capacity: {realtors.length}</p>
                  </div>
                </div>
              </div>
            )}

            {/* INTEL RADAR (LEADS VIEW FROM VANTAGE_DOWNLOAD_LOGS) */}
            {activeTab === "leads" && (
              <div className="space-y-6 animate-fadeIn font-mono text-xs">
                <div>
                  <h2 className="text-base uppercase tracking-wider text-white font-black">CRM Intercept Intel Radar</h2>
                  <p className="text-[10px] text-gray-500 uppercase mt-0.5">Live luxury client capture records streaming from the download trace sequences</p>
                </div>

                <div className="border border-white/10 bg-[#0A0A0A] rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-zinc-950/50 flex items-center justify-between text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                    <span>Target Client Footprint Log</span>
                    <span className="text-neonBlue">Total Verified Whales: {downloadLogs.length}</span>
                  </div>
                  {downloadLogs.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 uppercase tracking-wider text-[10px]">Zero transaction traces caught in lead logs yet. Trigger form inputs on site to verify execution pipeline.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {downloadLogs.map((log) => (
                        <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.01] transition-colors">
                          <div className="space-y-1">
                            <div className="text-white font-black uppercase text-[11px] tracking-wide">{log.client_email}</div>
                            <div className="text-[9px] text-zinc-500 uppercase">Target Node Asset Focus: <span className="text-zinc-300">{log.property_title || "Unknown Property Reference"}</span></div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-4 text-[9px] text-zinc-400">
                            <div>{new Date(log.created_at).toLocaleString()}</div>
                            <button onClick={() => deleteLeadLogNode(log.id)} className="text-zinc-600 hover:text-red-400 p-1 transition-colors"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MAIN PROPERTY INVENTORY AND TELEMETRY GRID */}
            {activeTab === "inventory" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-base uppercase tracking-wider text-white font-mono font-black">Synchronised Asset Registers</h2>
                    <p className="text-[10px] text-gray-500 uppercase font-mono mt-0.5">Live database tracking mapped columns exactly to layouts</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                    <input type="text" placeholder="FILTER PROPERTY MEMORY PLOTS..." value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/10 pl-8 pr-3 py-1.5 text-[9px] text-white font-mono tracking-widest uppercase focus:outline-none focus:border-neonBlue" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* LEFT CONTROL PARAMETERS EDITING RACK */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="border border-white/10 bg-[#0A0A0A] p-5 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <Edit3 size={13} className="text-neonBlue" />
                        <span className="text-[10px] uppercase font-mono font-black text-white tracking-wider">Property Action Matrix Engine</span>
                      </div>
                      <form onSubmit={saveAssetModifications} className="space-y-3 text-[10px] font-mono">
                        <div>
                          <label className="text-zinc-400 block mb-1 uppercase">Property System Title</label>
                          <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" required />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">Price (₦ - Global Context)</label>
                            <input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" required />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">System URL Slug</label>
                            <input type="text" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" required />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">Status Type Mapping</label>
                            <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none uppercase">
                              <option value="Available">Available</option>
                              <option value="Sold">Sold Archive</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">Location Tag</label>
                            <input type="text" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">Thumbnail Banner URL</label>
                            <input type="text" value={formThumb} onChange={(e) => setFormThumb(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">PDF Brochure URL Link</label>
                            <input type="text" value={formBrochure} onChange={(e) => setFormBrochure(e.target.value)} className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1 uppercase">Asset Summary Text Blueprint</label>
                          <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full h-16 bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none resize-none" />
                        </div>
                        <button type="submit" className="w-full bg-zinc-900 border border-white/10 hover:border-neonBlue hover:text-black hover:bg-neonBlue p-2 font-black uppercase tracking-widest transition-all">Commit Matrix Configuration Updates</button>
                      </form>
                    </div>

                    {/* DYNAMIC SLOT STREAM INJECTION PANEL */}
                    <div className="border border-white/10 bg-[#0A0A0A] p-5 rounded-2xl space-y-3 font-mono text-[10px]">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <Link2 size={13} className="text-neonBlue" />
                        <span className="uppercase font-black text-white">Dynamic Asset Stream Router Injection</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 bg-black p-1 border border-white/5">
                        {["image", "tour", "tour_title", "video"].map((type) => (
                          <button key={type} onClick={() => setMediaType(type)} className={`py-1 uppercase text-[7px] font-bold truncate ${mediaType === type ? "bg-zinc-800 text-neonBlue border border-white/10" : "text-zinc-500"}`}>{type.replace("_", " ")}</button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-zinc-400 text-[9px]">
                        <span>SELECT EXPLICIT ARRAY SLOT VALUE:</span>
                        <select value={selectedMediaSlot} onChange={(e) => setSelectedMediaSlot(Number(e.target.value))} className="bg-black border border-white/10 text-white text-[9px] px-2 py-0.5">
                          {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n} disabled={mediaType === "image" && n === 5}>SLOT {n} {mediaType === "image" && n === 5 ? "(Capped at 4)" : ""}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input type="text" placeholder="PASTE TARGET URL PROTOCOL STREAM RESOURCE..." value={mediaUrlInput} onChange={(e) => setMediaUrlInput(e.target.value)} className="flex-1 bg-black border border-white/10 p-2 text-white text-[9px] focus:outline-none focus:border-neonBlue" />
                        <button onClick={injectMediaToExplicitSlot} className="bg-zinc-900 border border-white/10 hover:border-neonBlue px-3 text-white uppercase text-[8px] font-black tracking-wider">Push</button>
                      </div>
                      <div className="bg-black/50 p-3 border border-white/5 space-y-1 text-[8px] text-zinc-400">
                        <span className="text-zinc-500 block uppercase font-bold text-[7px]">Active Selection State: {activeAsset?.title || "None"}</span>
                        <div>Current Slot Target Data Map: <span className="text-neonBlue break-all">{activeAsset ? activeAsset[`${mediaType === "image" ? "img_angle" : mediaType}_${selectedMediaSlot}`] || "Empty Array Slot Node" : "N/A"}</span></div>
                      </div>
                    </div>

                    {/* BULK TRANSFORM ACTIONS */}
                    <div className="border border-white/10 bg-[#0A0A0A] p-4 rounded-2xl space-y-3 font-mono text-[10px]">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <CheckSquare size={13} className="text-neonBlue" />
                        <span className="uppercase font-black text-white">Bulk Sequential Transformations</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleBulkStatusTransformation("Available")} className="flex-1 border border-white/10 bg-black hover:border-neonBlue py-1.5 uppercase text-[8px] font-bold">Set Selected Available</button>
                        <button onClick={() => handleBulkStatusTransformation("Sold")} className="flex-1 border border-white/10 bg-black hover:border-neonBlue py-1.5 uppercase text-[8px] font-bold">Set Selected Sold Archive</button>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT MONITORING CORES AND ARRAYS CARD REGISTERS */}
                  <div className="lg:col-span-7">
                    {loading ? (
                      <div className="flex items-center justify-center p-12 font-mono text-xs uppercase text-zinc-500 gap-2"><RefreshCw size={13} className="animate-spin text-neonBlue" /> Hydrating Active Repositories Framework...</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {assets
                          .filter(a => (a.title || "").toLowerCase().includes(assetSearch.toLowerCase()))
                          .map((asset) => {
                            const isSelected = asset.id === selectedAssetId;
                            
                            // CALCULATE PER-PROPERTY SHARE OF TOTAL QUANT SYSTEM TRAFFIC MATRICES LIVE
                            const propertyViewSharePercentage = totalPropertyViews > 0 ? ((asset.view_count || 0) / totalPropertyViews * 100).toFixed(1) : "0.0";
                            const tourViewSharePercentage = totalTourViews > 0 ? ((asset.virtual_tour_views || 0) / totalTourViews * 100).toFixed(1) : "0.0";

                            return (
                              <div key={asset.id} className={`border rounded-2xl bg-[#0A0A0A] flex flex-col relative group overflow-hidden transition-all duration-300 ${isSelected ? "border-neonBlue ring-1 ring-neonBlue/10" : "border-white/10"}`}>
                                <div className="absolute top-2 left-2 z-50">
                                  <input type="checkbox" checked={bulkSelection.includes(asset.id)} onChange={() => setBulkSelection(prev => prev.includes(asset.id) ? prev.filter(x => x !== asset.id) : [...prev, asset.id])} className="accent-neonBlue cursor-pointer w-3.5 h-3.5" />
                                </div>
                                <div onClick={() => loadAssetIntoFormContext(asset)} className="relative aspect-video w-full bg-zinc-900 border-b border-white/10 cursor-pointer overflow-hidden">
                                  <img src={asset.thumbnail_url || FALLBACK_MEDIA_URL} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-50" onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_MEDIA_URL; }} />
                                  <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                    <span className="text-[7px] font-mono tracking-widest font-bold px-1.5 py-0.5 bg-black/80 border border-white/10 text-neonBlue uppercase rounded">SLUG: {asset.system_slug || "none"}</span>
                                    <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${asset.status === 'Sold' ? 'bg-red-950/80 text-red-400 border border-red-500/30' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'}`}>{asset.status || "Available"}</span>
                                  </div>
                                  <div className="absolute bottom-2 left-2 text-[7px] font-mono text-zinc-400 bg-black/70 px-1 py-0.5 border border-white/5 rounded uppercase">{asset.location_tag || "No Location Anchor Tag"}</div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between font-mono">
                                  <div onClick={() => loadAssetIntoFormContext(asset)} className="cursor-pointer">
                                    <h3 className="text-[10px] uppercase tracking-widest font-black text-white truncate">{asset.title || "UNNAMED CONFIGURATION MATRIX"}</h3>
                                    <p className="text-xs text-neonBlue font-bold mt-0.5">₦{Number(asset.price || 0).toLocaleString()}</p>
                                  </div>

                                  {/* THE QUANT ENGINE RELATIVE PER-UNIT DATA SHARE VISUALISERS */}
                                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-[8px] uppercase text-zinc-400">
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-[7px]">
                                        <span>PROPERTY VIEWS ACCUMULATION SHARE: {asset.view_count || 0}</span>
                                        <span className="text-neonBlue font-bold">{propertyViewSharePercentage}%</span>
                                      </div>
                                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-neonBlue rounded-full" style={{ width: `${Math.min(Number(propertyViewSharePercentage), 100)}%` }}></div>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex justify-between text-[7px]">
                                        <span>INTERACTIVE TOUR TRAFFIC SHARE: {asset.virtual_tour_views || 0}</span>
                                        <span className="text-purple-400 font-bold">{tourViewSharePercentage}%</span>
                                      </div>
                                      <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(Number(tourViewSharePercentage), 100)}%` }}></div>
                                      </div>
                                    </div>

                                    <div className="pt-1 flex items-center justify-between text-[7px] text-zinc-500 border-t border-white/[0.02]">
                                      <span className="flex items-center gap-0.5"><Download size={9} /> BROCHURE DOWNLOADS: {asset.download_count || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
