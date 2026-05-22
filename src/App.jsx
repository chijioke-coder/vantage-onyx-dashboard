import React, { useState, useEffect } from "react";
import { 
  Menu, Terminal, Activity, Layers, Trash2, Search, Database, 
  X, ShieldAlert, Users, TrendingUp, Edit3, Link2, CheckSquare 
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

// Core Components
import SystemInit from "./components/SystemInit";
import Sidebar from "./components/Sidebar";
import CommandModal from "./components/CommandModal";

// Services
import { telemetryService } from "./services/telemetry";

const FALLBACK_MEDIA_URL = "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png";

export default function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data States
  const [assets, setAssets] = useState([]);
  const [downloadLogs, setDownloadLogs] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [realtors, setRealtors] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [bulkSelection, setBulkSelection] = useState([]);
  const [assetSearch, setAssetSearch] = useState("");

  // Form States
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formStatus, setFormStatus] = useState("Available");
  const [formLocation, setFormLocation] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formThumb, setFormThumb] = useState("");
  const [formBrochure, setFormBrochure] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [selectedMediaSlot, setSelectedMediaSlot] = useState(1);

  const syncAllData = async () => {
    setLoading(true);
    try {
      const [assetsRes, logsRes, visitorsRes, realtorsRes] = await Promise.all([
        telemetryService.getAllAssets(),
        telemetryService.getDownloadLogs(),
        telemetryService.getVisitors(),
        telemetryService.getRealtors()
      ]);
      setAssets(assetsRes.data || []);
      setDownloadLogs(logsRes.data || []);
      setVisitors(visitorsRes.data || []);
      setRealtors(realtorsRes.data || []);
    } catch (err) {
      toast.error("Pipeline Sync Fault");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      syncAllData();
      const interval = setInterval(syncAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);
  // Authorization Gate Check
  if (!isAuthorized) {
    return (
      <>
        <Toaster />
        <SystemInit onInitialized={() => setIsAuthorized(true)} />
      </>
    );
  }

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
           <button onClick={() => setIsCommandOpen(true)} className="p-2 border border-white/10 bg-[#0A0A0A] text-zinc-400 hover:text-white">
            <Terminal size={14} />
          </button>
        </div>
      </header>

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

      {/* ================= MASTER LAYOUT HUB FRAME ================= */}
      <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto relative z-10">
        {/* ================= INVENTORY & TELEMETRY GRID ================= */}
        {activeTab === "inventory" && (
          <div className="space-y-6 animate-fadeIn">
            {/* ... [Insert your specific inventory header and search inputs here] ... */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-6">
                {/* [Add your Asset Action Matrix form here using saveAssetModifications logic] */}
              </div>
              <div className="lg:col-span-7">
                {loading ? (
                  <div className="text-center p-12 text-zinc-500 font-mono">HYDRATING FRAMEWORK...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assets.map((asset) => (
                      <div key={asset.id} className="border border-white/10 p-4 rounded-xl">
                        <h3 className="text-[10px] font-black uppercase">{asset.title}</h3>
                        <p className="text-neonBlue font-bold">₦{Number(asset.price || 0).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Render for Home / Intel Radar tabs omitted for brevity, add your logic here */}
      </main>
    </div>
  );
}
