import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Shield, Bell, Zap, Globe, Cpu, Database, Palette, Keyboard, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useNexusStore } from '../../core/store';
import { cn } from '../../lib/utils';
import { UserProfile } from './UserProfile';
import { auth } from '../../core/firebase';
import { signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';

type SaveStatus = 'idle' | 'saving' | 'saved';

export const Settings: React.FC = () => {
  const { 
    showSettings, 
    setShowSettings, 
    user, 
    isPro, 
    isEnterprise, 
    deployTarget, 
    setDeployTarget,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    autonomousMode,
    setAutonomousMode,
    parallelSynthesis,
    setParallelSynthesis,
    notificationsEnabled,
    setNotificationsEnabled,
    projectName,
    setProjectName,
    projectDescription,
    setProjectDescription,
    projectFramework,
    setProjectFramework,
    projectLanguage,
    setProjectLanguage,
    agents,
    setAgentModel,
    usageCount,
    usageLimit
  } = useNexusStore();
  
  const [activeSection, setActiveSection] = useState('project');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Auto-save logic
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setSaveStatus('saving');
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    projectName, 
    projectDescription, 
    projectFramework, 
    projectLanguage, 
    theme, 
    accentColor, 
    autonomousMode, 
    parallelSynthesis, 
    notificationsEnabled, 
    deployTarget
  ]);

  const handleBlur = () => {
    if (saveStatus === 'saving') {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  if (!showSettings) return null;

  const handleDeleteProject = () => {
    useNexusStore.getState().reset();
    setShowSettings(false);
    setShowDeleteConfirm(false);
  };

  const sections = [
    { id: 'account', name: 'Account', icon: User },
    { id: 'project', name: 'Project', icon: Database },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'orchestration', name: 'Orchestration', icon: Cpu },
    { id: 'deployment', name: 'Deployment', icon: Globe },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'shortcuts', name: 'Shortcuts', icon: Keyboard },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <div className="relative w-full max-w-4xl h-[600px] bg-nexus-bg border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/5 bg-black/20 p-6 space-y-6">
          <div className="flex items-center gap-2 px-2">
            <SettingsIcon size={18} className="text-nexus-accent" />
            <span className="font-bold text-sm tracking-tight">Settings</span>
          </div>
          
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                  activeSection === section.id 
                    ? "bg-nexus-accent/10 text-nexus-accent border border-nexus-accent/20" 
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <section.icon size={16} />
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold capitalize">{activeSection}</h3>
              <AnimatePresence mode="wait">
                {saveStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <Loader2 size={10} className="text-nexus-accent animate-spin" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={10} className="text-emerald-400" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400">Changes Saved</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {activeSection === 'account' && (
              <div className="space-y-8">
                <UserProfile />
                
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40">AI Build Usage</h5>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      usageCount >= usageLimit ? "bg-rose-500/20 text-rose-500" : "bg-nexus-accent/10 text-nexus-accent"
                    )}>
                      {usageCount} / {usageLimit} Builds Used
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (usageCount / usageLimit) * 100)}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        usageCount >= usageLimit ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-nexus-accent shadow-[0_0_10px_var(--nexus-accent)]"
                      )}
                    />
                  </div>
                  <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">
                    {usageCount >= usageLimit 
                      ? "Plan limit reached. Upgrade to Odyseus Pro for unlimited builds." 
                      : `You have ${usageLimit - usageCount} builds remaining in your current cycle.`}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button 
                    onClick={() => signOut(auth)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'project' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold uppercase tracking-widest text-white/40">Project Configuration</h5>
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Manage your ecosystem's core identity</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 text-[8px] font-bold uppercase tracking-widest text-nexus-accent">
                    Active Environment
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Project Name</label>
                    <input 
                      type="text" 
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      onBlur={handleBlur}
                      placeholder="Enter project name..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nexus-accent/50 transition-all placeholder:text-white/10" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Description</label>
                    <textarea 
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      onBlur={handleBlur}
                      rows={3}
                      placeholder="Describe the purpose of this ecosystem..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nexus-accent/50 transition-all resize-none placeholder:text-white/10" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Framework Stack</label>
                      <select 
                        value={projectFramework}
                        onChange={(e) => setProjectFramework(e.target.value)}
                        onBlur={handleBlur}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nexus-accent/50 transition-all cursor-pointer"
                      >
                        <option>React + Vite</option>
                        <option>Next.js (App Router)</option>
                        <option>Vue + Vite</option>
                        <option>Angular</option>
                        <option>SvelteKit</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">Primary Language</label>
                      <select 
                        value={projectLanguage}
                        onChange={(e) => setProjectLanguage(e.target.value)}
                        onBlur={handleBlur}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-nexus-accent/50 transition-all cursor-pointer"
                      >
                        <option>TypeScript</option>
                        <option>JavaScript</option>
                        <option>Rust (WASM)</option>
                        <option>Python (PyScript)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ecosystem Metadata</h5>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <span className="block text-[8px] text-white/20 uppercase font-bold tracking-widest">Project ID</span>
                      <span className="text-[10px] font-mono text-white/60">OD-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[8px] text-white/20 uppercase font-bold tracking-widest">Created</span>
                      <span className="text-[10px] font-mono text-white/60">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-[8px] text-white/20 uppercase font-bold tracking-widest">Status</span>
                      <span className="text-[10px] font-mono text-emerald-400">SYNCHRONIZED</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-4 relative overflow-hidden">
                  <h4 className="font-bold text-sm text-rose-500 flex items-center gap-2">
                    <Shield size={14} />
                    Danger Zone
                  </h4>
                  <p className="text-xs text-white/40">Irreversible actions for this project ecosystem. Proceed with extreme caution.</p>
                  
                  {showDeleteConfirm ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="text-rose-500" size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Confirm Deletion?</span>
                      </div>
                      <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest">All files and configuration will be permanently purged.</p>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleDeleteProject}
                          className="px-4 py-2 rounded-lg bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all"
                        >
                          Purge Ecosystem
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/20 transition-all"
                      >
                        Delete Project
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Archive Ecosystem</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-white/40">Theme Selection</h5>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'dark', name: 'Deep Space', bg: 'bg-[#050505]' },
                      { id: 'light', name: 'Pure Light', bg: 'bg-white' },
                      { id: 'cyberpunk', name: 'Cyberpunk', bg: 'bg-[#0A0A1F]' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as any)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all text-left space-y-3",
                          theme === t.id 
                            ? "bg-nexus-accent/10 border-nexus-accent" 
                            : "bg-white/5 border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className={cn("w-full aspect-video rounded-lg border border-white/10", t.bg)} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme === t.id ? "text-nexus-accent" : "text-white/40")}>
                          {t.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-white/40">Accent Color</h5>
                  <div className="flex items-center gap-3 flex-wrap">
                    {['#00F0FF', '#FF00FF', '#00FF00', '#FFD700', '#FF4500', '#333333', '#1A1A1A', '#4F46E5'].map(color => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all",
                          accentColor === color ? "border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    {/* Custom Color Picker */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-white/30 transition-all group">
                      <input 
                        type="color" 
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        onBlur={handleBlur}
                        className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer bg-transparent border-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'orchestration' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">Autonomous Mode</h4>
                      <p className="text-xs text-white/40">Allow agents to make architectural decisions without confirmation.</p>
                    </div>
                    <button 
                      onClick={() => setAutonomousMode(!autonomousMode)}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors",
                        autonomousMode ? "bg-nexus-accent" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-4 h-4 bg-black rounded-full shadow-sm transition-all",
                        autonomousMode ? "right-0.5" : "left-0.5"
                      )} />
                    </button>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">Parallel Synthesis</h4>
                      <p className="text-xs text-white/40">Run frontend and backend agents simultaneously for 2x speed.</p>
                    </div>
                    <button 
                      onClick={() => setParallelSynthesis(!parallelSynthesis)}
                      className={cn(
                        "w-10 h-5 rounded-full relative transition-colors",
                        parallelSynthesis ? "bg-nexus-accent" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-4 h-4 bg-black rounded-full shadow-sm transition-all",
                        parallelSynthesis ? "right-0.5" : "left-0.5"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-widest text-white/40">Agent Configuration</h5>
                  <div className="space-y-2">
                    {agents.map(agent => (
                      <div key={agent.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{agent.name} Agent</span>
                          <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest">{agent.role}</span>
                        </div>
                      <select 
                          value={agent.model}
                          onChange={(e) => setAgentModel(agent.id, e.target.value)}
                          onBlur={handleBlur}
                          className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-nexus-accent focus:outline-none cursor-pointer"
                        >
                          <option value="GPT-4o">GPT-4o</option>
                          <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                          <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                          <option value="Llama 3.1 405B">Llama 3.1 405B</option>
                          <option value="DeepSeek V3">DeepSeek V3</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'deployment' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'railway', name: 'Railway', icon: Zap },
                    { id: 'aws-s3', name: 'AWS S3', icon: Database },
                    { id: 'cloudflare-pages', name: 'Cloudflare', icon: Globe }
                  ].map(target => (
                    <button
                      key={target.id}
                      onClick={() => setDeployTarget(target.id as any)}
                      className={cn(
                        "p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                        deployTarget === target.id 
                          ? "bg-nexus-accent/10 border-nexus-accent text-nexus-accent" 
                          : "bg-white/5 border-white/5 text-white/40 hover:border-white/10"
                      )}
                    >
                      <target.icon size={24} />
                      <span className="text-xs font-bold uppercase tracking-widest">{target.name}</span>
                    </button>
                  ))}
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <h4 className="font-bold text-sm">Automatic Deployment</h4>
                  <p className="text-xs text-white/40">Automatically deploy to your chosen target after every successful build.</p>
                  <div className="flex items-center gap-4">
                    <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Configure Webhooks</button>
                    <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Manage API Keys</button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm">API Keys</h4>
                    <p className="text-xs text-white/40">Manage your personal access tokens for the Odyseus API.</p>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                    <code className="text-xs text-nexus-accent">od_live_••••••••••••••••</code>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">Revoke</button>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent text-[10px] font-bold uppercase tracking-widest hover:bg-nexus-accent/20 transition-all">
                    Generate New API Key
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm">Two-Factor Authentication</h4>
                      <p className="text-xs text-white/40">Add an extra layer of security to your account.</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">Enable</button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  {[
                    { id: 'builds', name: 'Build Status', desc: 'Get notified when a build succeeds or fails.' },
                    { id: 'agents', name: 'Agent Messages', desc: 'Receive updates when agents need your input.' },
                    { id: 'deploy', name: 'Deployment Alerts', desc: 'Notifications for successful cloud deployments.' }
                  ].map(n => (
                    <div key={n.id} className="flex items-center justify-between py-2">
                      <div>
                        <h4 className="font-bold text-sm">{n.name}</h4>
                        <p className="text-xs text-white/40">{n.desc}</p>
                      </div>
                      <button 
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-colors",
                          notificationsEnabled ? "bg-nexus-accent" : "bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-0.5 w-4 h-4 bg-black rounded-full shadow-sm transition-all",
                          notificationsEnabled ? "right-0.5" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'shortcuts' && (
              <div className="space-y-4">
                {[
                  { key: '⌘ + Enter', desc: 'Trigger Synthesis' },
                  { key: '⌘ + S', desc: 'Save Project' },
                  { key: '⌘ + B', desc: 'Toggle Sidebar' },
                  { key: '⌘ + .', desc: 'Stop Agents' },
                  { key: '⌘ + ,', desc: 'Open Settings' },
                  { key: '⌥ + 1', desc: 'Design Tab' },
                  { key: '⌥ + 2', desc: 'Code Tab' },
                  { key: '⌥ + 3', desc: 'Preview Tab' }
                ].map(s => (
                  <div key={s.key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs text-white/60">{s.desc}</span>
                    <kbd className="px-2 py-1 rounded bg-black/40 border border-white/10 text-[10px] font-mono text-nexus-accent">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SettingsIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
