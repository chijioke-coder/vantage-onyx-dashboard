// src/components/SystemInit.tsx
import { useState, useEffect } from 'react';
import { Shield, Lock, Save, AlertTriangle, RefreshCw } from 'lucide-react';
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
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const MASTER_PASSWORD_KEY = 'vantage_onyx_master_hash';

  useEffect(() => {
    const savedHash = localStorage.getItem(MASTER_PASSWORD_KEY);
    if (savedHash) {
      setStage('login');
    }
  }, []);

  const hashPassword = (pass: string): string => {
    let hash = 0;
    for (let i = 0; i < pass.length; i++) {
      const char = pass.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  const handleSetup = () => {
    if (password.length < 6) {
      toast.error("Master Sequence must be at least 6 characters");
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
      toast.success("Master Sequence Secured Successfully");
      setStage('login');
      setPassword('');
      setConfirmPassword('');
      setIsProcessing(false);
    }, 700);
  };

  const handleLogin = () => {
    setIsProcessing(true);
    const savedHash = localStorage.getItem(MASTER_PASSWORD_KEY);

    setTimeout(() => {
      if (savedHash && hashPassword(enteredPassword) === savedHash) {
        toast.success("ZERO-TRUST BOOT SEQUENCE COMPLETE ✓");
        onInitialized();
      } else {
        toast.error("ACCESS DENIED — INVALID SEQUENCE");
        setEnteredPassword('');
      }
      setIsProcessing(false);
    }, 800);
  };

  const handleReset = () => {
    localStorage.removeItem(MASTER_PASSWORD_KEY);
    setStage('setup');
    setPassword('');
    setConfirmPassword('');
    setEnteredPassword('');
    setShowResetConfirm(false);
    toast.success("Master Sequence Reset. You can set a new one.");
  };

  // ================= SETUP SCREEN =================
  if (stage === 'setup') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-4 z-[100] font-mono">
        <div className="w-full max-w-md border border-zinc-700 bg-black p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <Shield className="text-cyan-400" size={56} />
          </div>

          <h1 className="text-center text-3xl font-black text-white tracking-tighter mb-1">VANTAGE ONYX</h1>
          <p className="text-center text-cyan-400 text-sm mb-8">ZENITH HORIZON — INITIAL SETUP</p>

          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Create Master Sequence</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 text-lg text-white focus:border-cyan-400 outline-none"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-500 mb-2">Confirm Master Sequence</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSetup()}
                  className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 text-lg text-white focus:border-cyan-400 outline-none"
                  placeholder="Re-enter sequence"
                />
              </div>
            </div>

            <button
              onClick={handleSetup}
              disabled={isProcessing || !password || !confirmPassword}
              className="w-full py-4 bg-white hover:bg-cyan-400 text-black font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {isProcessing ? "SECURING SYSTEM..." : "SAVE & INITIALIZE COMMAND CENTER"}
            </button>
          </div>

          <p className="text-center text-[10px] text-zinc-600 mt-10">
            HIGH-SECURITY BOOTLOADER • V2.1 • Sellable Kit
          </p>
        </div>
      </div>
    );
  }

  // ================= LOGIN SCREEN =================
  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-4 z-[100] font-mono">
      <div className="w-full max-w-md border border-zinc-700 bg-black p-8 sm:p-10">
        <div className="flex justify-center mb-8">
          <Shield className="text-cyan-400" size={56} />
        </div>

        <h1 className="text-center text-3xl font-black text-white tracking-tighter mb-1">VANTAGE ONYX</h1>
        <p className="text-center text-cyan-400 text-sm mb-8">ENTER MASTER SEQUENCE TO UNLOCK</p>

        <div className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 text-lg text-white focus:border-cyan-400 outline-none"
              placeholder="ENTER MASTER SEQUENCE"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isProcessing || !enteredPassword}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isProcessing ? "VERIFYING..." : "INITIALIZE COMMAND CENTER"}
          </button>

          <div className="text-center">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw size={12} /> Forgot Master Sequence?
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-zinc-600 mt-10">
          HIGH-SECURITY BOOTLOADER • V2.1 • Sellable Kit
        </p>
      </div>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4">
          <div className="bg-zinc-900 border border-red-500/50 p-6 max-w-xs w-full text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={32} />
            <p className="text-sm mb-6">This will permanently delete the current Master Sequence.<br />You will need to create a new one.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 border border-zinc-700 text-zinc-400">Cancel</button>
              <button onClick={handleReset} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white">Reset Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}