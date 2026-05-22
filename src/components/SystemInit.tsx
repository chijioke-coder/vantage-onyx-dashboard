// src/components/SystemInit.tsx
import { useState, useEffect } from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
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
    if (localStorage.getItem(MASTER_PASSWORD_KEY)) {
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
    if (password.length < 6) return toast.error("Must be at least 6 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    setIsProcessing(true);
    localStorage.setItem(MASTER_PASSWORD_KEY, hashPassword(password));

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
        toast.error("Invalid Sequence");
        setEnteredPassword('');
      }
      setIsProcessing(false);
    }, 700);
  };

  const resetMasterPassword = () => {
    localStorage.removeItem(MASTER_PASSWORD_KEY);
    setStage('setup');
    setShowResetConfirm(false);
    toast.success("Reset Complete");
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center min-h-screen p-4 z-[100] overflow-auto">
      <div className="w-full max-w-md border border-zinc-700 bg-black p-8 sm:p-10 rounded-2xl">
        <div className="flex justify-center mb-8">
          <Shield className="text-cyan-400" size={64} />
        </div>

        <h1 className="text-4xl font-black text-center text-white tracking-tighter mb-1">VANTAGE ONYX</h1>
        <p className="text-cyan-400 text-center text-sm mb-10">
          {stage === 'setup' ? 'INITIAL MASTER SEQUENCE SETUP' : 'ENTER MASTER SEQUENCE TO CONTINUE'}
        </p>

        <div className="space-y-6">
          {stage === 'setup' ? (
            <>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">CREATE MASTER SEQUENCE</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 text-white focus:border-cyan-400 outline-none rounded-xl"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-2">CONFIRM MASTER SEQUENCE</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSetup()}
                    className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 text-white focus:border-cyan-400 outline-none rounded-xl"
                    placeholder="Re-enter sequence"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-zinc-500" size={20} />
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-zinc-900 border border-zinc-700 pl-12 py-4 text-white focus:border-cyan-400 outline-none rounded-xl"
                placeholder="ENTER MASTER SEQUENCE"
              />
            </div>
          )}

          <button
            onClick={stage === 'setup' ? handleSetup : handleLogin}
            disabled={isProcessing || (stage === 'setup' ? (!password || !confirmPassword) : !enteredPassword)}
            className="w-full py-4 bg-white hover:bg-cyan-400 text-black font-bold disabled:opacity-50 rounded-xl uppercase tracking-widest text-sm transition-all"
          >
            {isProcessing 
              ? "PROCESSING..." 
              : stage === 'setup' 
                ? "SAVE & INITIALIZE COMMAND CENTER" 
                : "INITIALIZE COMMAND CENTER"}
          </button>

          {stage === 'login' && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-zinc-500 hover:text-red-400 block mx-auto"
            >
              Forgot Master Sequence?
            </button>
          )}
        </div>

        <p className="text-center text-[10px] text-zinc-600 mt-10">
          HIGH-SECURITY BOOTLOADER • V2.1 • Sellable Kit
        </p>
      </div>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500 p-6 rounded-2xl max-w-xs w-full text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
            <p className="mb-6">Reset Master Sequence?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 border border-zinc-700 rounded-xl">Cancel</button>
              <button onClick={resetMasterPassword} className="flex-1 py-3 bg-red-600 text-white rounded-xl">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}