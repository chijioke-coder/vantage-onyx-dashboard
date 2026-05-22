// src/components/SystemInit.tsx
import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemInitProps {
  onInitialized: () => void;
}

export default function SystemInit({ onInitialized }: SystemInitProps) {
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const MASTER_PASSWORD = "vantage-onyx-zenith"; // Change this in production

  const handleUnlock = () => {
    setIsUnlocking(true);
    
    setTimeout(() => {
      if (password === MASTER_PASSWORD) {
        toast.success("ZERO-TRUST BOOT SEQUENCE COMPLETE");
        onInitialized();
      } else {
        toast.error("ACCESS DENIED — INVALID SEQUENCE");
        setPassword('');
      }
      setIsUnlocking(false);
    }, 800);
  };

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      setShowSetup(true);
    }
  }, []);

  if (showSetup) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="max-w-md w-full p-8 border border-red-500/50 bg-zinc-950 rounded-none">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="text-red-500" size={32} />
            <h1 className="text-2xl font-bold text-white">ENVIRONMENT NOT INITIALIZED</h1>
          </div>
          <p className="text-zinc-400 mb-8">
            Please add <span className="font-mono text-amber-400">VITE_SUPABASE_URL</span> and 
            <span className="font-mono text-amber-400"> VITE_SUPABASE_ANON_KEY</span> in Vercel Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-[100] font-mono">
      <div className="w-full max-w-lg border border-zinc-700 p-10 bg-black">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <Shield className="text-cyan-400" size={48} />
            <div>
              <div className="text-cyan-400 text-3xl tracking-[4px]">VANTAGE</div>
              <div className="text-white/80 text-xl -mt-2">ONYX ZENITH</div>
            </div>
          </div>
        </div>

        <h2 className="text-center text-white text-xl mb-8">ZERO-TRUST INITIALIZATION</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-xs text-zinc-500 mb-2">AUTHENTICATION SEQUENCE</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 text-white focus:border-cyan-500 outline-none text-lg"
                placeholder="ENTER MASTER SEQUENCE"
              />
            </div>
          </div>

          <button
            onClick={handleUnlock}
            disabled={isUnlocking || !password}
            className="w-full py-4 bg-white text-black font-bold hover:bg-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isUnlocking ? "VERIFYING..." : "INITIALIZE COMMAND CENTER"}
          </button>
        </div>

        <p className="text-center text-[10px] text-zinc-600 mt-8">
          HIGH-SECURITY BOOTLOADER • V2.1
        </p>
      </div>
    </div>
  );
}