import React, { useEffect, useRef } from 'react';
import { X, Terminal } from 'lucide-react';

export default function CommandModal({ isOpen, onClose }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-20">
      <div className="w-full max-w-2xl bg-[#0A0A0A] border border-neonBlue rounded-2xl p-6 shadow-[0_0_50px_rgba(0,229,255,0.15)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2 text-neonBlue">
            <Terminal size={16} />
            <span className="text-[10px] font-black tracking-widest uppercase">VANTAGE COMMAND SYSTEMS</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <input 
          ref={inputRef}
          type="text" 
          placeholder="ENTER OPERATIONAL COMMAND CODE..." 
          className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs font-mono tracking-widest text-neonBlue placeholder:text-gray-700 outline-none focus:border-neonBlue"
        />
        <div className="mt-4 flex flex-wrap gap-2 text-[8px] font-mono text-gray-500 uppercase">
          <span className="border border-white/5 px-2 py-1 rounded bg-white/5">/deploy-node</span>
          <span className="border border-white/5 px-2 py-1 rounded bg-white/5">/scan-radar</span>
          <span className="border border-white/5 px-2 py-1 rounded bg-white/5">/purge-sold</span>
        </div>
      </div>
    </div>
  );
}
