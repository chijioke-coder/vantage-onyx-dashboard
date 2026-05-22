// src/components/SystemInit.tsx
import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
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

  const hashPassword = (pass) => {
    let hash = 0;
    for (let i = 0; i < pass.length; i++) {
      const char = pass.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  const handleSetup = () => {
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    setIsProcessing(true);
    const hashed = hashPassword(password);
    localStorage.setItem(MASTER_PASSWORD_KEY, hashed);

    setTimeout(() => {
      toast.success("Master Sequence Saved");
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
        toast.success("Access Granted");
        onInitialized();
      } else {
        toast.error("Invalid Master Sequence");
        setEnteredPassword('');
      }
      setIsProcessing(false);
    }, 700);
  };

  const resetMasterPassword = () => {
    localStorage.removeItem(MASTER_PASSWORD_KEY);
    setStage('setup');
    setShowResetConfirm(false);
    toast.success("Master Sequence Reset");
  };

  // Setup Screen
  if (stage === 'setup') {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-4 z-[100]">
        <div className="w-full max-w-md border border-zinc-700 bg-black p-8">
          <div className="flex justify-center mb-6">
            <Shield className="text-cyan-400" size={60} />
          </div>
          <h1 className="text-3xl font-black text-center text-white mb-1">VANTAGE ONYX</h1>
          <p className="text-cyan-400 text-center mb-8">INITIAL MASTER SEQUENCE SETUP</p>

          <div className="space-y-5">
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">CREATE MASTER SEQUENCE</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-zinc-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 pl-11 py-3.5 text-white focus:border-cyan-400"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1.5">CONFIRM MASTER SEQUENCE</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-zinc-500" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSetup()}
                  className="w-full bg-zinc-900 border border-zinc-700 pl-11 py-3.5 text-white focus:border-cyan-400"
                  placeholder="Re-enter sequence"
                />
              </div>
            </div>

            <button
              onClick={handleSetup}
              disabled={isProcessing || !password || !confirmPassword}
              className="w-full py-4 bg-white text-black font-bold hover:bg-cyan-400 disabled:opacity-50"
            >
              {isProcessing ? "SAVING..." : "SAVE & INITIALIZE COMMAND CENTER"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-4 z-[100]">
      <div className="w-full max-w-md border border-zinc-700 bg-black p-8">
        <div className="flex justify-center mb-6">
          <Shield className="text-cyan-400" size={60} />
        </div>
        <h1 className="text-3xl font-black text-center text-white mb-1">VANTAGE ONYX</h1>
        <p className="text-cyan-400 text-center mb-8">ENTER MASTER SEQUENCE</p>

        <div className="space-y-5">
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-zinc-500" size={18} />
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-zinc-900 border border-zinc-700 pl-11 py-3.5 text-white focus:border-cyan-400"
              placeholder="ENTER MASTER SEQUENCE"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isProcessing || !enteredPassword}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-50"
          >
            {isProcessing ? "VERIFYING..." : "INITIALIZE COMMAND CENTER"}
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-zinc-500 hover:text-red-400 mx-auto block"
          >
            Forgot Master Sequence?
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500 p-6 max-w-xs w-full text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={36} />
            <p className="mb-6">Reset Master Sequence?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 border">Cancel</button>
              <button onClick={resetMasterPassword} className="flex-1 py-3 bg-red-600 text-white">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}