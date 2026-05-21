import React, { useState, useEffect, useCallback, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { 
  Menu, Search, Terminal, Activity, Layers, 
  Trash2, Download, RefreshCw, Edit3, 
  Link2, CheckSquare, Database, X, Users, TrendingUp,
  Wifi, WifiOff, Clock, BarChart3, FileText,
  ArrowUpRight, ArrowDownRight, Minus, CheckCircle, AlertTriangle
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import CommandModal from "./components/CommandModal";
import SystemInit from "./components/SystemInit";
import CommandBar from "./components/CommandBar";
import NotificationToast from "./components/ui/NotificationToast";
import TerminalCard, { TerminalCardGrid, TerminalCardStat } from "./components/ui/TerminalCard";

import { 
  initDynamicSupabase, 
  saveDatabaseConfig, 
  getDatabaseConfig, 
  disconnectDatabase 
} from "./lib/supabase";

import {
  useProperties,
  useVisitors,
  useDownloadLogs,
  useRealtors,
  useAuditLogs,
  useUpdateProperty,
  useBulkUpdateStatus,
  useDeleteDownloadLog,
  useVisitorsRealtime,
  useSyncAllData
} from "./hooks/useQueries";

import { useNotifications, useSystemHealth, useCommandBar, usePasswordAuth } from "./hooks/useDashboardState";
import { calculateTrafficVelocity } from "./services/telemetry";

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: true
    }
  }
});

const FALLBACK_MEDIA_URL = "https://i.postimg.cc/k4PTnLBS/file-00000000ce7c71fbae2f98c908c282f5.png";

