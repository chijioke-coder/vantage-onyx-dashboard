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

  // ==================== MAIN STATES ====================
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Connection Parameters
  const [dbUrl, setDbUrl] = useState("");
  const [dbKey, setDbKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Live Data
  const [assets, setAssets] = useState([]);
  const [downloadLogs, setDownloadLogs] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [realtors, setRealtors] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [bulkSelection, setBulkSelection] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [assetSearch, setAssetSearch] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formStatus, setFormStatus] = useState("Available");
  const [formLocation, setFormLocation] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formThumb, setFormThumb] = useState("");
  const [formBrochure, setFormBrochure] = useState("");

  // Media Injection
  const [selectedMediaSlot, setSelectedMediaSlot] = useState(1);
  const [mediaType, setMediaType] = useState("image");
  const [mediaUrlInput, setMediaUrlInput] = useState("");

  const activeAsset = assets.find(a => a.id === selectedAssetId) || null;

  // Load saved credentials
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
      const { data: propData } = await client
        .from("properties_db")
        .select("*")
        .order("title", { ascending: true });
      setAssets(propData || []);

      if (propData?.length > 0 && !selectedAssetId) {
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
      console.error("Pipeline Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) syncDashboardDataPipeline();
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
      alert("✅ Asset updated successfully");
      syncDashboardDataPipeline();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const injectMediaToExplicitSlot = async () => {
    if (!mediaUrlInput.trim() || !activeAsset) return;
    const client = initDynamicSupabase();
    if (!client) return;

    let targetKey = "";
    if (mediaType === "image") targetKey = `img_angle_${selectedMediaSlot}`;
    else if (mediaType === "tour") targetKey = `tour_url_${selectedMediaSlot}`;
    else if (mediaType === "tour_title") targetKey = `tour_title_${selectedMediaSlot}`;
    else if (mediaType === "video") targetKey = `video_url_${selectedMediaSlot}`;

    try {
      const { error } = await client
        .from("properties_db")
        .update({ [targetKey]: mediaUrlInput })
        .eq("id", activeAsset.id);
      if (error) throw error;
      setMediaUrlInput("");
      alert(`✅ Media injected into ${targetKey}`);
      syncDashboardDataPipeline();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleBulkStatusTransformation = async (newStatus) => {
    if (bulkSelection.length === 0) return alert("No assets selected");
    const client = initDynamicSupabase();
    if (!client) return;

    try {
      const { error } = await client.from("properties_db").update({ status: newStatus }).in("id", bulkSelection);
      if (error) throw error;
      alert(`✅ Bulk updated ${bulkSelection.length} assets`);
      setBulkSelection([]);
      syncDashboardDataPipeline();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      {/* ZERO-TRUST BOOTLOADER */}
      {!isSystemInitialized && <SystemInit onInitialized={() => setIsSystemInitialized(true)} />}

      {isSystemInitialized && (
        <div className="min-h-screen bg-black text-zinc-100 font-sans tracking-tight antialiased">
          {/* TOPBAR */}
          <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/90 backdrop-blur-md z-50 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-400 hover:text-white">
                <Menu size={20} />
              </button>
              <span onClick={() => setActiveTab("home")} className="text-cyan-400 font-black text-xl tracking-tighter cursor-pointer">
                ⚡ VANTAGE<span className="text-white">ONYX</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowConfigModal(true)} 
                className={`px-4 py-1.5 text-xs uppercase tracking-widest border font-mono ${isConnected ? "border-emerald-500 text-emerald-400" : "border-red-500 text-red-400"}`}
              >
                {isConnected ? "CLUSTER ONLINE" : "BIND DATABASE"}
              </button>
              <button onClick={() => setIsCommandOpen(true)} className="p-2 border border-white/10 hover:bg-white/5">
                <Terminal size={16} />
              </button>
            </div>
          </header>

          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
          <CommandModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

          {/* CENTERED CONFIG MODAL */}
          {showConfigModal && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex items-center justify-center p-4">
              <div className="border border-white/10 bg-[#0A0A0A] w-full max-w-md p-8 rounded-2xl font-mono relative">
                <button onClick={() => setShowConfigModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
                  <X size={18} />
                </button>

                <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6">
                  <Database className="text-cyan-400" size={20} />
                  <h2 className="font-black uppercase text-sm tracking-[2px]">SUPABASE NODE DYNAMIC ACCESS ROUTER</h2>
                </div>

                <form onSubmit={commitCredentialsConnection} className="space-y-6">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">PROJECT CORE INTERFACES URL</label>
                    <input 
                      type="text" 
                      value={dbUrl} 
                      onChange={(e) => setDbUrl(e.target.value)} 
                      placeholder="https://your-project.supabase.co" 
                      className="w-full bg-black border border-white/10 p-3.5 focus:border-cyan-400 outline-none" 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">ANON SECRET COMPONENT TOKEN</label>
                    <input 
                      type="password" 
                      value={dbKey} 
                      onChange={(e) => setDbKey(e.target.value)} 
                      placeholder="eyJhbGciOi..." 
                      className="w-full bg-black border border-white/10 p-3.5 focus:border-cyan-400 outline-none" 
                      required 
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3.5 uppercase text-xs tracking-widest">
                      INJECT SECURE INTERCEPTOR
                    </button>
                    {isConnected && (
                      <button type="button" onClick={clearCredentialsConnection} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 uppercase text-xs tracking-widest">
                        SEVER CLOUD LINK
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MAIN CONTENT */}
          <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
            {!isConnected && (
              <div className="text-center py-20 border border-dashed border-red-500/30 rounded-2xl">
                <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Database Not Connected</h3>
                <p className="text-zinc-400 mb-6">Click "BIND DATABASE" in the top right to connect</p>
                <button onClick={() => setShowConfigModal(true)} className="bg-white text-black px-6 py-3 font-bold">Connect Supabase</button>
              </div>
            )}

            {isConnected && (
              <div>
                {activeTab === "home" && <div>Home Terminal Content...</div>}
                {activeTab === "leads" && <div>Intel Radar Content...</div>}
                {activeTab === "inventory" && <div>Asset Matrix Content...</div>}
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
}