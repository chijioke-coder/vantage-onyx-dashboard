import React, { useState, useEffect } from "react";
import { 
  Menu, Search, Terminal, Activity, Layers, 
  Trash2, Database, X, ShieldAlert, Users, TrendingUp
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import CommandModal from "./components/CommandModal";
import SystemInit from "./components/SystemInit";

import { 
  initDynamicSupabase, 
  saveDatabaseConfig, 
  getDatabaseConfig, 
  disconnectDatabase 
} from "./lib/supabase";

const FALLBACK_MEDIA_URL = "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png";

export default function App() {
  const [isSystemInitialized, setIsSystemInitialized] = useState(false);

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
      const { data: propData } = await client.from("properties_db").select("*").order("title");
      setAssets(propData || []);

      const { data: logData } = await client.from("vantage_download_logs").select("*").order("created_at", { ascending: false });
      setDownloadLogs(logData || []);

      const { data: visitorData } = await client.from("visitors_db").select("*").order("created_at", { ascending: false });
      setVisitors(visitorData || []);

      const { data: realtorData } = await client.from("realtors_registry").select("*");
      setRealtors(realtorData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) syncDashboardDataPipeline();
  }, [isConnected]);

  const commitCredentialsConnection = (e) => {
    e.preventDefault();
    if (!dbUrl || !dbKey) return;
    saveDatabaseConfig(dbUrl, dbKey);
    setIsConnected(true);
    setShowConfigModal(false);
    setTimeout(syncDashboardDataPipeline, 400);
  };

  const clearCredentialsConnection = () => {
    disconnectDatabase();
    setIsConnected(false);
    setAssets([]); setDownloadLogs([]); setVisitors([]); setRealtors([]);
  };

  // ================== YOUR ORIGINAL FUNCTIONS (add them back here) ==================
  // loadAssetIntoFormContext, saveAssetModifications, injectMediaToExplicitSlot, etc.

  return (
    <>
      {!isSystemInitialized && <SystemInit onInitialized={() => setIsSystemInitialized(true)} />}

      {isSystemInitialized && (
        <div className="min-h-screen bg-black text-zinc-100">
          {/* Topbar */}
          <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/90 backdrop-blur-md z-50 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)}><Menu size={20} /></button>
              <span className="text-cyan-400 font-black text-xl">⚡ VANTAGE<span className="text-white">ONYX</span></span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowConfigModal(true)} className={`px-4 py-1 text-xs border ${isConnected ? 'border-emerald-500 text-emerald-400' : 'border-red-500 text-red-400'}`}>
                {isConnected ? "CLUSTER ONLINE" : "BIND DATABASE"}
              </button>
              <button onClick={() => setIsCommandOpen(true)}><Terminal size={16} /></button>
            </div>
          </header>

          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
          <CommandModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

          {/* Centered Config Modal */}
          {showConfigModal && (
            <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[300] p-4">
              <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-2xl w-full max-w-md">
                {/* Modal content - same as before */}
                <form onSubmit={commitCredentialsConnection}>
                  {/* ... your Supabase form fields ... */}
                </form>
              </div>
            </div>
          )}

          <main className="pt-20 px-4">
            {isConnected ? (
              <>
                {activeTab === "home" && <div>Your original Home content here...</div>}
                {activeTab === "leads" && <div>Your original Intel Radar content here...</div>}
                {activeTab === "inventory" && <div>Your original full Property Matrix + Form here...</div>}
              </>
            ) : (
              <div className="text-center py-20">Please connect your database</div>
            )}
          </main>
        </div>
      )}
    </>
  );
}