// src/components/SystemInit.tsx
import { useState, useEffect } from 'react';
import { Shield, Lock, Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemInitProps {
  onInitialized: () => void;
}

export default function SystemInit({ onInitialized }: SystemInitProps) {
  const [stage, setStage] = useState<'setup' | 'login'>('setup');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSetupWarning, setShowSetupWarning] = useState(false);

  const MASTER_PASSWORD_KEY = 'vantage_onyx_master_hash';

  // Check if master password is already set
  useEffect(() => {
    const savedHash = localStorage.getItem(MASTER_PASSWORD_KEY);
    if (savedHash) {
      setStage('login');
    } else {
      setStage('setup');
    }
  }, []);

  const hashPassword = (pass: string): string => {
    // Simple but effective client-side hashing for demo/sellable kit
    let hash = 0;
    for (let i = 0; i < pass.length; i++) {
      const char = pass.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  const handleSetup = () => {
    if (!password || password.length < 6) {
      toast.error("Master sequence must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsProcessing(true);
    const hashed = hashPassword(password);
    localStorage.setItem(MASTER_PASSWORD_KEY, hashed);
    
    setTimeout(() => {
      toast.success("Master Sequence Successfully Configured");
      setStage('login');
      setPassword('');
      setConfirmPassword('');
      setIsProcessing(false);
    }, 600);
  };

  const handleLogin = () => {
    setIsProcessing(true);
    const savedHash = localStorage.getItem(MASTER_PASSWORD_KEY);
    
    setTimeout(() => {
      if (savedHash && hashPassword(enteredPassword) === savedHash) {
        toast.success("ZERO-TRUST BOOT SEQUENCE COMPLETE");
        onInitialized();
      } else {
        toast.error("ACCESS DENIED — INVALID MASTER SEQUENCE");
        setEnteredPassword('');
      }
      setIsProcessing(false);
    }, 700);
  };

  // First Time Setup Screen
  if (stage === 'setup') {
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

          <h2 className="text-center text-white text-2xl mb-2">INITIAL SETUP</h2>
          <p className="text-center text-zinc-400 mb-8">Create your Master Access Sequence</p>

          <div className="space-y-5">
            <div>
              <label className="block text-xs text-zinc-500 mb-2">NEW MASTER SEQUENCE</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 text-white focus:border-cyan-500 outline-none text-lg"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-2">CONFIRM MASTER SEQUENCE</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSetup()}
                  className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 text-white focus:border-cyan-500 outline-none text-lg"
                  placeholder="Re-enter sequence"
                />
              </div>
            </div>

            <button
              onClick={handleSetup}
              disabled={isProcessing || !password || !confirmPassword}
              className="w-full py-4 bg-white text-black font-bold hover:bg-cyan-400 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? "SECURING..." : "SAVE & INITIALIZE"}
            </button>
          </div>

          <p className="text-center text-[10px] text-zinc-600 mt-8">
            HIGH-SECURITY BOOTLOADER • V2.1 • Sellable Kit
          </p>
        </div>
      </div>
    );
  }

  // Login Screen
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

        <h2 className="text-center text-white text-xl mb-8">ENTER MASTER SEQUENCE</h2>

        <div className="space-y-6">
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 text-white focus:border-cyan-500 outline-none text-lg"
                placeholder="ENTER MASTER SEQUENCE"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isProcessing || !enteredPassword}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all disabled:opacity-50"
          >
            {isProcessing ? "VERIFYING..." : "INITIALIZE COMMAND CENTER"}
          </button>
        </div>

        <p className="text-center text-[10px] text-zinc-600 mt-8">
          HIGH-SECURITY BOOTLOADER • V2.1
        </p>
      </div>
    </div>
  );
}