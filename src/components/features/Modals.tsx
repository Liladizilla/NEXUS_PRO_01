import React from 'react';
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

export const AssetManager: React.FC = () => {
  const { showAssetManager, setShowAssetManager } = useNexusStore();
  if (!showAssetManager) return null;

  return (
    <Modal title="Asset Manager" onClose={() => setShowAssetManager(false)}>
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-nexus-accent/20 flex items-center justify-center">
            <Plus size={24} className="text-nexus-accent" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Upload New Asset</h4>
            <p className="text-xs text-white/40">Images, SVGs, or JSON data files.</p>
          </div>
          <button className="ml-auto px-4 py-2 rounded-xl bg-nexus-accent text-nexus-accent-contrast text-[10px] font-bold uppercase tracking-widest">Browse</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/5 overflow-hidden group relative cursor-pointer">
              <img src={`https://picsum.photos/seed/asset${i}/200/200`} alt="Asset" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest">Select</span>
              </div>
            </div>
          ))}
        </div>
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
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
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
  const { showTaskModal, setShowTaskModal } = useNexusStore();
  if (!showTaskModal) return null;

  return (
    <Modal title="New Orchestration Task" onClose={() => setShowTaskModal(false)}>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Task Name</label>
            <input type="text" placeholder="e.g., Optimize Database Mesh" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nexus-accent/50 transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Agent Assignment</label>
            <div className="flex gap-2">
              {['Architect', 'Backend', 'DevOps'].map(a => (
                <button key={a} className="px-3 py-1.5 rounded-lg bg-nexus-accent/10 border border-nexus-accent/20 text-[10px] font-bold uppercase tracking-widest text-nexus-accent">{a}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Priority</label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High', 'Critical'].map(p => (
                <button key={p} className={cn(
                  "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-colors",
                  p === 'High' ? "bg-nexus-accent/20 border-nexus-accent text-nexus-accent" : "bg-white/5 border-white/10 text-white/40"
                )}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <button className="w-full py-4 rounded-2xl bg-nexus-accent text-nexus-accent-contrast font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.02] transition-transform">Deploy Task</button>
      </div>
    </Modal>
  );
};

export const HistoryModal: React.FC = () => {
  const { showHistory, setShowHistory } = useNexusStore();
  if (!showHistory) return null;

  return (
    <Modal title="Project History" onClose={() => setShowHistory(false)}>
      <div className="space-y-4">
        {[
          { time: '2 mins ago', action: 'Synthesis Completed', status: 'success', icon: CheckCircle2 },
          { time: '15 mins ago', action: 'Agent Mesh Optimized', status: 'success', icon: CheckCircle2 },
          { time: '1 hour ago', action: 'Build Failed: Dependency Conflict', status: 'error', icon: AlertCircle },
          { time: '3 hours ago', action: 'New Project Initialized', status: 'pending', icon: Clock },
        ].map((h, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              h.status === 'success' ? "bg-emerald-500/20 text-emerald-500" :
              h.status === 'error' ? "bg-rose-500/20 text-rose-500" : "bg-white/10 text-white/40"
            )}>
              <h.icon size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">{h.action}</h4>
              <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{h.time}</p>
            </div>
            <button className="ml-auto text-[10px] font-bold uppercase tracking-widest text-nexus-accent hover:underline">Restore</button>
          </div>
        ))}
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
      className="relative w-full max-w-lg bg-nexus-bg border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
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
