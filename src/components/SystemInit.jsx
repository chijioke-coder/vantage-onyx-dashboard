/**
 * SystemInit - Zero-Trust Initialization Engine
 * Full-screen bootloader overlay that blocks dashboard until verification passes
 */

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, AlertTriangle, Loader2, Database, Eye, EyeOff, Terminal } from 'lucide-react';
import { usePasswordAuth } from '../hooks/useDashboardState';
import { getDatabaseConfig, saveDatabaseConfig } from '../lib/supabase';

/**
 * Boot sequence stages for visual feedback
 */
const BOOT_STAGES = [
  { id: 'init', label: 'INITIALIZING SECURE KERNEL...' },
  { id: 'auth', label: 'VERIFYING AUTHENTICATION STATE...' },
  { id: 'config', label: 'LOADING CONFIGURATION MATRIX...' },
  { id: 'ready', label: 'SYSTEM READY FOR DEPLOYMENT' }
];

export default function SystemInit({ children, onSystemReady }) {
  const {
    isAuthenticated,
    hasPassword,
    isChecking,
    createPassword,
    verifyPassword
  } = usePasswordAuth();

  const [bootStage, setBootStage] = useState(0);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showPasswordVerify, setShowPasswordVerify] = useState(false);
  const [showEnvConfig, setShowEnvConfig] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Environment config state
  const [envUrl, setEnvUrl] = useState('');
  const [envKey, setEnvKey] = useState('');
  
  // Check if we need to show env config modal
  const [needsEnvConfig, setNeedsEnvConfig] = useState(false);

  // Boot sequence simulation
  useEffect(() => {
    if (isChecking) return;
    
    const runBootSequence = async () => {
      // Stage 1: Init
      setBootStage(0);
      await new Promise(r => setTimeout(r, 400));
      
      // Stage 2: Auth check
      setBootStage(1);
      await new Promise(r => setTimeout(r, 300));
      
      // Determine next action based on auth state
      if (!hasPassword) {
        // First time setup required
        setShowPasswordSetup(true);
        return;
      }
      
      if (!isAuthenticated) {
        // Password exists but not authenticated this session
        setShowPasswordVerify(true);
        return;
      }
      
      // Stage 3: Config check
      setBootStage(2);
      await new Promise(r => setTimeout(r, 300));
      
      // Check if we have database config
      const { url, key } = getDatabaseConfig();
      if (!url || !key) {
        setNeedsEnvConfig(true);
        setShowEnvConfig(true);
        return;
      }
      
      // Stage 4: Ready
      setBootStage(3);
      await new Promise(r => setTimeout(r, 200));
      
      // System is ready
      onSystemReady?.();
    };
    
    runBootSequence();
  }, [isChecking, hasPassword, isAuthenticated, onSystemReady]);

  // Handle password creation
  const handleCreatePassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    const success = await createPassword(password);
    setIsLoading(false);
    
    if (success) {
      setShowPasswordSetup(false);
      setPassword('');
      setConfirmPassword('');
      
      // Continue boot sequence - check config
      setBootStage(2);
      const { url, key } = getDatabaseConfig();
      if (!url || !key) {
        setNeedsEnvConfig(true);
        setShowEnvConfig(true);
      } else {
        setBootStage(3);
        setTimeout(() => onSystemReady?.(), 200);
      }
    } else {
      setError('Failed to create password');
    }
  };

  // Handle password verification
  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const success = await verifyPassword(password);
    setIsLoading(false);
    
    if (success) {
      setShowPasswordVerify(false);
      setPassword('');
      
      // Continue boot sequence - check config
      setBootStage(2);
      const { url, key } = getDatabaseConfig();
      if (!url || !key) {
        setNeedsEnvConfig(true);
        setShowEnvConfig(true);
      } else {
        setBootStage(3);
        setTimeout(() => onSystemReady?.(), 200);
      }
    } else {
      setError('Invalid password');
    }
  };

  // Handle environment config
  const handleSaveEnvConfig = (e) => {
    e.preventDefault();
    setError('');
    
    if (!envUrl.trim() || !envKey.trim()) {
      setError('Both URL and Key are required');
      return;
    }
    
    if (!envUrl.includes('supabase.co')) {
      setError('Invalid Supabase URL format');
      return;
    }
    
    saveDatabaseConfig(envUrl, envKey);
    setShowEnvConfig(false);
    setNeedsEnvConfig(false);
    setBootStage(3);
    setTimeout(() => onSystemReady?.(), 200);
  };

  // If system is ready and authenticated, render children
  if (isAuthenticated && !isChecking && bootStage === 3 && !showEnvConfig) {
    return children;
  }

  // Render bootloader overlay
  return (
    <div className="fixed inset-0 bg-black z-[1000] flex flex-col items-center justify-center font-mono overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6">
        
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-neonBlue/30 bg-black/50 mb-4">
            <Shield className="w-8 h-8 text-neonBlue" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-white uppercase">
            VANTAGE<span className="text-neonBlue">ONYX</span>
          </h1>
          <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] mt-1">
            ZENITH HORIZON COMMAND CENTER
          </p>
        </div>

        {/* Boot sequence display (when not showing forms) */}
        {!showPasswordSetup && !showPasswordVerify && !showEnvConfig && (
          <div className="border border-white/10 bg-black/60 backdrop-blur-sm p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Terminal className="w-4 h-4 text-neonBlue" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-400">System Boot Sequence</span>
            </div>
            
            {BOOT_STAGES.map((stage, index) => (
              <div 
                key={stage.id}
                className={`flex items-center gap-3 text-[10px] uppercase tracking-wider transition-all duration-300 ${
                  index < bootStage ? 'text-emerald-400' :
                  index === bootStage ? 'text-neonBlue' : 'text-zinc-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full transition-all ${
                  index < bootStage ? 'bg-emerald-400' :
                  index === bootStage ? 'bg-neonBlue animate-pulse' : 'bg-zinc-700'
                }`} />
                <span>{stage.label}</span>
                {index === bootStage && (
                  <Loader2 className="w-3 h-3 animate-spin ml-auto" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Password Setup Form */}
        {showPasswordSetup && (
          <div className="border border-white/10 bg-black/60 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Key className="w-4 h-4 text-neonBlue" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-400">Initialize Access Credentials</span>
            </div>
            
            <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
              Create a master password to secure your command center. This password will be required each session.
            </p>
            
            <form onSubmit={handleCreatePassword} className="space-y-4">
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-white/10 p-3 text-white text-sm focus:border-neonBlue focus:outline-none pr-10"
                    placeholder="Enter password (min 6 chars)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black border border-white/10 p-3 text-white text-sm focus:border-neonBlue focus:outline-none"
                  placeholder="Confirm password"
                  required
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-[10px] bg-red-950/20 border border-red-500/20 p-2">
                  <AlertTriangle size={12} />
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neonBlue text-black font-black uppercase py-3 text-[10px] tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ENCRYPTING...
                  </>
                ) : (
                  <>
                    <Lock size={12} />
                    INITIALIZE SECURE ACCESS
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Password Verification Form */}
        {showPasswordVerify && (
          <div className="border border-white/10 bg-black/60 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Lock className="w-4 h-4 text-neonBlue" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-400">Session Authentication Required</span>
            </div>
            
            <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
              Enter your master password to unlock the command center for this session.
            </p>
            
            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-white/10 p-3 text-white text-sm focus:border-neonBlue focus:outline-none pr-10"
                    placeholder="Enter your password"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-[10px] bg-red-950/20 border border-red-500/20 p-2">
                  <AlertTriangle size={12} />
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neonBlue text-black font-black uppercase py-3 text-[10px] tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    VERIFYING...
                  </>
                ) : (
                  <>
                    <Shield size={12} />
                    AUTHENTICATE SESSION
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Environment Config Form */}
        {showEnvConfig && (
          <div className="border border-white/10 bg-black/60 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
              <Database className="w-4 h-4 text-neonBlue" />
              <span className="text-[10px] uppercase tracking-widest text-zinc-400">Database Configuration Required</span>
            </div>
            
            <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">
              No database connection detected. Enter your Supabase credentials to connect to your deployment.
            </p>
            
            <form onSubmit={handleSaveEnvConfig} className="space-y-4">
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  value={envUrl}
                  onChange={(e) => setEnvUrl(e.target.value)}
                  className="w-full bg-black border border-white/10 p-3 text-white text-sm focus:border-neonBlue focus:outline-none"
                  placeholder="https://your-project.supabase.co"
                  required
                />
              </div>
              
              <div>
                <label className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-1">
                  Anon Public Key
                </label>
                <input
                  type="password"
                  value={envKey}
                  onChange={(e) => setEnvKey(e.target.value)}
                  className="w-full bg-black border border-white/10 p-3 text-white text-sm focus:border-neonBlue focus:outline-none"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  required
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-[10px] bg-red-950/20 border border-red-500/20 p-2">
                  <AlertTriangle size={12} />
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-neonBlue text-black font-black uppercase py-3 text-[10px] tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Database size={12} />
                ESTABLISH CONNECTION
              </button>
            </form>
            
            <p className="text-[8px] text-zinc-600 mt-4 text-center">
              Credentials are encrypted and stored locally in your browser.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[8px] text-zinc-600 uppercase tracking-widest">
            Secure Zero-Trust Architecture v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
