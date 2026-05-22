import React, { useState, useEffect } from "react";
import { 
  Menu, Search, Terminal, Activity, Layers, 
  Trash2, Download, Eye, RefreshCw, Edit3, 
  Link2, CheckSquare, Database, X, ShieldAlert, Users, TrendingUp
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import CommandModal from "./components/CommandModal";
import SystemInit from "./components/SystemInit";

// Supabase imports
import { 
  initDynamicSupabase, 
  saveDatabaseConfig, 
  getDatabaseConfig, 
  disconnectDatabase 
} from "./lib/supabase";

const FALLBACK_MEDIA_URL = "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png";

export default function App() {
  // ==================== ZERO-TRUST BOOTLOADER ====================
  const [isSystemInitialized, setIsSystemInitialized] = useState(false);

  // ==================== ORIGINAL STATES ====================
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [dbUrl, setDbUrl] = useState("");
  const [dbKey, setDbKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const [assets, setAssets] = useState([]);
  const [downloadLogs, setDownloadLogs] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [realtors, setRealtors] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [bulkSelection, setBulkSelection] = useState([]);
  const [loading, setLoading] = useState(false);

  const [assetSearch, setAssetSearch] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formStatus, setFormStatus] = useState("Available");
  const [formLocation, setFormLocation] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formThumb, setFormThumb] = useState("");
  const [formBrochure, setFormBrochure] = useState("");

  const [selectedMediaSlot, setSelectedMediaSlot] = useState(1);
  const [mediaType, setMediaType] = useState("image");
  const [mediaUrlInput, setMediaUrlInput] = useState("");

  const activeAsset = assets.find(a => a.id === selectedAssetId) || null;

  const totalPropertyViews = assets.reduce((acc, curr) => acc + (curr.view_count || 0), 0);
  const totalTourViews = assets.reduce((acc, curr) => acc + (curr.virtual_tour_views || 0), 0);

  useEffect(() => {
    const { url, key } = getDatabaseConfig();
    if (url && key) {
      setDbUrl(url);
      setDbKey(key);
      setIsConnected(true);
    }
  }, []);

  const syncDashboardDataPipeline = async () => {
    const client = initDynamicSupabase();
    if (!client) return;
    setLoading(true);
    try {
      const { data: propData, error: propErr } = await client
        .from("properties_db")
        .select("*")
        .order("title", { ascending: true });
      if (propErr) throw propErr;
      setAssets(propData || []);

      if (propData && propData.length > 0 && !selectedAssetId) {
        loadAssetIntoFormContext(propData[0]);
      }

      const { data: logData } = await client
        .from("vantage_download_logs")
        .select("*")
        .order("created_at", { ascending: false });
      setDownloadLogs(logData || []);

      const { data: visitorData } = await client
        .from("visitors_db")
        .select("*")
        .order("created_at", { ascending: false });
      setVisitors(visitorData || []);

      const { data: realtorData } = await client
        .from("realtors_registry")
        .select("*");
      setRealtors(realtorData || []);

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
    setDbUrl(""); setDbKey(""); setIsConnected(false);
    setAssets([]); setDownloadLogs([]); setVisitors([]); setRealtors([]);
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

  const injectMediaToExplicitSlot = async () => {
    if (!mediaUrlInput.trim() || !activeAsset) return;
    const client = initDynamicSupabase();
    if (!client) return;

    let targetKey = "";
    if (mediaType === "image") {
      if (selectedMediaSlot > 4) return alert("Target out of index: Only 4 explicit image angle slots available.");
      targetKey = `img_angle_${selectedMediaSlot}`;
    } else if (mediaType === "tour") targetKey = `tour_url_${selectedMediaSlot}`;
    else if (mediaType === "tour_title") targetKey = `tour_title_${selectedMediaSlot}`;
    else if (mediaType === "video") targetKey = `video_url_${selectedMediaSlot}`;

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
    <>
      {/* ZERO-TRUST BOOTLOADER */}
      {!isSystemInitialized && (
        <SystemInit onInitialized={() => setIsSystemInitialized(true)} />
      )}

      {isSystemInitialized && (
        <div className="min-h-screen bg-black text-zinc-100 font-sans tracking-tight antialiased selection:bg-neonBlue selection:text-black">
          
          {/* GLOBAL TOPBAR */}
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

          {/* CONFIG MODAL */}
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
                    {isConnected && <button type="button" onClick={clearCredentialsConnection} className="bg-red-950 text-red-400 border border-red-500/30 px-3 uppercase font-bold">Sever Cloud Link</button>}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MAIN CONTENT */}
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
                {activeTab === "home" && ( /* Your home content */ )}
                {activeTab === "leads" && ( /* Your leads content */ )}
                {activeTab === "inventory" && ( /* Your full inventory content here */ )}
              </>
            )}
          </main>
        </div>
      )}
    </>
  );
}