// Inner dashboard component (wrapped by providers)
function DashboardContent() {
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Connection Parameters State
  const [dbUrl, setDbUrl] = useState("");
  const [dbKey, setDbKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Selection and form state
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [bulkSelection, setBulkSelection] = useState([]);
  const [assetSearch, setAssetSearch] = useState("");

  // Form state for Property Action Matrix
  const [formTitle, setFormTitle] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formStatus, setFormStatus] = useState("Available");
  const [formLocation, setFormLocation] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formThumb, setFormThumb] = useState("");
  const [formBrochure, setFormBrochure] = useState("");
  
  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  
  // Media router state
  const [selectedMediaSlot, setSelectedMediaSlot] = useState(1);
  const [mediaType, setMediaType] = useState("image");
  const [mediaUrlInput, setMediaUrlInput] = useState("");

  // Audit log filters
  const [auditFilter, setAuditFilter] = useState({ action_type: '', target_table: '' });

  // TanStack Query hooks
  const { data: assets = [], isLoading: assetsLoading, refetch: refetchAssets } = useProperties(isConnected);
  const { data: visitors = [], isLoading: visitorsLoading } = useVisitors(isConnected);
  const { data: downloadLogs = [], isLoading: logsLoading } = useDownloadLogs(isConnected);
  const { data: realtors = [] } = useRealtors(isConnected);
  const { data: auditLogs = [], isLoading: auditLoading } = useAuditLogs(auditFilter, isConnected);

  // Mutations
  const updatePropertyMutation = useUpdateProperty();
  const bulkUpdateMutation = useBulkUpdateStatus();
  const deleteLogMutation = useDeleteDownloadLog();

  // Realtime subscription for visitors
  const { activeCount: realtimeActiveVisitors, lastUpdate: realtimeLastUpdate } = useVisitorsRealtime(isConnected);

  // Global sync
  const { syncAll, clearCache } = useSyncAllData();

  // Notifications
  const { notifications, addNotification, updateNotification, removeNotification } = useNotifications();

  // System health monitoring
  const { health } = useSystemHealth(isConnected);

  // Password auth for logout
  const { logout } = usePasswordAuth();

  // Command bar
  const commandBar = useCommandBar({
    onSync: () => {
      const notifId = addNotification('Synchronizing all data pipelines...', 'pending');
      syncAll();
      setTimeout(() => updateNotification(notifId, { status: 'success', message: 'All data synchronized' }), 1000);
    },
    onClearCache: () => {
      clearCache();
      addNotification('Query cache cleared successfully', 'success');
    },
    onStatus: () => {
      const status = health.status === 'healthy' ? 'System operational' : 
                    health.status === 'degraded' ? 'System degraded - high latency' : 'System offline';
      addNotification(`Status: ${status} | Latency: ${health.latencyMs || 'N/A'}ms`, 'success');
    },
    onHelp: (helpText) => {
      addNotification(helpText, 'success');
    },
    onLogout: () => {
      logout();
      window.location.reload();
    }
  });

  // Computed values
  const activeAsset = useMemo(() => assets.find(a => a.id === selectedAssetId) || null, [assets, selectedAssetId]);
  const totalPropertyViews = useMemo(() => assets.reduce((acc, curr) => acc + (curr.view_count || 0), 0), [assets]);
  const totalTourViews = useMemo(() => assets.reduce((acc, curr) => acc + (curr.virtual_tour_views || 0), 0), [assets]);
  
  // Traffic velocity calculation
  const trafficVelocity = useMemo(() => calculateTrafficVelocity(visitors, 24), [visitors]);

  // Check connection on mount
  useEffect(() => {
    const { url, key } = getDatabaseConfig();
    if (url && key) {
      setDbUrl(url);
      setDbKey(key);
      setIsConnected(true);
    }
  }, []);

  // Auto-select first asset when loaded
  useEffect(() => {
    if (assets.length > 0 && !selectedAssetId) {
      loadAssetIntoFormContext(assets[0]);
    }
  }, [assets, selectedAssetId]);

  const loadAssetIntoFormContext = useCallback((asset) => {
    setSelectedAssetId(asset.id);
    setFormTitle(asset.title || "");
    setFormPrice((asset.price || 0).toString());
    setFormSlug(asset.system_slug || "");
    setFormStatus(asset.status || "Available");
    setFormLocation(asset.location_tag || "");
    setFormDesc(asset.description || "");
    setFormThumb(asset.thumbnail_url || "");
    setFormBrochure(asset.brochure_url || "");
    setFormErrors({});
  }, []);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (formThumb && !formThumb.match(/^https?:\/\/.+/)) {
      errors.thumbnail = 'Must be a valid URL (http:// or https://)';
    }
    if (formBrochure && !formBrochure.match(/^https?:\/\/.+/)) {
      errors.brochure = 'Must be a valid URL (http:// or https://)';
    }
    if (formPrice && (isNaN(Number(formPrice)) || Number(formPrice) < 0)) {
      errors.price = 'Must be a positive number';
    }
    if (formSlug && !formSlug.match(/^[a-z0-9-]*$/i)) {
      errors.slug = 'Only alphanumeric and hyphens allowed';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formThumb, formBrochure, formPrice, formSlug]);

  const commitCredentialsConnection = (e) => {
    e.preventDefault();
    if (!dbUrl.trim() || !dbKey.trim()) return;
    saveDatabaseConfig(dbUrl, dbKey);
    setIsConnected(true);
    setShowConfigModal(false);
    addNotification('Database connection established', 'success');
  };

  const clearCredentialsConnection = () => {
    disconnectDatabase();
    setDbUrl("");
    setDbKey("");
    setIsConnected(false);
    addNotification('Connection terminated', 'success');
  };

  const saveAssetModifications = async (e) => {
    e.preventDefault();
    if (!selectedAssetId) return;
    if (!validateForm()) {
      addNotification('Please fix form validation errors', 'error');
      return;
    }

    const oldValue = activeAsset;
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

    const notifId = addNotification('Updating property configuration...', 'pending');

    try {
      await updatePropertyMutation.mutateAsync({ id: selectedAssetId, payload, oldValue });
      updateNotification(notifId, { status: 'success', message: 'Property updated successfully' });
    } catch (err) {
      updateNotification(notifId, { status: 'error', message: `Update failed: ${err.message}` });
    }
  };

  const injectMediaToExplicitSlot = async () => {
    if (!mediaUrlInput.trim() || !activeAsset) return;
    
    if (!mediaUrlInput.match(/^https?:\/\/.+/)) {
      addNotification('Invalid URL format', 'error');
      return;
    }

    let targetKey = "";
    if (mediaType === "image") {
      if (selectedMediaSlot > 4) {
        addNotification('Only 4 image slots available', 'error');
        return;
      }
      targetKey = `img_angle_${selectedMediaSlot}`;
    } else if (mediaType === "tour") {
      targetKey = `tour_url_${selectedMediaSlot}`;
    } else if (mediaType === "tour_title") {
      targetKey = `tour_title_${selectedMediaSlot}`;
    } else if (mediaType === "video") {
      targetKey = `video_url_${selectedMediaSlot}`;
    }

    const notifId = addNotification(`Injecting media to ${targetKey}...`, 'pending');

    try {
      await updatePropertyMutation.mutateAsync({ 
        id: activeAsset.id, 
        payload: { [targetKey]: mediaUrlInput },
        oldValue: { [targetKey]: activeAsset[targetKey] }
      });
      setMediaUrlInput("");
      updateNotification(notifId, { status: 'success', message: `Media injected to [${targetKey.toUpperCase()}]` });
    } catch (err) {
      updateNotification(notifId, { status: 'error', message: err.message });
    }
  };

  const handleBulkStatusTransformation = async (newStatus) => {
    if (bulkSelection.length === 0) {
      addNotification('No items selected for bulk update', 'error');
      return;
    }

    const notifId = addNotification(`Updating ${bulkSelection.length} items to ${newStatus}...`, 'pending');

    try {
      await bulkUpdateMutation.mutateAsync({ ids: bulkSelection, status: newStatus });
      setBulkSelection([]);
      updateNotification(notifId, { status: 'success', message: `${bulkSelection.length} items updated to ${newStatus}` });
    } catch (err) {
      updateNotification(notifId, { status: 'error', message: err.message });
    }
  };

  const deleteLeadLogNode = async (id) => {
    if (!confirm("Permanently delete this lead record?")) return;

    const notifId = addNotification('Deleting lead record...', 'pending');

    try {
      await deleteLogMutation.mutateAsync(id);
      updateNotification(notifId, { status: 'success', message: 'Lead record deleted' });
    } catch (err) {
      updateNotification(notifId, { status: 'error', message: err.message });
    }
  };

  // Filtered assets for search
  const filteredAssets = useMemo(() => 
    assets.filter(a => (a.title || "").toLowerCase().includes(assetSearch.toLowerCase())),
    [assets, assetSearch]
  );

  // Virtualized list for leads
  const leadsParentRef = React.useRef(null);
  const leadsVirtualizer = useVirtualizer({
    count: downloadLogs.length,
    getScrollElement: () => leadsParentRef.current,
    estimateSize: () => 80,
    overscan: 5
  });

  const isLoading = assetsLoading || visitorsLoading || logsLoading;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans tracking-tight antialiased selection:bg-neonBlue selection:text-black">
      
      {/* Notification Toast Layer */}
      <NotificationToast notifications={notifications} onDismiss={removeNotification} />

      {/* Global Header with Latency Monitor */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-black/80 backdrop-blur-md z-[200] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <span onClick={() => setActiveTab("home")} className="text-neonBlue font-black text-xl tracking-tighter italic cursor-pointer">
            VANTAGE<span className="text-white not-italic font-light">ONYX</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-[10px] uppercase tracking-widest font-mono font-black">
          {[
            { id: "home", label: "Terminal Hub" },
            { id: "leads", label: "Intel Radar" },
            { id: "inventory", label: "Assets Manager" },
            { id: "stats", label: "Quant Engine" },
            { id: "audit", label: "Audit Logs" }
          ].map((t) => (
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)} 
              className={`transition-all pb-1 ${activeTab === t.id ? "text-neonBlue border-b border-neonBlue" : "text-gray-400 hover:text-neonBlue"}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Latency Monitor */}
          {isConnected && (
            <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 text-[8px] uppercase font-mono tracking-wider border ${
              health.latencyMs === null ? 'border-zinc-700 text-zinc-500' :
              health.latencyMs < 100 ? 'border-emerald-500/30 text-emerald-400' :
              health.latencyMs < 300 ? 'border-yellow-500/30 text-yellow-400' :
              'border-red-500/30 text-red-400'
            }`}>
              <Clock size={9} />
              {health.latencyMs !== null ? `${health.latencyMs}ms` : '---'}
            </div>
          )}
          
          {/* Connection Status */}
          <button 
            onClick={() => setShowConfigModal(true)} 
            className={`flex items-center gap-1.5 px-3 py-1 text-[9px] uppercase font-bold border font-mono transition-all tracking-widest ${
              isConnected 
                ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/20" 
                : "border-red-500/30 text-red-400 bg-red-950/20"
            }`}
          >
            {isConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {isConnected ? "CLUSTER ONLINE" : "OFFLINE"}
            {isConnected && realtimeActiveVisitors > 0 && (
              <span className="ml-1 px-1 bg-emerald-500/20 text-emerald-300 text-[7px]">
                {realtimeActiveVisitors} LIVE
              </span>
            )}
          </button>
          
          <button onClick={() => setIsCommandOpen(true)} className="p-2 border border-white/10 bg-[#0A0A0A] text-zinc-400 hover:text-white">
            <Terminal size={14} />
          </button>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CommandModal isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="border border-white/10 bg-[#0A0A0A] w-full max-w-md p-6 relative rounded-2xl font-mono">
            <button onClick={() => setShowConfigModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X size={16} />
            </button>
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Database className="text-neonBlue" size={16} />
              <h2 className="font-black uppercase text-xs text-white tracking-widest">Database Connection</h2>
            </div>
            <form onSubmit={commitCredentialsConnection} className="space-y-4 text-[10px]">
              <div>
                <label className="text-zinc-400 block mb-1 uppercase tracking-wider">Supabase URL</label>
                <input 
                  type="text" 
                  value={dbUrl} 
                  onChange={(e) => setDbUrl(e.target.value)} 
                  placeholder="https://your-project.supabase.co" 
                  className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1 uppercase tracking-wider">Anon Key</label>
                <input 
                  type="password" 
                  value={dbKey} 
                  onChange={(e) => setDbKey(e.target.value)} 
                  placeholder="eyJhbGciOiJIUzI1NiIs..." 
                  className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" 
                  required 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-neonBlue text-black font-black uppercase py-2 tracking-widest hover:opacity-90">
                  Connect
                </button>
                {isConnected && (
                  <button type="button" onClick={clearCredentialsConnection} className="bg-red-950 text-red-400 border border-red-500/30 px-3 uppercase font-bold">
                    Disconnect
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-24 pb-24 px-4 max-w-7xl mx-auto relative z-10">
        
        {!isConnected ? (
          <TerminalCard className="max-w-xl mx-auto my-12" variant="elevated">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
              <WifiOff size={32} className="text-red-500 animate-pulse" />
              <h3 className="text-xs font-black uppercase text-white tracking-widest">Database Connection Required</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Connect to your Supabase database to enable telemetry and management features.
              </p>
              <button 
                onClick={() => setShowConfigModal(true)} 
                className="border border-neonBlue/30 text-neonBlue bg-neonBlue/10 px-4 py-1.5 uppercase text-[9px] font-black tracking-widest hover:bg-neonBlue hover:text-black transition-all"
              >
                Configure Connection
              </button>
            </div>
          </TerminalCard>
        ) : (
          <>
            {/* HOME TAB */}
            {activeTab === "home" && (
              <div className="space-y-6 animate-fadeIn">
                <TerminalCard 
                  title="Executive Summary Control Terminal"
                  icon={<Terminal size={13} />}
                >
                  <h1 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
                    Dynamic Luxury Footprint Telemetry Engine
                  </h1>
                  <p className="text-[10px] text-zinc-500 mt-2 font-mono">
                    {realtimeLastUpdate ? `Last realtime update: ${realtimeLastUpdate.toLocaleTimeString()}` : 'Realtime monitoring active'}
                  </p>
                </TerminalCard>

                <TerminalCardGrid columns={4}>
                  <TerminalCard 
                    className="cursor-pointer hover:border-neonBlue/30" 
                    onClick={() => setActiveTab("leads")}
                  >
                    <TerminalCardStat 
                      label="Intel Radar Records"
                      value={`${downloadLogs.length} WHALES`}
                      subtext="Live Capture Streams Hot"
                      icon={<Users size={14} />}
                    />
                  </TerminalCard>
                  
                  <TerminalCard 
                    className="cursor-pointer hover:border-neonBlue/30"
                    onClick={() => setActiveTab("inventory")}
                  >
                    <TerminalCardStat 
                      label="Inventory Segments"
                      value={`${assets.length} REGISTERS`}
                      subtext="Properties Matrix Configured"
                      icon={<Layers size={14} />}
                    />
                  </TerminalCard>
                  
                  <TerminalCard 
                    className="cursor-pointer hover:border-neonBlue/30"
                    onClick={() => setActiveTab("stats")}
                  >
                    <TerminalCardStat 
                      label="System Traffic"
                      value={`${visitors.length} VISITS`}
                      subtext={`${realtimeActiveVisitors} active now`}
                      icon={<Activity size={14} />}
                      trend={trafficVelocity.trend}
                    />
                  </TerminalCard>
                  
                  <TerminalCard>
                    <TerminalCardStat 
                      label="Active Realtors"
                      value={`${realtors.filter(r => r.status !== "not available").length} ONLINE`}
                      subtext={`Total capacity: ${realtors.length}`}
                      icon={<TrendingUp size={14} />}
                    />
                  </TerminalCard>
                </TerminalCardGrid>

                {/* Quick Stats Preview */}
                <TerminalCard title="Traffic Velocity (24h)" icon={<BarChart3 size={13} />}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {trafficVelocity.trend === 'up' && <ArrowUpRight className="text-emerald-400" size={20} />}
                      {trafficVelocity.trend === 'down' && <ArrowDownRight className="text-red-400" size={20} />}
                      {trafficVelocity.trend === 'stable' && <Minus className="text-zinc-500" size={20} />}
                      <span className={`text-2xl font-black font-mono ${
                        trafficVelocity.trend === 'up' ? 'text-emerald-400' :
                        trafficVelocity.trend === 'down' ? 'text-red-400' : 'text-zinc-400'
                      }`}>
                        {trafficVelocity.velocityPercent > 0 ? '+' : ''}{trafficVelocity.velocityPercent}%
                      </span>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 uppercase">
                      <div>Current period: {trafficVelocity.currentCount} visits</div>
                      <div>Previous period: {trafficVelocity.previousCount} visits</div>
                    </div>
                  </div>
                </TerminalCard>
              </div>
            )}

            {/* LEADS TAB - Virtualized */}
            {activeTab === "leads" && (
              <div className="space-y-6 animate-fadeIn font-mono text-xs">
                <div>
                  <h2 className="text-base uppercase tracking-wider text-white font-black">CRM Intercept Intel Radar</h2>
                  <p className="text-[10px] text-gray-500 uppercase mt-0.5">Virtualized high-performance lead tracking</p>
                </div>

                <TerminalCard noPadding>
                  <div className="p-4 border-b border-white/5 bg-zinc-950/50 flex items-center justify-between text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                    <span>Target Client Footprint Log</span>
                    <span className="text-neonBlue">Total Records: {downloadLogs.length}</span>
                  </div>
                  
                  {logsLoading ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="animate-spin text-neonBlue mx-auto mb-2" size={20} />
                      <span className="text-zinc-500 text-[10px] uppercase">Loading leads...</span>
                    </div>
                  ) : downloadLogs.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 uppercase tracking-wider text-[10px]">
                      No lead records found
                    </div>
                  ) : (
                    <div 
                      ref={leadsParentRef}
                      className="h-[500px] overflow-auto"
                    >
                      <div
                        style={{
                          height: `${leadsVirtualizer.getTotalSize()}px`,
                          width: '100%',
                          position: 'relative',
                        }}
                      >
                        {leadsVirtualizer.getVirtualItems().map((virtualRow) => {
                          const log = downloadLogs[virtualRow.index];
                          return (
                            <div
                              key={log.id}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                              }}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 hover:bg-white/[0.01]"
                            >
                              <div className="space-y-1">
                                <div className="text-white font-black uppercase text-[11px]">{log.client_email}</div>
                                <div className="text-[9px] text-zinc-500">
                                  Property: <span className="text-zinc-300">{log.property_title || "Unknown"}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-[9px] text-zinc-400">
                                <span>{new Date(log.created_at).toLocaleString()}</span>
                                <button 
                                  onClick={() => deleteLeadLogNode(log.id)} 
                                  className="text-zinc-600 hover:text-red-400 p-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </TerminalCard>
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === "inventory" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-base uppercase tracking-wider text-white font-mono font-black">Asset Management</h2>
                    <p className="text-[10px] text-gray-500 uppercase font-mono mt-0.5">
                      {bulkSelection.length > 0 && (
                        <span className="text-neonBlue">{bulkSelection.length} selected | </span>
                      )}
                      {filteredAssets.length} of {assets.length} properties
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Filter properties..." 
                      value={assetSearch} 
                      onChange={(e) => setAssetSearch(e.target.value)} 
                      className="w-full bg-[#0A0A0A] border border-white/10 pl-8 pr-3 py-1.5 text-[9px] text-white font-mono tracking-widest uppercase focus:outline-none focus:border-neonBlue" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Panel - Forms */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Property Action Matrix */}
                    <TerminalCard title="Property Action Matrix" icon={<Edit3 size={13} />}>
                      <form onSubmit={saveAssetModifications} className="space-y-3 text-[10px] font-mono">
                        <div>
                          <label className="text-zinc-400 block mb-1 uppercase">Title</label>
                          <input 
                            type="text" 
                            value={formTitle} 
                            onChange={(e) => setFormTitle(e.target.value)} 
                            className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" 
                            required 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">Price (NGN)</label>
                            <input 
                              type="number" 
                              value={formPrice} 
                              onChange={(e) => setFormPrice(e.target.value)} 
                              className={`w-full bg-black border p-2 text-white focus:outline-none ${formErrors.price ? 'border-red-500' : 'border-white/10 focus:border-neonBlue'}`}
                              required 
                            />
                            {formErrors.price && <span className="text-red-400 text-[8px]">{formErrors.price}</span>}
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">URL Slug</label>
                            <input 
                              type="text" 
                              value={formSlug} 
                              onChange={(e) => setFormSlug(e.target.value)} 
                              className={`w-full bg-black border p-2 text-white focus:outline-none ${formErrors.slug ? 'border-red-500' : 'border-white/10 focus:border-neonBlue'}`}
                              required 
                            />
                            {formErrors.slug && <span className="text-red-400 text-[8px]">{formErrors.slug}</span>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">Status</label>
                            <select 
                              value={formStatus} 
                              onChange={(e) => setFormStatus(e.target.value)} 
                              className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none uppercase"
                            >
                              <option value="Available">Available</option>
                              <option value="Sold">Sold</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">Location</label>
                            <input 
                              type="text" 
                              value={formLocation} 
                              onChange={(e) => setFormLocation(e.target.value)} 
                              className="w-full bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">Thumbnail URL</label>
                            <input 
                              type="text" 
                              value={formThumb} 
                              onChange={(e) => setFormThumb(e.target.value)} 
                              className={`w-full bg-black border p-2 text-white focus:outline-none ${formErrors.thumbnail ? 'border-red-500' : 'border-white/10 focus:border-neonBlue'}`}
                            />
                            {formErrors.thumbnail && <span className="text-red-400 text-[8px]">{formErrors.thumbnail}</span>}
                          </div>
                          <div>
                            <label className="text-zinc-400 block mb-1 uppercase">Brochure URL</label>
                            <input 
                              type="text" 
                              value={formBrochure} 
                              onChange={(e) => setFormBrochure(e.target.value)} 
                              className={`w-full bg-black border p-2 text-white focus:outline-none ${formErrors.brochure ? 'border-red-500' : 'border-white/10 focus:border-neonBlue'}`}
                            />
                            {formErrors.brochure && <span className="text-red-400 text-[8px]">{formErrors.brochure}</span>}
                          </div>
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1 uppercase">Description</label>
                          <textarea 
                            value={formDesc} 
                            onChange={(e) => setFormDesc(e.target.value)} 
                            className="w-full h-16 bg-black border border-white/10 p-2 text-white focus:border-neonBlue focus:outline-none resize-none" 
                          />
                        </div>
                        <button 
                          type="submit" 
                          disabled={updatePropertyMutation.isPending}
                          className="w-full bg-zinc-900 border border-white/10 hover:border-neonBlue hover:text-black hover:bg-neonBlue p-2 font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {updatePropertyMutation.isPending ? (
                            <><RefreshCw className="animate-spin" size={12} /> Updating...</>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </form>
                    </TerminalCard>

                    {/* Media Injection Panel */}
                    <TerminalCard title="Media Slot Injection" icon={<Link2 size={13} />}>
                      <div className="space-y-3 font-mono text-[10px]">
                        <div className="grid grid-cols-4 gap-1 bg-black p-1 border border-white/5">
                          {["image", "tour", "tour_title", "video"].map((type) => (
                            <button 
                              key={type} 
                              onClick={() => setMediaType(type)} 
                              className={`py-1 uppercase text-[7px] font-bold truncate ${mediaType === type ? "bg-zinc-800 text-neonBlue border border-white/10" : "text-zinc-500"}`}
                            >
                              {type.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-zinc-400 text-[9px]">
                          <span>Slot:</span>
                          <select 
                            value={selectedMediaSlot} 
                            onChange={(e) => setSelectedMediaSlot(Number(e.target.value))} 
                            className="bg-black border border-white/10 text-white text-[9px] px-2 py-0.5"
                          >
                            {[1, 2, 3, 4, 5].map(n => (
                              <option key={n} value={n} disabled={mediaType === "image" && n === 5}>
                                SLOT {n}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Paste URL..." 
                            value={mediaUrlInput} 
                            onChange={(e) => setMediaUrlInput(e.target.value)} 
                            className="flex-1 bg-black border border-white/10 p-2 text-white text-[9px] focus:outline-none focus:border-neonBlue" 
                          />
                          <button 
                            onClick={injectMediaToExplicitSlot} 
                            className="bg-zinc-900 border border-white/10 hover:border-neonBlue px-3 text-white uppercase text-[8px] font-black"
                          >
                            Push
                          </button>
                        </div>
                        <div className="bg-black/50 p-2 border border-white/5 text-[8px] text-zinc-500">
                          <span>Selected: {activeAsset?.title || "None"}</span>
                        </div>
                      </div>
                    </TerminalCard>

                    {/* Bulk Actions */}
                    <TerminalCard title="Bulk Transformations" icon={<CheckSquare size={13} />}>
                      <div className="space-y-3 font-mono text-[10px]">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={bulkSelection.length === assets.length && assets.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelection(assets.map(a => a.id));
                              } else {
                                setBulkSelection([]);
                              }
                            }}
                            className="accent-neonBlue"
                          />
                          <span className="text-zinc-400 uppercase">Select All ({assets.length})</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleBulkStatusTransformation("Available")} 
                            disabled={bulkSelection.length === 0 || bulkUpdateMutation.isPending}
                            className="flex-1 border border-white/10 bg-black hover:border-emerald-500/30 py-1.5 uppercase text-[8px] font-bold disabled:opacity-30"
                          >
                            Set Available
                          </button>
                          <button 
                            onClick={() => handleBulkStatusTransformation("Sold")} 
                            disabled={bulkSelection.length === 0 || bulkUpdateMutation.isPending}
                            className="flex-1 border border-white/10 bg-black hover:border-red-500/30 py-1.5 uppercase text-[8px] font-bold disabled:opacity-30"
                          >
                            Set Sold
                          </button>
                        </div>
                      </div>
                    </TerminalCard>
                  </div>

                  {/* Right Panel - Asset Cards */}
                  <div className="lg:col-span-7">
                    {assetsLoading ? (
                      <div className="flex items-center justify-center p-12 font-mono text-xs uppercase text-zinc-500 gap-2">
                        <RefreshCw size={13} className="animate-spin text-neonBlue" /> Loading assets...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredAssets.map((asset) => {
                          const isSelected = asset.id === selectedAssetId;
                          const propertyViewShare = totalPropertyViews > 0 ? ((asset.view_count || 0) / totalPropertyViews * 100).toFixed(1) : "0.0";
                          const tourViewShare = totalTourViews > 0 ? ((asset.virtual_tour_views || 0) / totalTourViews * 100).toFixed(1) : "0.0";

                          return (
                            <div 
                              key={asset.id} 
                              className={`border rounded-2xl bg-[#0A0A0A] flex flex-col relative group overflow-hidden transition-all duration-300 ${isSelected ? "border-neonBlue ring-1 ring-neonBlue/10" : "border-white/10"}`}
                            >
                              <div className="absolute top-2 left-2 z-50">
                                <input 
                                  type="checkbox" 
                                  checked={bulkSelection.includes(asset.id)} 
                                  onChange={() => setBulkSelection(prev => 
                                    prev.includes(asset.id) ? prev.filter(x => x !== asset.id) : [...prev, asset.id]
                                  )} 
                                  className="accent-neonBlue cursor-pointer w-3.5 h-3.5" 
                                />
                              </div>
                              <div 
                                onClick={() => loadAssetIntoFormContext(asset)} 
                                className="relative aspect-video w-full bg-zinc-900 border-b border-white/10 cursor-pointer overflow-hidden"
                              >
                                <img 
                                  src={asset.thumbnail_url || FALLBACK_MEDIA_URL} 
                                  alt={asset.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-50" 
                                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_MEDIA_URL; }} 
                                />
                                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                  <span className="text-[7px] font-mono tracking-widest font-bold px-1.5 py-0.5 bg-black/80 border border-white/10 text-neonBlue uppercase rounded">
                                    {asset.system_slug || "none"}
                                  </span>
                                  <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                                    asset.status === 'Sold' 
                                      ? 'bg-red-950/80 text-red-400 border border-red-500/30' 
                                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                                  }`}>
                                    {asset.status || "Available"}
                                  </span>
                                </div>
                                <div className="absolute bottom-2 left-2 text-[7px] font-mono text-zinc-400 bg-black/70 px-1 py-0.5 border border-white/5 rounded uppercase">
                                  {asset.location_tag || "No Location"}
                                </div>
                              </div>

                              <div className="p-4 flex-1 flex flex-col justify-between font-mono">
                                <div onClick={() => loadAssetIntoFormContext(asset)} className="cursor-pointer">
                                  <h3 className="text-[10px] uppercase tracking-widest font-black text-white truncate">
                                    {asset.title || "UNNAMED"}
                                  </h3>
                                  <p className="text-xs text-neonBlue font-bold mt-0.5">
                                    NGN {Number(asset.price || 0).toLocaleString()}
                                  </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-[8px] uppercase text-zinc-400">
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[7px]">
                                      <span>Views: {asset.view_count || 0}</span>
                                      <span className="text-neonBlue font-bold">{propertyViewShare}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                                      <div className="h-full bg-neonBlue rounded-full" style={{ width: `${Math.min(Number(propertyViewShare), 100)}%` }} />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[7px]">
                                      <span>Tours: {asset.virtual_tour_views || 0}</span>
                                      <span className="text-purple-400 font-bold">{tourViewShare}%</span>
                                    </div>
                                    <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(Number(tourViewShare), 100)}%` }} />
                                    </div>
                                  </div>

                                  <div className="pt-1 flex items-center justify-between text-[7px] text-zinc-500 border-t border-white/[0.02]">
                                    <span className="flex items-center gap-0.5">
                                      <Download size={9} /> Downloads: {asset.download_count || 0}
                                    </span>
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

            {/* STATS TAB */}
            {activeTab === "stats" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-base uppercase tracking-wider text-white font-mono font-black">Quant Engine Analytics</h2>
                  <p className="text-[10px] text-gray-500 uppercase font-mono mt-0.5">Traffic velocity and performance metrics</p>
                </div>

                <TerminalCardGrid columns={3}>
                  <TerminalCard title="Traffic Velocity (24h)" icon={<TrendingUp size={13} />}>
                    <div className="flex items-center gap-3">
                      {trafficVelocity.trend === 'up' && <ArrowUpRight className="text-emerald-400" size={32} />}
                      {trafficVelocity.trend === 'down' && <ArrowDownRight className="text-red-400" size={32} />}
                      {trafficVelocity.trend === 'stable' && <Minus className="text-zinc-500" size={32} />}
                      <div>
                        <span className={`text-3xl font-black font-mono ${
                          trafficVelocity.trend === 'up' ? 'text-emerald-400' :
                          trafficVelocity.trend === 'down' ? 'text-red-400' : 'text-zinc-400'
                        }`}>
                          {trafficVelocity.velocityPercent > 0 ? '+' : ''}{trafficVelocity.velocityPercent}%
                        </span>
                        <div className="text-[8px] text-zinc-500 uppercase mt-1">vs previous 24h</div>
                      </div>
                    </div>
                  </TerminalCard>

                  <TerminalCard title="Current Period" icon={<Activity size={13} />}>
                    <div className="text-3xl font-black font-mono text-neonBlue">
                      {trafficVelocity.currentCount}
                    </div>
                    <div className="text-[8px] text-zinc-500 uppercase mt-1">visits in last 24h</div>
                  </TerminalCard>

                  <TerminalCard title="Previous Period" icon={<Clock size={13} />}>
                    <div className="text-3xl font-black font-mono text-zinc-400">
                      {trafficVelocity.previousCount}
                    </div>
                    <div className="text-[8px] text-zinc-500 uppercase mt-1">visits 24-48h ago</div>
                  </TerminalCard>
                </TerminalCardGrid>

                <TerminalCard title="Aggregate Statistics" icon={<BarChart3 size={13} />}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
                    <div className="p-4 bg-black/50 border border-white/5 rounded-xl">
                      <div className="text-[9px] text-zinc-500 uppercase mb-2">Total Properties</div>
                      <div className="text-2xl font-black text-white">{assets.length}</div>
                    </div>
                    <div className="p-4 bg-black/50 border border-white/5 rounded-xl">
                      <div className="text-[9px] text-zinc-500 uppercase mb-2">Total Views</div>
                      <div className="text-2xl font-black text-neonBlue">{totalPropertyViews.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-black/50 border border-white/5 rounded-xl">
                      <div className="text-[9px] text-zinc-500 uppercase mb-2">Total Tours</div>
                      <div className="text-2xl font-black text-purple-400">{totalTourViews.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-black/50 border border-white/5 rounded-xl">
                      <div className="text-[9px] text-zinc-500 uppercase mb-2">Active Now</div>
                      <div className="text-2xl font-black text-emerald-400">{realtimeActiveVisitors}</div>
                    </div>
                  </div>
                </TerminalCard>

                <TerminalCard title="Property Performance Breakdown" icon={<Layers size={13} />}>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {assets.slice().sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).map((asset, index) => (
                      <div key={asset.id} className="flex items-center gap-3 p-2 bg-black/30 border border-white/5 rounded-lg">
                        <span className="text-[10px] font-mono text-zinc-500 w-6">#{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-mono font-bold text-white truncate">{asset.title}</div>
                          <div className="flex items-center gap-4 text-[8px] text-zinc-500 mt-1">
                            <span>{asset.view_count || 0} views</span>
                            <span>{asset.virtual_tour_views || 0} tours</span>
                            <span>{asset.download_count || 0} downloads</span>
                          </div>
                        </div>
                        <div className={`text-[8px] font-mono px-2 py-0.5 rounded ${
                          asset.status === 'Sold' 
                            ? 'bg-red-950/50 text-red-400' 
                            : 'bg-emerald-950/50 text-emerald-400'
                        }`}>
                          {asset.status || 'Available'}
                        </div>
                      </div>
                    ))}
                  </div>
                </TerminalCard>
              </div>
            )}

            {/* AUDIT TAB */}
            {activeTab === "audit" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div>
                    <h2 className="text-base uppercase tracking-wider text-white font-mono font-black">Audit Logs</h2>
                    <p className="text-[10px] text-gray-500 uppercase font-mono mt-0.5">Configuration change history</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={auditFilter.action_type}
                      onChange={(e) => setAuditFilter(prev => ({ ...prev, action_type: e.target.value }))}
                      className="bg-black border border-white/10 text-white text-[9px] px-2 py-1 font-mono uppercase"
                    >
                      <option value="">All Actions</option>
                      <option value="UPDATE">Updates</option>
                      <option value="BULK_UPDATE">Bulk Updates</option>
                      <option value="DELETE">Deletes</option>
                    </select>
                    <select
                      value={auditFilter.target_table}
                      onChange={(e) => setAuditFilter(prev => ({ ...prev, target_table: e.target.value }))}
                      className="bg-black border border-white/10 text-white text-[9px] px-2 py-1 font-mono uppercase"
                    >
                      <option value="">All Tables</option>
                      <option value="properties_db">Properties</option>
                      <option value="vantage_download_logs">Download Logs</option>
                    </select>
                  </div>
                </div>

                <TerminalCard noPadding>
                  <div className="p-4 border-b border-white/5 bg-zinc-950/50 flex items-center justify-between text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                    <span>Change History</span>
                    <span className="text-neonBlue">{auditLogs.length} Records</span>
                  </div>
                  
                  {auditLoading ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="animate-spin text-neonBlue mx-auto mb-2" size={20} />
                      <span className="text-zinc-500 text-[10px] uppercase">Loading audit logs...</span>
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 uppercase tracking-wider text-[10px]">
                      <FileText size={32} className="mx-auto mb-3 opacity-30" />
                      <div>No audit records found</div>
                      <div className="text-[8px] mt-1">Actions will be logged when you modify properties</div>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-white/[0.01] transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                log.action_type === 'UPDATE' ? 'bg-neonBlue/10 text-neonBlue' :
                                log.action_type === 'BULK_UPDATE' ? 'bg-purple-500/10 text-purple-400' :
                                log.action_type === 'DELETE' ? 'bg-red-500/10 text-red-400' :
                                'bg-zinc-800 text-zinc-400'
                              }`}>
                                {log.action_type === 'UPDATE' && <Edit3 size={14} />}
                                {log.action_type === 'BULK_UPDATE' && <CheckSquare size={14} />}
                                {log.action_type === 'DELETE' && <Trash2 size={14} />}
                              </div>
                              <div>
                                <div className="text-[10px] font-mono font-bold text-white uppercase">
                                  {log.action_type.replace('_', ' ')}
                                </div>
                                <div className="text-[9px] text-zinc-500 font-mono">
                                  Table: {log.target_table}
                                </div>
                              </div>
                            </div>
                            <div className="text-[8px] text-zinc-500 font-mono text-right">
                              <div>{new Date(log.created_at).toLocaleDateString()}</div>
                              <div>{new Date(log.created_at).toLocaleTimeString()}</div>
                            </div>
                          </div>
                          {log.new_value && (
                            <div className="mt-3 p-2 bg-black/50 border border-white/5 rounded text-[8px] font-mono text-zinc-400 overflow-x-auto">
                              <pre className="whitespace-pre-wrap">{JSON.stringify(log.new_value, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TerminalCard>
              </div>
            )}
          </>
        )}
      </main>

      {/* Command Bar */}
      <CommandBar
        isOpen={commandBar.isOpen}
        setIsOpen={commandBar.setIsOpen}
        executeCommand={commandBar.executeCommand}
        navigateHistory={commandBar.navigateHistory}
        availableCommands={commandBar.availableCommands}
        onOutput={(msg) => addNotification(msg, 'success')}
      />
    </div>
  );
}

// Main App with providers
export default function App() {
  const [systemReady, setSystemReady] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <SystemInit onSystemReady={() => setSystemReady(true)}>
        {systemReady && <DashboardContent />}
      </SystemInit>
    </QueryClientProvider>
  );
}
