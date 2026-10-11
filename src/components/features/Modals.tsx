import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Plus, Image as ImageIcon, FileCode, Layout, History, CheckCircle2, Clock, AlertCircle, ShoppingBag, Users, LayoutDashboard, Bot, Palette, Dumbbell, Loader2 } from 'lucide-react';
import { ProjectTemplates } from './ProjectTemplates';
import { useNexusStore } from '../../core/store';
import { cn } from '../../lib/utils';

const ICON_MAP: Record<string, any> = {
  ShoppingBag,
  Users,
  LayoutDashboard,
  Bot,
  Palette,
  Dumbbell,
  Layout,
  FileCode,
  ImageIcon
};

type LocalAsset = { id: string; file: File; url: string };

export const AssetManager: React.FC = () => {
  const { showAssetManager, setShowAssetManager, addLog } = useNexusStore();
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const assetsRef = useRef<LocalAsset[]>([]);

  useEffect(() => { assetsRef.current = assets; }, [assets]);
  useEffect(() => () => assetsRef.current.forEach(asset => URL.revokeObjectURL(asset.url)), []);

  if (!showAssetManager) return null;

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList).filter(file =>
      file.type.startsWith('image/') || /\.(svg|json)$/i.test(file.name)
    );
    const rejected = fileList.length - incoming.length;
    const next = incoming.map(file => ({ id: `${file.name}-${file.size}-${file.lastModified}`, file, url: URL.createObjectURL(file) }));
    setAssets(current => [...current, ...next].slice(-24));
    if (incoming.length) addLog(`Asset Manager: loaded ${incoming.length} local file(s) for this session.`);
    if (rejected) addLog(`Asset Manager: skipped ${rejected} unsupported file(s).`);
  };

  const selected = assets.find(asset => asset.id === selectedId) || null;

  return (
    <Modal title="Asset Manager" onClose={() => setShowAssetManager(false)}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 border border-default bg-raised p-4">
          <div className="w-10 h-10 border border-accent/20 bg-accent/10 flex items-center justify-center">
            <Plus size={20} className="text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-text-primary">Local assets</h4>
            <p className="text-xs text-text-muted">Images, SVGs, and JSON. Files stay in this browser session.</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*,.svg,.json" multiple className="hidden" onChange={event => { addFiles(event.currentTarget.files); event.currentTarget.value = ''; }} />
          <button type="button" onClick={() => inputRef.current?.click()} className="px-3 py-2 border border-accent/30 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest hover:bg-accent/20">Browse files</button>
        </div>

        {assets.length === 0 ? (
          <div className="border border-dashed border-default p-8 text-center">
            <ImageIcon size={24} className="mx-auto mb-3 text-text-muted" />
            <p className="text-sm font-medium text-text-primary">No assets loaded</p>
            <p className="mt-1 text-xs text-text-muted">Choose real files to preview them here. No placeholder stock images.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[36vh] overflow-y-auto">
            {assets.map(asset => (
              <button key={asset.id} type="button" onClick={() => setSelectedId(asset.id)} aria-pressed={selectedId === asset.id} className={cn("min-w-0 border text-left transition-colors", selectedId === asset.id ? "border-accent bg-accent/10" : "border-default bg-raised hover:border-accent/40")}>
                <div className="aspect-square bg-black/20 flex items-center justify-center overflow-hidden">
                  {asset.file.type.startsWith('image/') ? <img src={asset.url} alt={asset.file.name} className="h-full w-full object-contain" /> : <FileCode size={28} className="text-text-muted" />}
                </div>
                <span className="block truncate p-2 text-[10px] font-medium text-text-primary">{asset.file.name}</span>
                <span className="block px-2 pb-2 text-[9px] text-text-muted">{Math.max(1, Math.round(asset.file.size / 1024))} KB</span>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="flex flex-wrap items-center gap-3 border border-default p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-text-primary">{selected.file.name}</p>
              <p className="text-[10px] text-text-muted">Selected for preview or download</p>
            </div>
            <a href={selected.url} download={selected.file.name} className="px-3 py-2 border border-default bg-raised text-[10px] font-bold uppercase tracking-widest text-text-primary">Download</a>
            <button type="button" onClick={() => { URL.revokeObjectURL(selected.url); setAssets(current => current.filter(asset => asset.id !== selected.id)); setSelectedId(null); }} className="px-3 py-2 border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-widest">Remove</button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export const TemplateSearch: React.FC = () => {
  const { showTemplateSearch, setShowTemplateSearch } = useNexusStore();

  if (!showTemplateSearch) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-5xl bg-nexus-bg border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <ProjectTemplates />
      </motion.div>
    </motion.div>
  );
};

export const TaskModal: React.FC = () => {
  const { showTaskModal, setShowTaskModal, setPrompt, setActiveTab, addLog } = useNexusStore();
  const [taskName, setTaskName] = useState('');
  const [assignedAgents, setAssignedAgents] = useState<string[]>(['Architect']);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');

  if (!showTaskModal) return null;

  const toggleAgent = (agent: string) => setAssignedAgents(current =>
    current.includes(agent) ? current.filter(value => value !== agent) : [...current, agent]
  );

  const useAsPrompt = () => {
    const name = taskName.trim();
    if (!name) return;
    const prompt = `${name}\n\nOrchestration preferences: priority ${priority.toLowerCase()}; assigned agents: ${assignedAgents.join(', ') || 'auto-select'}.`;
    setPrompt(prompt);
    setActiveTab('design');
    addLog(`Task Composer: prepared build prompt "${name}" (priority: ${priority}; agents: ${assignedAgents.join(', ') || 'auto-select'}).`);
    setShowTaskModal(false);
  };

  return (
    <Modal title="Task Composer" onClose={() => setShowTaskModal(false)}>
      <form className="space-y-5" onSubmit={event => { event.preventDefault(); useAsPrompt(); }}>
        <div className="space-y-1.5">
          <label htmlFor="task-name" className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Task / app goal</label>
          <input id="task-name" required value={taskName} onChange={event => setTaskName(event.target.value)} maxLength={240} placeholder="e.g. Build a dashboard for deployment monitoring" className="w-full border border-default bg-raised px-3 py-3 text-sm text-text-primary focus:outline-none focus:border-accent" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Agent preferences</label>
          <div className="flex flex-wrap gap-2">
            {['Architect', 'Backend', 'DevOps'].map(agent => {
              const active = assignedAgents.includes(agent);
              return <button type="button" key={agent} aria-pressed={active} onClick={() => toggleAgent(agent)} className={cn("px-3 py-2 border text-[10px] font-bold uppercase tracking-widest transition-colors", active ? "border-accent/40 bg-accent/10 text-accent" : "border-default bg-raised text-text-muted")}>{agent}</button>;
            })}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Priority</label>
          <div className="grid grid-cols-4 gap-2">
            {(['Low', 'Medium', 'High', 'Critical'] as const).map(value => <button type="button" key={value} aria-pressed={priority === value} onClick={() => setPriority(value)} className={cn("px-2 py-2 border text-[9px] font-bold uppercase tracking-wide transition-colors", priority === value ? "border-accent/40 bg-accent/10 text-accent" : "border-default bg-raised text-text-muted")}>{value}</button>)}
          </div>
        </div>
        <p className="text-xs text-text-muted">This prepares a build prompt. It does not deploy anything automatically; review the prompt and start generation when ready.</p>
        <button type="submit" className="w-full border border-accent/30 bg-accent/10 px-4 py-3 text-accent text-[10px] font-black uppercase tracking-widest hover:bg-accent/20 transition-colors">Use as Build Prompt</button>
      </form>
    </Modal>
  );
};

export const HistoryModal: React.FC = () => {
  const { showHistory, setShowHistory, userProjects, loadProject, currentProjectId } = useNexusStore();
  
  if (!showHistory) return null;

  return (
    <Modal title="My Projects" onClose={() => setShowHistory(false)}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {userProjects.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <History size={32} className="text-white/20" />
            </div>
            <p className="text-xs text-white/40 uppercase font-bold tracking-widest">No projects found in your ecosystem.</p>
          </div>
        ) : (
          userProjects.map((project) => (
            <div 
              key={project.id} 
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-all group",
                currentProjectId === project.id 
                  ? "bg-nexus-accent/10 border-nexus-accent/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]" 
                  : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                currentProjectId === project.id ? "bg-nexus-accent/20 text-nexus-accent" : "bg-white/10 text-white/40"
              )}>
                <LayoutDashboard size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm truncate">{project.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-bold uppercase tracking-widest border border-white/5">
                    {project.framework}
                  </span>
                  <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">
                    {new Date(project.updatedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {currentProjectId === project.id ? (
                <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-nexus-accent">
                  <CheckCircle2 size={12} />
                  Active
                </div>
              ) : (
                <button 
                  onClick={() => {
                    loadProject(project.id);
                    setShowHistory(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-[10px] font-bold uppercase tracking-widest text-nexus-accent hover:bg-nexus-accent hover:text-nexus-accent-contrast transition-all opacity-0 group-hover:opacity-100"
                >
                  Load
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

const Modal: React.FC<{ title: string; children: React.ReactNode; onClose: () => void }> = ({ title, children, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative my-auto w-full max-w-lg max-h-[calc(100dvh-16px)] sm:max-h-[calc(100dvh-32px)] bg-nexus-bg border border-white/10 rounded-xl overflow-y-auto shadow-2xl"
    >
      <div className="sticky top-0 z-10 p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-nexus-bg/95">
        <h3 className="text-lg font-bold uppercase tracking-tight">{title}</h3>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-8">
        {children}
      </div>
    </motion.div>
  </motion.div>
);
