import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, StepForward, ArrowDownLeft, ArrowUpRight, Square, Circle, Bug, Terminal, List, Variable, ChevronRight, AlertCircle } from 'lucide-react';
import { useNexusStore } from '../../core/store';
import { cn } from '../../lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const Debugger: React.FC = () => {
  const { 
    activeFile, 
    files, 
    debugState, 
    toggleBreakpoint, 
    stepOver, 
    stepInto,
    stepOut,
    resume, 
    setDebugActive,
    evaluateExpression
  } = useNexusStore();

  const [consoleInput, setConsoleInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const COMMON_COMMANDS = [
    'help', 'clear', 'status', 'mesh', 'agents', 'build', 'deploy', 'lint', 'format', 'reset'
  ];

  const currentFile = files.find(f => f.path === activeFile) || files[0];
  const code = currentFile?.content || '// No file selected';

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debugState.logs]);

  useEffect(() => {
    if (consoleInput.trim()) {
      const lastWord = consoleInput.split(' ').pop() || '';
      if (lastWord.length > 0) {
        const allOptions = [...COMMON_COMMANDS, ...Object.keys(debugState.variables)];
        const filtered = allOptions.filter(opt => 
          opt.toLowerCase().startsWith(lastWord.toLowerCase()) && opt !== lastWord
        );
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
    setSuggestionIndex(-1);
  }, [consoleInput, debugState.variables]);

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (consoleInput.trim()) {
      evaluateExpression(consoleInput);
      setConsoleInput('');
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        if (suggestionIndex >= 0) {
          e.preventDefault();
          applySuggestion(suggestions[suggestionIndex]);
        } else if (e.key === 'Tab') {
          e.preventDefault();
          applySuggestion(suggestions[0]);
        }
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      }
    }
  };

  const applySuggestion = (suggestion: string) => {
    const words = consoleInput.split(' ');
    words[words.length - 1] = suggestion;
    setConsoleInput(words.join(' ') + ' ');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full bg-nexus-bg overflow-hidden">
      {/* Code View */}
      <div className="flex-1 flex flex-col border-r border-nexus-border">
        {/* Toolbar */}
        <div className="h-12 border-b border-nexus-border flex items-center justify-between px-4 bg-white/5">
          <div className="flex items-center gap-2">
            <Bug size={16} className="text-nexus-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Debugger: {currentFile?.path}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
            <button 
              onClick={resume}
              className="p-1.5 hover:bg-white/10 rounded text-emerald-400 transition-colors"
              title="Resume (F5)"
            >
              <Play size={14} fill="currentColor" />
            </button>
            <button 
              onClick={stepOver}
              className="p-1.5 hover:bg-white/10 rounded text-nexus-accent transition-colors"
              title="Step Over (F10)"
            >
              <StepForward size={14} />
            </button>
            <button 
              onClick={stepInto}
              className="p-1.5 hover:bg-white/10 rounded text-sky-400 transition-colors"
              title="Step Into (F11)"
            >
              <ArrowDownLeft size={14} />
            </button>
            <button 
              onClick={stepOut}
              className="p-1.5 hover:bg-white/10 rounded text-purple-400 transition-colors"
              title="Step Out (Shift+F11)"
            >
              <ArrowUpRight size={14} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button 
              onClick={() => setDebugActive(false)}
              className="p-1.5 hover:bg-white/10 rounded text-rose-500 transition-colors"
              title="Stop"
            >
              <Square size={14} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative overflow-auto custom-scrollbar">
          <div className="absolute inset-0 flex">
            {/* Gutter */}
            <div className="w-12 bg-black/20 border-r border-white/5 flex flex-col items-center py-4 select-none">
              {code.split('\n').map((_, i) => (
                <div 
                  key={i} 
                  className="h-[21px] w-full flex items-center justify-center group cursor-pointer"
                  onClick={() => toggleBreakpoint(i + 1)}
                >
                  {debugState.breakpoints.includes(i + 1) ? (
                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  ) : (
                    <span className="text-[10px] text-white/10 group-hover:text-white/40 transition-colors">{i + 1}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Code */}
            <div className="flex-1 relative">
              <SyntaxHighlighter
                language="typescript"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  background: 'transparent',
                  fontSize: '12px',
                  lineHeight: '21px',
                }}
                showLineNumbers={false}
              >
                {code}
              </SyntaxHighlighter>

              {/* Execution Highlight */}
              {debugState.isActive && debugState.currentLine > 0 && (
                <motion.div 
                  initial={false}
                  animate={{ top: (debugState.currentLine - 1) * 21 + 16 }}
                  className="absolute left-0 right-0 h-[21px] bg-nexus-accent/20 border-y border-nexus-accent/30 pointer-events-none flex items-center"
                >
                  <ChevronRight size={14} className="text-nexus-accent -ml-1" />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Sidebar */}
      <div className="w-80 flex flex-col bg-black/20">
        {/* Variables */}
        <div className="flex-1 flex flex-col border-b border-nexus-border">
          <div className="h-10 px-4 border-b border-white/5 flex items-center gap-2 bg-white/5">
            <Variable size={14} className="text-nexus-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Variables</span>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2 custom-scrollbar">
            {Object.entries(debugState.variables).length === 0 ? (
              <p className="text-[10px] text-white/20 italic">No variables in scope</p>
            ) : (
              Object.entries(debugState.variables).map(([key, val]) => (
                <div key={key} className="flex flex-col text-[11px] font-mono py-1 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400">{key}:</span>
                    <span className="text-emerald-400">{typeof val === 'object' ? '{...}' : JSON.stringify(val)}</span>
                  </div>
                  {typeof val === 'object' && val !== null && (
                    <div className="pl-4 mt-1 space-y-1 opacity-60">
                      {Object.entries(val).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span>{k}:</span>
                          <span>{JSON.stringify(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Call Stack */}
        <div className="h-1/4 flex flex-col border-b border-nexus-border">
          <div className="h-10 px-4 border-b border-white/5 flex items-center gap-2 bg-white/5">
            <List size={14} className="text-nexus-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Call Stack</span>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-1 custom-scrollbar">
            {debugState.callStack.length === 0 ? (
              <p className="text-[11px] font-mono text-white/60 flex items-center gap-2">
                <span className="text-nexus-accent">λ</span>
                (global)
              </p>
            ) : (
              [...debugState.callStack].reverse().map((frame, i) => (
                <div key={i} className={cn(
                  "flex items-center justify-between text-[11px] font-mono p-1 rounded transition-colors",
                  i === 0 ? "text-nexus-accent bg-nexus-accent/10" : "text-white/60 hover:bg-white/5"
                )}>
                  <div className="flex items-center gap-2">
                    <span>λ</span>
                    <span>{frame.name}</span>
                  </div>
                  <span className="text-[9px] opacity-40">line {frame.line}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Debug Console */}
        <div className="h-1/3 flex flex-col">
          <div className="h-10 px-4 border-b border-white/5 flex items-center gap-2 bg-white/5">
            <Terminal size={14} className="text-nexus-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Debug Console</span>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-[10px] space-y-1 custom-scrollbar">
            {debugState.logs.map((log, i) => (
              <div key={i} className={cn(
                "flex gap-2",
                log.startsWith('Error:') ? "text-rose-400" : log.startsWith('>') ? "text-nexus-accent" : "text-white/40"
              )}>
                <span className="shrink-0">›</span>
                {log}
              </div>
            ))}
            {debugState.error && (
              <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded flex items-start gap-2 text-rose-400">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <span>{debugState.error}</span>
              </div>
            )}
            <div ref={consoleEndRef} />
          </div>
          
          <div className="relative">
            {suggestions.length > 0 && (
              <div className="absolute bottom-full left-0 right-0 bg-nexus-bg border-t border-white/5 p-1 shadow-2xl z-50">
                {suggestions.map((s, i) => (
                  <div 
                    key={s}
                    onClick={() => applySuggestion(s)}
                    onMouseEnter={() => setSuggestionIndex(i)}
                    className={cn(
                      "px-3 py-1.5 text-[10px] font-mono cursor-pointer rounded flex items-center justify-between",
                      i === suggestionIndex ? "bg-nexus-accent text-nexus-accent-contrast" : "text-white/60 hover:bg-white/5"
                    )}
                  >
                    <span>{s}</span>
                    <span className="opacity-40 text-[8px] uppercase">{COMMON_COMMANDS.includes(s) ? 'command' : 'variable'}</span>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleConsoleSubmit} className="p-2 border-t border-white/5 bg-black/40">
              <div className="flex items-center gap-2 text-white/40">
                <span className="text-[10px]">›</span>
                <input 
                  ref={inputRef}
                  type="text" 
                  value={consoleInput}
                  onChange={(e) => setConsoleInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Evaluate expression..." 
                  className="bg-transparent border-none focus:ring-0 w-full p-0 text-[10px] font-mono"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
