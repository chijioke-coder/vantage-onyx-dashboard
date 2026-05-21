/**
 * CommandBar - CLI Input Bar for Power Users
 * Fixed at bottom, supports commands like > sync, > clear-cache, > status
 */

import React, { useState, useRef, useEffect } from 'react';
import { Terminal, ChevronRight, X } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * @typedef {object} CommandBarProps
 * @property {boolean} isOpen - Whether the command bar is visible
 * @property {(open: boolean) => void} setIsOpen - Toggle visibility
 * @property {(input: string) => { success: boolean, command?: string, error?: string }} executeCommand - Execute a command
 * @property {(direction: 'up' | 'down') => string | null} navigateHistory - Navigate command history
 * @property {string[]} availableCommands - List of available commands for hints
 * @property {(message: string) => void} [onOutput] - Callback for command output display
 */

export default function CommandBar({
  isOpen,
  setIsOpen,
  executeCommand,
  navigateHistory,
  availableCommands = [],
  onOutput
}) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Filter suggestions based on input
  const suggestions = availableCommands.filter(cmd => 
    cmd.toLowerCase().startsWith(input.replace('> ', '').toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const result = executeCommand(input);
    
    const newOutput = {
      input: input.startsWith('>') ? input : `> ${input}`,
      success: result.success,
      message: result.success 
        ? `Command "${result.command}" executed successfully`
        : result.error
    };
    
    setOutput(prev => [...prev.slice(-4), newOutput]); // Keep last 5 outputs
    setInput('');
    setShowSuggestions(false);
    
    if (onOutput) {
      onOutput(newOutput.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = navigateHistory('up');
      if (prev !== null) setInput(prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = navigateHistory('down');
      if (next !== null) setInput(next);
    } else if (e.key === 'Tab' && suggestions.length > 0) {
      e.preventDefault();
      setInput(`> ${suggestions[0]}`);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setShowSuggestions(value.length > 0 && suggestions.length > 0);
  };

  if (!isOpen) {
    // Show minimized command bar hint
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[300] flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur-sm border border-white/10 text-zinc-500 hover:text-white hover:border-neonBlue/30 transition-all font-mono text-[9px] uppercase tracking-wider"
      >
        <Terminal size={12} />
        <span>CMD</span>
        <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-white/10 text-[8px]">
          Ctrl+K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[300] border-t border-white/10 bg-black/95 backdrop-blur-xl">
      {/* Output history */}
      {output.length > 0 && (
        <div className="max-h-32 overflow-y-auto p-3 space-y-1 border-b border-white/5">
          {output.map((item, index) => (
            <div key={index} className="font-mono text-[10px]">
              <div className="text-zinc-500">{item.input}</div>
              <div className={clsx(
                item.success ? 'text-emerald-400' : 'text-red-400'
              )}>
                {item.success ? '-> ' : '!! '}{item.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Command suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
          <span className="text-[9px] text-zinc-500 uppercase font-mono">Suggestions:</span>
          {suggestions.slice(0, 4).map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setInput(`> ${cmd}`);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
              className="px-2 py-0.5 bg-zinc-900 border border-white/10 text-[9px] text-neonBlue font-mono hover:border-neonBlue/30 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 text-neonBlue">
          <Terminal size={14} />
          <ChevronRight size={12} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter command (type 'help' for available commands)..."
          className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder:text-zinc-600"
          spellCheck={false}
          autoComplete="off"
        />
        
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-zinc-900 border border-white/10 text-[8px] text-zinc-500 font-mono">
            Enter
          </kbd>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      </form>

      {/* Help hint */}
      <div className="px-4 py-1.5 bg-zinc-950/50 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-zinc-600">
        <span>Available: {availableCommands.join(' | ')}</span>
        <span>Use Tab to autocomplete, Up/Down for history</span>
      </div>
    </div>
  );
}
