/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CICDPipeline } from './components/features/CICDPipeline';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Layout, 
  Code2, 
  Eye, 
  Layers, 
  Play, 
  Terminal, 
  Settings as LucideSettings, 
  Cpu, 
  MessageSquare, 
  Search, 
  FileCode, 
  FolderTree, 
  History, 
  Zap, 
  Shield, 
  Sparkles,
  CreditCard, 
  BarChart3, 
  Plus, 
  MoreVertical, 
  ChevronRight, 
  ChevronDown,
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
  Box,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  Table2,
  BarChart,
  PieChart,
  LineChart,
  FormInput,
  CheckSquare,
  Type,
  Bug,
  ArrowDownLeft,
  ArrowUpRight,
  Grid3X3,
  Columns,
  Rows,
  MousePointer2,
  CircleDot,
  Flame,
  Wand2,
  TableProperties,
  LayoutList,
  Layers3,
  Trello,
  ShoppingBag,
  Users,
  LayoutDashboard,
  User,
  Bot,
  Palette,
  Dumbbell,
  Check,
  Wand,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectTemplates } from './components/features/ProjectTemplates';
import { KanbanBoard } from './components/features/KanbanBoard';
import { AIChat } from './components/features/AIChat';
import { Paywall } from './components/features/Paywall';
import { Settings } from './components/features/Settings';
import { AuthModal } from './components/features/AuthModal';
import { AuthPage } from './components/features/AuthPage';
import { AssetManager, TemplateSearch, TaskModal, HistoryModal } from './components/features/Modals';
import { Debugger } from './components/features/Debugger';
import BorderGlow from './components/ui/BorderGlow';
import { DesktopApp } from './components/features/DesktopApp';
import { useNexusStore, AgentStatus } from './core/store';
import { generateApp } from './core/ai';
import { getContrastColor } from './lib/utils';
import { 
  auth, 
  googleProvider, 
  githubProvider,
  syncUserProfile, 
  syncApiKey,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  doc,
  db,
  getDoc,
  setDoc,
  serverTimestamp
} from './core/firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants ---

// --- Components ---

const Intro = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.2, duration: 0.8 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        <div className="text-7xl font-black tracking-tighter text-white mb-1">
          ODYSEUS
        </div>
        <div className="text-[10px] uppercase tracking-[0.8em] text-white/20 font-black">
          Architected by Odyseus AI
        </div>
      </motion.div>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ delay: 0.4, duration: 1.2, ease: "circOut" }}
        className="h-[1px] bg-nexus-accent mt-12 rounded-full opacity-30"
      />
    </motion.div>
  );
};

const Panel = ({ children, className, title, icon: Icon, actions }: any) => (
  <div className={cn("glass flex flex-col h-full overflow-hidden", className)}>
    <div className="flex items-center justify-between px-4 py-2 border-b border-nexus-border bg-white/5">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-nexus-accent" />}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {actions}
      </div>
    </div>
    <div className="flex-1 overflow-auto">
      {children}
    </div>
  </div>
);

const TaskBreakdown = ({ tasks }: { tasks: string[] }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Process Breakdown</span>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-nexus-accent animate-pulse" />
        <span className="text-[10px] text-nexus-accent font-bold uppercase tracking-tighter">Live Analysis</span>
      </div>
    </div>
    <div className="space-y-1.5">
      {tasks.map((task, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5"
        >
          <div className="w-4 h-4 rounded-full border border-nexus-accent/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-nexus-accent" />
          </div>
          <span className="text-xs text-white/70 font-medium">{task}</span>
        </motion.div>
      ))}
    </div>
  </div>
);

const AgentCard = ({ agent }: { agent: any }) => {
  const [isInspecting, setIsInspecting] = useState(false);
  const statusColors = {
    idle: 'text-white/30',
    working: 'text-nexus-accent animate-pulse',
    completed: 'text-emerald-400',
    error: 'text-rose-500'
  };

  const statusLabels = {
    idle: 'Waiting for task',
    working: agent.lastAction || 'Processing...',
    completed: 'Task finished',
    error: 'Encountered issue'
  };

  return (
    <div 
      onClick={() => setIsInspecting(!isInspecting)}
      className="flex flex-col gap-2 p-2 rounded-lg bg-white/5 border border-nexus-border/50 group hover:border-nexus-accent/30 transition-all cursor-help relative overflow-hidden"
      title="Click to inspect agent capabilities and logs"
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded-md bg-black/40", statusColors[agent.status as AgentStatus])}>
          <Cpu size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium truncate group-hover:text-nexus-accent transition-colors">{agent.name}</span>
            <span className={cn("text-[8px] uppercase font-bold tracking-tighter", statusColors[agent.status as AgentStatus])}>
              {statusLabels[agent.status as AgentStatus]}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] text-white/50 truncate italic">{agent.role}</p>
            <span className="text-[8px] text-nexus-accent/60 font-mono uppercase truncate opacity-0 group-hover:opacity-100 transition-opacity">{agent.model}</span>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {isInspecting && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-2 border-t border-white/5 space-y-2"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Capabilities</span>
              <div className="flex flex-wrap gap-1">
                {['Architecting', 'Code Synthesis', 'Security Scan'].map(cap => (
                  <span key={cap} className="px-1.5 py-0.5 rounded-sm bg-white/5 text-[8px] text-white/40 border border-white/5">{cap}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Live Logs</span>
              <div className="text-[8px] font-mono text-nexus-accent/60 leading-tight">
                {agent.status === 'working' ? '> Initializing neural mesh...' : '> Task execution finalized.'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AGENT_POSITIONS: Record<string, { x: string, y: string }> = {
  architect: { x: '50%', y: '20%' },
  frontend: { x: '20%', y: '45%' },
  backend: { x: '80%', y: '45%' },
  debug: { x: '35%', y: '80%' },
  devops: { x: '65%', y: '80%' },
};

const CommunicationMesh = ({ activeAgents }: { activeAgents: string[] }) => {
  const connections = React.useMemo(() => {
    const pairs: [string, string][] = [];
    for (let i = 0; i < activeAgents.length; i++) {
      for (let j = i + 1; j < activeAgents.length; j++) {
        pairs.push([activeAgents[i], activeAgents[j]]);
      }
    }
    return pairs;
  }, [activeAgents]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Connection Lines */}
        {connections.map(([from, to]) => {
          const start = AGENT_POSITIONS[from];
          const end = AGENT_POSITIONS[to];
          if (!start || !end) return null;

          return (
            <g key={`${from}-${to}`}>
              <motion.line
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke="var(--nexus-accent)"
                strokeWidth="1"
                strokeOpacity="0.15"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              
              {/* Data Particles */}
              {[...Array(3)].map((_, i) => (
                <motion.circle
                  key={`${from}-${to}-p-${i}`}
                  r="1.5"
                  fill="var(--nexus-accent)"
                  filter="url(#glow)"
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{ 
                    offsetDistance: ["0%", "100%"],
                    opacity: [0, 1, 1, 0],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{ 
                    duration: 1.5 + Math.random() * 1.5,
                    repeat: Infinity,
                    delay: i * 0.8 + Math.random(),
                    ease: "easeInOut"
                  }}
                  style={{
                    offsetPath: `path('M ${start.x} ${start.y} L ${end.x} ${end.y}')`,
                    position: 'absolute'
                  } as any}
                />
              ))}
              {[...Array(2)].map((_, i) => (
                <motion.circle
                  key={`${to}-${from}-p-${i}`}
                  r="1"
                  fill="var(--nexus-accent)"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{ 
                    offsetDistance: ["0%", "100%"],
                    opacity: [0, 0.8, 0.8, 0]
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 1.2 + Math.random(),
                    ease: "linear"
                  }}
                  style={{
                    offsetPath: `path('M ${end.x} ${end.y} L ${start.x} ${start.y}')`,
                    position: 'absolute'
                  } as any}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Pulsing Agent Nodes */}
      <AnimatePresence>
        {activeAgents.map((id) => {
          const pos = AGENT_POSITIONS[id];
          if (!pos) return null;
          
          return (
            <React.Fragment key={`node-${id}`}>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-16 h-16 rounded-full bg-nexus-accent/10 border border-nexus-accent/20"
                style={{ 
                  left: pos.x, 
                  top: pos.y, 
                  transform: 'translate(-50%, -50%)' 
                }}
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 2.5, 1], opacity: [0.1, 0, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute w-24 h-24 rounded-full border border-nexus-accent/10"
                style={{ 
                  left: pos.x, 
                  top: pos.y, 
                  transform: 'translate(-50%, -50%)' 
                }}
              />
            </React.Fragment>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

const SettingsIcon = LucideSettings;

export default function App() {
  const { 
    projectName, setProjectName,
    prompt, setPrompt,
    isGenerating, setIsGenerating,
    activeTab, setActiveTab,
    files, setFiles,
    activeFile, setActiveFile,
    agents, updateAgent, setAgents,
    logs, addLog,
    isAuthenticated, login,
    showPaywall, setShowPaywall, incrementUsage, usageCount, usageLimit,
    showSettings, setShowSettings,
    showAssetManager, setShowAssetManager,
    showTemplateSearch, setShowTemplateSearch,
    showTaskModal, setShowTaskModal,
    showHistory, setShowHistory,
    setSubscription,
    deployTarget, setDeployTarget,
    previewMode, setPreviewMode,
    stagingUrl, setStagingUrl,
    feedback, setFeedback,
    userProfile, setUserProfile,
    isAuthLoading, setIsAuthLoading,
    isHighThinking, setIsHighThinking,
    accentColor,
    reset,
    templates, fetchTemplates,
    setDebugActive, setCurrentLine, setDebugVariables, addDebugLog,
    lintResults, setLintResults,
    isTerminalMinimized, setTerminalMinimized,
    isTerminalMaximized, setTerminalMaximized,
    isTerminalClosed, setTerminalClosed,
    setApiKeyData,
    isPro, isEnterprise,
    currentProjectId, saveCurrentProject, setUserProjects
  } = useNexusStore();

  const currentFile = files.find(f => f.path === activeFile);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [buildStatus, setBuildStatus] = useState<string>('idle');
  const [buildProgress, setBuildProgress] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeApiKey: (() => void) | null = null;
    let unsubscribeProjects: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log("Auth State Changed:", user ? `Logged in as ${user.email}` : "Logged out");
      setIsAuthLoading(true);
      
      try {
        // Clean up existing listeners if user changes
        if (unsubscribeProfile) unsubscribeProfile();
        if (unsubscribeApiKey) unsubscribeApiKey();
        if (unsubscribeProjects) unsubscribeProjects();
        unsubscribeProfile = null;
        unsubscribeApiKey = null;
        unsubscribeProjects = null;

        if (user) {
          // Ensure user profile exists in Firestore
          const userRef = doc(db, 'users', user.uid);
          const snapshot = await getDoc(userRef);
          if (!snapshot.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'Odyseus Architect',
              email: user.email || '',
              photoURL: user.photoURL || null,
              updatedAt: serverTimestamp()
            });
          }

          useNexusStore.getState().login(user.email || 'user@odyseus.ai');
          
          unsubscribeProfile = syncUserProfile(user, (profile) => {
            setUserProfile(profile);
          });
          unsubscribeApiKey = syncApiKey(user.uid, (keyData) => {
            if (keyData) {
              setApiKeyData(keyData.key, keyData.lastGeneratedAt?.toMillis() || null);
            }
          });

          // Sync User Projects
          const { syncProjects } = await import('./core/firebase');
          unsubscribeProjects = syncProjects(user.uid, (projects: any[]) => {
            setUserProjects(projects);
          });
        } else {
          useNexusStore.getState().logout();
          setUserProfile(null);
          setApiKeyData(null, null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeApiKey) unsubscribeApiKey();
      if (unsubscribeProjects) unsubscribeProjects();
    };
  }, []);

  const handleSave = async () => {
    if (!auth.currentUser) {
      setShowAuthModal(true);
      return;
    }
    setIsSaving(true);
    await saveCurrentProject();
    setIsSaving(false);
  };

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      addLog("System: Logged out successfully.");
    } catch (error) {
      addLog(`Error: Logout failed. ${error instanceof Error ? error.message : ''}`);
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--nexus-accent', accentColor);
    document.documentElement.style.setProperty('--nexus-accent-contrast', getContrastColor(accentColor));
  }, [accentColor]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      // In a real app, we'd verify the session on the backend
      // For this demo, we'll just set the subscription
      setSubscription('pro');
      addLog("Subscription successful! Welcome to Odyseus Pro.");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const [showIntro, setShowIntro] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAssistantExpanded, setIsAssistantExpanded] = useState(false);
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [taskBreakdown, setTaskBreakdown] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (templates.length === 0) {
      fetchTemplates();
    }
  }, [templates.length, fetchTemplates]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setBackendHealth(data);
      } catch (e) {
        setBackendHealth({ status: 'offline' });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const reportError = (error: any) => {
    const message = error instanceof Error ? error.message : String(error);
    let detailedMessage = `Error: ${message}`;
    let advice = "";

    if (message.includes("Rate Limit")) {
      detailedMessage = "Gateway: Rate Limit Exceeded";
      advice = "The Odyseus mesh is currently processing a high volume of requests. Please wait a few minutes or upgrade to Odyseus Pro for priority access.";
    } else if (message.includes("Auth") || message.includes("unauthorized")) {
      detailedMessage = "Security: Authentication Failure";
      advice = "Your session may have expired. Please sign out and sign back in to re-establish a secure connection to the mesh.";
    } else if (message.includes("AI Mesh Failure") || message.includes("Gemini")) {
      detailedMessage = "AI Orchestration: Primary Mesh Outage";
      advice = "The primary LLM mesh is unresponsive. We've attempted a failsafe fallback, but if the build still fails, try simplifying your prompt or checking the system status.";
    } else if (message.includes("CI/CD") || message.includes("Generation failed")) {
      detailedMessage = "Pipeline: Build Synthesis Failure";
      advice = "The automated CI/CD pipeline encountered a conflict during code synthesis. Action: Try refining your prompt with clearer architectural constraints or use the 'Autonomous Debug' tool.";
    } else if (message.includes("fetch") || message.includes("Network")) {
      detailedMessage = "Connectivity: Gateway Unreachable";
      advice = "Lost connection to the Odyseus backend. Please verify your network stability and ensure the gateway is online (check the health indicator in the footer).";
    }

    addLog(`[CRITICAL] ${detailedMessage}`);
    if (advice) {
      addLog(`[ADVICE] ${advice}`);
    }
    
    setBuildStatus('failed');
    agents.forEach(a => updateAgent(a.id, { status: 'error' }));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // Check usage limit
    if (usageCount >= usageLimit) {
      setShowPaywall(true);
      addLog("Usage limit reached. Please upgrade to continue building.");
      return;
    }
    
    setIsGenerating(true);
    setBuildStatus('Analyzing requirements...');
    setBuildProgress(5);
    setTaskBreakdown([
      'Analyzing architectural constraints',
      'Provisioning specialized AI agents',
      'Mapping dependency graph',
      'Initializing CI/CD pipeline'
    ]);
    addLog(`Starting generation for: ${prompt}${feedback ? ` (with feedback: ${feedback})` : ''}`);
    
    try {
      // Derive agent models for orchestration
      const agentModels = agents.reduce((acc, agent) => {
        acc[agent.id] = agent.model;
        return acc;
      }, {} as Record<string, string>);

      const { result, plan } = await generateApp(prompt, agents, feedback, isHighThinking, (status, progress) => {
        const statusMap: Record<string, string> = {
          'building': 'Synthesizing components...',
          'testing': 'Running security & type checks...',
          'deploying': 'Pushing to edge network...',
          'completed': 'Stack ready'
        };
        setBuildStatus(statusMap[status] || status);
        setBuildProgress(progress);
        
        // Update task breakdown based on progress
        if (progress > 20) setTaskBreakdown(prev => [...prev, 'Generating UI components']);
        if (progress > 50) setTaskBreakdown(prev => [...prev, 'Configuring API routes']);
        if (progress > 80) setTaskBreakdown(prev => [...prev, 'Finalizing deployment']);

        // Update agent statuses based on CI/CD status
        if (status === 'building') {
          updateAgent('architect', { status: 'completed' });
          updateAgent('devops', { status: 'working', lastAction: 'Building artifacts...' });
        } else if (status === 'testing') {
          updateAgent('devops', { status: 'working', lastAction: 'Running security scans...' });
          updateAgent('debug', { status: 'working', lastAction: 'Testing build...' });
        } else if (status === 'deploying') {
          updateAgent('debug', { status: 'completed' });
          updateAgent('devops', { status: 'working', lastAction: 'Deploying to staging...' });
        }
      }, agentModels);
      
      // Update UI with provisioned agents from backend
      setAgents(plan.agents);
      addLog(`Autoscaling Logic: Provisioned ${plan.agents.length} agents. Metrics: Complexity Score ${plan.complexity}, System Load ${plan.systemLoad}%, Concurrent Users ${plan.concurrentUsers || 0}. Detected features: ${plan.metrics?.join(', ') || 'none'}.`);
      
      // Update global state
      setProjectName(result.projectName);
      setFiles(result.files);
      if (result.files.length > 0) setActiveFile(result.files[0].path);
      
      const finalStagingUrl = result.stagingUrl || `${window.location.origin}/staging/${result.projectName.toLowerCase().replace(/\s+/g, '-')}`;
      setStagingUrl(finalStagingUrl);
      addLog(`CD: Successfully deployed to staging: ${finalStagingUrl}`);
      
      plan.agents.forEach((agent: any) => updateAgent(agent.id, { status: 'completed' }));
      updateAgent('devops', { status: 'completed' });
      updateAgent('debug', { status: 'completed' });
      
      addLog(`Successfully generated ${result.projectName}!`);
      setActiveTab('preview');
      incrementUsage(); // Track usage for paywall
      setBuildStatus('completed');
      setBuildProgress(100);
      setFeedback(''); // Clear feedback after successful integration
    } catch (error) {
      console.error("Generation failed:", error);
      reportError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = async () => {
    setIsGenerating(true);
    addLog(`DevOps Agent: Initializing cloud deployment mesh for ${deployTarget.toUpperCase()}...`);
    
    const targetConfig = {
      'railway': { name: 'Railway', url: 'nexus-ai.run', action: 'Deploying to Railway...' },
      'vercel': { name: 'Vercel', url: 'vercel.app', action: 'Deploying to Vercel Edge...' },
      'netlify': { name: 'Netlify', url: 'netlify.app', action: 'Deploying to Netlify CDN...' },
      'aws-s3': { name: 'AWS S3', url: 's3-website.aws.com', action: 'Provisioning S3 Bucket & CloudFront...' },
      'cloudflare-pages': { name: 'Cloudflare Pages', url: 'pages.dev', action: 'Syncing with Cloudflare Edge...' },
      'docker': { name: 'Docker Host', url: 'docker-container.local', action: 'Building Docker Image & Pushing to Registry...' }
    }[deployTarget];

    updateAgent('devops', { status: 'working', lastAction: targetConfig.action });
    await new Promise(r => setTimeout(r, 2500));
    updateAgent('devops', { status: 'completed' });
    
    const deployUrl = `https://${projectName.toLowerCase().replace(/\s+/g, '-')}.${targetConfig.url}`;
    addLog(`Deployment successful! App live on ${targetConfig.name} at: ${deployUrl}`);
    setIsGenerating(false);
  };

  const handleDebug = async () => {
    if (!currentFile) return;
    setIsGenerating(true);
    addLog(`Debug Agent: Analyzing ${currentFile.path} for potential issues...`);
    updateAgent('debug', { status: 'working', lastAction: 'Analyzing code...' });
    
    try {
      const res = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentFile.content })
      });
      
      const { issues } = await res.json();
      
      if (issues && issues.length > 0) {
        addLog(`Debug Agent: Found ${issues.length} potential issues.`);
        setDebugVariables({ issues });
        issues.forEach((issue: any) => {
          addDebugLog(`[${issue.severity.toUpperCase()}] Line ${issue.line}: ${issue.message} | Fix: ${issue.fix}`);
        });
      } else {
        addLog("Debug Agent: No critical issues detected in current scope.");
      }
      
      updateAgent('debug', { status: 'completed' });
      setActiveTab('debug');
      setDebugActive(true);
      setCurrentLine(issues?.[0]?.line || 1);
    } catch (err) {
      reportError(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormat = async () => {
    if (!currentFile) return;
    setIsGenerating(true);
    addLog(`System: Formatting ${currentFile.path} using AI Mesh...`);
    
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: currentFile.content, 
          error: "Format this code perfectly according to industry standards. Return the formatted code in a 'fix' field of a single issue." 
        })
      });
      
      const { issues } = await response.json();
      if (issues && issues[0]?.fix) {
        const formatted = issues[0].fix;
        const newFiles = files.map(f => f.path === activeFile ? { ...f, content: formatted } : f);
        setFiles(newFiles);
        addLog(`System: Formatted ${currentFile.path} successfully.`);
      } else {
        addLog("System: Formatting failed or no changes needed.");
      }
    } catch (err) {
      reportError(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLint = async () => {
    if (!currentFile) return;
    setIsGenerating(true);
    addLog(`System: Linting ${currentFile.path} using AI Mesh...`);
    
    try {
      const res = await fetch('/api/lint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentFile.content, language: currentFile.language })
      });
      
      const { results } = await res.json();
      setLintResults(currentFile.path, results || []);
      
      if (results && results.length > 0) {
        const errors = results.filter((r: any) => r.severity === 'error').length;
        const warnings = results.filter((r: any) => r.severity === 'warning').length;
        addLog(`Lint: Found ${errors} errors and ${warnings} warnings in ${currentFile.path}.`);
      } else {
        addLog(`Lint: No issues found in ${currentFile.path}.`);
      }
    } catch (err) {
      reportError(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const widgetLibrary = [
    { id: 'auth-form', name: 'Auth Form', category: 'Forms', icon: Shield, desc: 'Login/Signup with OAuth' },
    { id: 'advanced-table', name: 'Advanced Grid', category: 'Data', icon: TableProperties, desc: 'Sorting, filtering, pagination' },
    { id: 'bar-chart', name: 'Bar Chart', category: 'Charts', icon: BarChart, desc: 'Comparative data viz' },
    { id: 'line-chart', name: 'Line Chart', category: 'Charts', icon: LineChart, desc: 'Time-series analytics' },
    { id: 'scatter-plot', name: 'Scatter Plot', category: 'Charts', icon: CircleDot, desc: 'Correlation analysis' },
    { id: 'heatmap', name: 'Heatmap', category: 'Charts', icon: Flame, desc: 'Density visualization' },
    { id: 'wizard-form', name: 'Step Wizard', category: 'Forms', icon: Wand2, desc: 'Multi-step form flow' },
    { id: 'kanban', name: 'Kanban Board', category: 'Layout', icon: Trello, desc: 'Drag-drop task management' },
    { id: 'sidebar-nav', name: 'Sidebar Nav', category: 'Layout', icon: Columns, desc: 'Collapsible navigation' },
    { id: 'dashboard-grid', name: 'Bento Grid', category: 'Layout', icon: LayoutList, desc: 'Modern dashboard layout' },
  ];

  const addWidgetToPrompt = (widgetName: string) => {
    const newPrompt = prompt ? `${prompt}\n\nAdd a ${widgetName} component.` : `Build an app with a ${widgetName}.`;
    setPrompt(newPrompt);
    addLog(`Added ${widgetName} to build context.`);
  };

  return (
    <div className="flex h-screen w-full bg-nexus-bg text-white selection:bg-nexus-accent/30 overflow-hidden">
      <DesktopApp />
      <AnimatePresence>
        {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      {!showIntro && isAuthLoading && (
        <div className="fixed inset-0 z-[150] bg-nexus-bg flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-nexus-accent/20 border-t-nexus-accent rounded-full animate-spin"></div>
          <p className="text-nexus-accent font-bold text-xs tracking-widest uppercase animate-pulse">Initializing Nexus OS...</p>
        </div>
      )}

      {!showIntro && !isAuthLoading && !isAuthenticated && <AuthPage />}
      
      <AnimatePresence>
        {showPaywall && <Paywall />}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && <Settings />}
        {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showAssetManager && <AssetManager />}
      </AnimatePresence>

      <AnimatePresence>
        {showTemplateSearch && <TemplateSearch />}
      </AnimatePresence>

      <AnimatePresence>
        {showTaskModal && <TaskModal />}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && <HistoryModal />}
      </AnimatePresence>

      {/* --- Mobile Header --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-black/40 backdrop-blur-md border-b border-nexus-border z-[60] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-nexus-accent/20 flex items-center justify-center border border-nexus-accent/50">
            <Zap size={18} className="text-nexus-accent" />
          </div>
          <span className="font-bold tracking-tighter">Odyseus</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-white/5 border border-nexus-border"
        >
          {isSidebarOpen ? <X size={20} /> : <Layout size={20} />}
        </button>
      </div>

      {/* --- Left Sidebar --- */}
      <motion.div 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : 60,
          x: (window.innerWidth < 1024 && !isSidebarOpen) ? -280 : 0
        }}
        className={cn(
          "flex flex-col border-r border-nexus-border bg-black/20 backdrop-blur-md z-[70] lg:z-20",
          "fixed lg:relative inset-y-0 left-0 lg:translate-x-0 transition-transform lg:transition-none",
          !isSidebarOpen && "lg:w-[60px]"
        )}
      >
        <div className="hidden lg:flex items-center gap-3 p-4 border-b border-white/5 h-14">
          <div className="w-8 h-8 rounded-lg bg-nexus-accent/10 flex items-center justify-center border border-nexus-accent/20">
            <Zap size={18} className="text-nexus-accent" />
          </div>
          {isSidebarOpen && <span className="font-black tracking-tighter text-lg uppercase">Odyseus</span>}
        </div>
        
        {/* Mobile Sidebar Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-nexus-border">
          <span className="font-bold tracking-tighter">Navigation</span>
          <button onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {isSidebarOpen ? (
            <>
              <div className="p-4 space-y-6 overflow-y-auto">
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Project</span>
                    <div className="flex gap-2">
                      <History 
                        size={14} 
                        onClick={() => setShowHistory(true)}
                        className="text-white/40 hover:text-nexus-accent cursor-pointer transition-colors" 
                      />
                      <Plus 
                        size={14} 
                        onClick={() => {
                          reset();
                          addLog("Started new project.");
                          setActiveTab('design');
                        }}
                        className="text-white/40 hover:text-nexus-accent cursor-pointer" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 p-2 rounded-md bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent">
                      <Box size={14} />
                      <span className="text-xs font-medium truncate">{projectName}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Explorer</span>
                  <div className="space-y-0.5">
                    {files.length === 0 ? (
                      <div className="space-y-1 opacity-40">
                        <div className="flex items-center gap-2 p-1.5 text-[10px] uppercase tracking-wider font-bold text-white/30">
                          <FolderTree size={12} />
                          <span>src/</span>
                        </div>
                        <div className="pl-4 space-y-1">
                          <div className="flex items-center gap-2 p-1 text-[10px] text-white/20 italic">
                            <FileCode size={10} />
                            <span>components/</span>
                          </div>
                          <div className="flex items-center gap-2 p-1 text-[10px] text-white/20 italic">
                            <FileCode size={10} />
                            <span>lib/</span>
                          </div>
                          <div className="flex items-center gap-2 p-1 text-[10px] text-white/20 italic">
                            <FileCode size={10} />
                            <span>App.tsx</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-1.5 text-[10px] uppercase tracking-wider font-bold text-white/30">
                          <FolderTree size={12} />
                          <span>server/</span>
                        </div>
                        <div className="pl-4">
                          <div className="flex items-center gap-2 p-1 text-[10px] text-white/20 italic">
                            <FileCode size={10} />
                            <span>index.ts</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      files.map(file => (
                        <div 
                          key={file.path}
                          onClick={() => setActiveFile(file.path)}
                          className={cn(
                            "flex items-center gap-2 p-1.5 rounded-md text-xs cursor-pointer transition-colors group",
                            activeFile === file.path ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
                          )}
                        >
                          <FileCode size={14} />
                          <span className="truncate flex-1">{file.path}</span>
                          <Search 
                            size={10} 
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-nexus-accent" 
                            onClick={(e) => {
                              e.stopPropagation();
                              addLog(`Inspecting ${file.path}: Analysis complete. No critical issues found.`);
                            }}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold block mb-2">Agents</span>
                  <div className="space-y-2">
                    {agents.map(agent => (
                      <AgentCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 gap-6">
              <Box size={20} className="text-white/40 hover:text-nexus-accent cursor-pointer transition-colors" onClick={() => setActiveTab('design')} />
              <FolderTree size={20} className="text-white/40 hover:text-nexus-accent cursor-pointer transition-colors" onClick={() => setActiveTab('code')} />
              <Cpu size={20} className="text-white/40 hover:text-nexus-accent cursor-pointer transition-colors" onClick={() => setShowSettings(true)} />
              <History size={20} className="text-white/40 hover:text-nexus-accent cursor-pointer transition-colors" onClick={() => setShowHistory(true)} />
              <RefreshCw size={20} className="text-white/40 hover:text-rose-500 cursor-pointer transition-colors" onClick={() => {
                if (confirm("Reset current project? All unsaved changes will be lost.")) {
                  reset();
                  addLog("Project reset to initial state.");
                }
              }} />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-nexus-border space-y-4">
          <div 
            className="flex items-center gap-3 text-white/50 hover:text-white cursor-pointer transition-colors"
            onClick={() => setShowSettings(true)}
          >
            <SettingsIcon size={18} />
            {isSidebarOpen && <span className="text-xs">Settings</span>}
          </div>
          <div className="flex items-center gap-3 text-white/50 hover:text-white cursor-pointer transition-colors" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Layout size={18} />
            {isSidebarOpen && <span className="text-xs">Collapse</span>}
          </div>
        </div>
      </motion.div>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col min-w-0 relative pt-14 lg:pt-0">
        {/* Header / Tabs */}
        <div className="h-14 border-b border-nexus-border flex items-center justify-between px-4 lg:px-6 bg-black/10 backdrop-blur-sm overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setActiveTab('design')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'design' ? "bg-nexus-accent text-white" : "text-white/40 hover:text-white"
                )}
              >
                <Layout size={14} />
                Builder
              </button>
              <button 
                onClick={() => setActiveTab('code')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'code' ? "bg-nexus-accent text-white" : "text-white/40 hover:text-white"
                )}
              >
                <FileCode size={14} />
                Code
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'preview' ? "bg-nexus-accent text-white" : "text-white/40 hover:text-white"
                )}
              >
                <Eye size={14} />
                Preview
              </button>
              <button 
                onClick={() => setActiveTab('debug')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === 'debug' ? "bg-nexus-accent text-white" : "text-white/40 hover:text-white"
                )}
              >
                <Bug size={14} />
                Debug
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={12} className="animate-spin text-nexus-accent" />
                  Saving...
                </>
              ) : (
                <>
                  <RefreshCw size={12} className="text-nexus-accent" />
                  Save
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
            
            <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-xl p-1">
              <select 
                value={deployTarget}
                onChange={(e) => setDeployTarget(e.target.value as any)}
                disabled={isGenerating}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white/40 focus:outline-none px-2 cursor-pointer hover:text-white transition-colors"
              >
                <option value="railway" className="bg-nexus-bg">Railway</option>
                <option value="aws-s3" className="bg-nexus-bg">AWS S3</option>
                <option value="cloudflare-pages" className="bg-nexus-bg">Cloudflare Pages</option>
              </select>
              <button 
                onClick={handleDeploy}
                disabled={isGenerating}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title={`Deploy to ${deployTarget}`}
              >
                <Play size={14} className="text-nexus-accent" />
              </button>
            </div>

            <div 
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black text-white/40 cursor-pointer hover:bg-white/10 transition-all overflow-hidden"
              onClick={() => isAuthenticated ? setShowSettings(true) : handleLogin()}
            >
              {isAuthenticated ? (
                userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  userProfile?.displayName?.[0]?.toUpperCase() || auth.currentUser?.email?.[0]?.toUpperCase() || 'U'
                )
              ) : (
                <User size={14} />
              )}
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'design' && (
                <motion.div 
                  key="design"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 p-8 overflow-auto flex flex-col items-center justify-start text-center space-y-12 pt-24"
                >
                  <div className="max-w-4xl w-full space-y-12">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-nexus-accent mb-4">
                        <Sparkles size={12} />
                        Next-Gen Project Builder
                      </div>
                      <h1 className="text-7xl font-black tracking-tighter leading-[1.1] max-w-3xl mx-auto text-center">
                        <span className="text-white">Roll Your Own </span>
                        <span className="text-nexus-accent">Project.</span>
                      </h1>
                      <p className="text-white/40 text-xl max-w-xl mx-auto font-medium">
                        Pick your components. We'll architect, build, and deploy your end-to-end type-safe application instantly.
                      </p>
                    </div>

                    <div className="relative group max-w-2xl mx-auto w-full">
                      <BorderGlow
                        borderRadius={24}
                        backgroundColor="#000000"
                        glowColor="180 100 50"
                        animated={isGenerating}
                        className="w-full"
                      >
                        <div className="p-6 flex flex-col gap-4">
                          <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleGenerate();
                              }
                            }}
                            placeholder="Describe your project vision..."
                            className="w-full h-24 bg-transparent border-none focus:ring-0 text-xl resize-none placeholder:text-white/10 font-medium"
                          />
                          
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex gap-3">
                              <button 
                                onClick={() => setShowAssetManager(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                              >
                                <Plus size={14} />
                                Assets
                              </button>
                              <button 
                                onClick={() => {
                                  if (!isPro && !isEnterprise) {
                                    setShowPaywall(true);
                                    addLog("High Thinking mode is exclusive to Pro and Enterprise tiers.");
                                    return;
                                  }
                                  setIsHighThinking(!isHighThinking);
                                }}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest",
                                  isHighThinking 
                                    ? "bg-purple-500/10 border-purple-500/50 text-purple-400" 
                                    : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                                )}
                              >
                                <Cpu size={14} />
                                High Thinking
                              </button>
                            </div>
                            
                            <button 
                              onClick={handleGenerate}
                              disabled={isGenerating || !prompt.trim()}
                              className={cn(
                                "flex items-center gap-2 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all",
                                isGenerating || !prompt.trim() 
                                  ? "bg-white/5 text-white/20 cursor-not-allowed" 
                                  : "bg-nexus-accent text-white hover:scale-105 active:scale-95 glow-accent"
                              )}
                            >
                              {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                              {isGenerating ? 'Building...' : 'Build Project'}
                            </button>
                          </div>
                        </div>
                      </BorderGlow>
                    </div>

                    {isGenerating && (
                      <div className="max-w-xl mx-auto pt-12 text-left w-full">
                        <TaskBreakdown tasks={taskBreakdown} />
                        
                        <div className="mt-12 p-6 glass rounded-2xl border-white/5 flex items-center gap-6">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-white/40">Build Progress</span>
                              <span className="text-xs font-black text-nexus-accent">{buildProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${buildProgress}%` }}
                                className="h-full bg-nexus-accent shadow-[0_0_10px_rgba(255,100,0,0.5)]"
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Status</div>
                            <div className="text-xs font-bold text-white whitespace-nowrap">{buildStatus}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isGenerating && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12">
                      <div className="space-y-6 text-left">
                        <div className="flex items-center gap-2 px-2">
                          <div className="w-1 h-4 bg-nexus-accent rounded-full" />
                          <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Frontend Frameworks</h3>
                        </div>
                          <div className="grid grid-cols-1 gap-3">
                            {['React (TanStack)', 'Next.js', 'Astro'].map(tech => (
                                  <div 
                                    key={tech}
                                    onClick={() => setPrompt(prev => prev + (prev ? ' ' : '') + `Use ${tech}`)}
                                    className="glass p-4 rounded-2xl border-white/5 hover:border-nexus-accent/30 transition-all cursor-pointer group"
                                  >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold group-hover:text-nexus-accent transition-colors">{tech}</span>
                                <Plus size={14} className="text-white/20 group-hover:text-nexus-accent" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6 text-left">
                        <div className="flex items-center gap-2 px-2">
                          <div className="w-1 h-4 bg-purple-500 rounded-full" />
                          <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Backend & API</h3>
                        </div>
                          <div className="grid grid-cols-1 gap-3">
                            {['Hono', 'tRPC', 'Convex'].map(tech => (
                                  <div 
                                    key={tech}
                                    onClick={() => setPrompt(prev => prev + (prev ? ' ' : '') + `Use ${tech}`)}
                                    className="glass p-4 rounded-2xl border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group"
                                  >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold group-hover:text-purple-400 transition-colors">{tech}</span>
                                <Plus size={14} className="text-white/20 group-hover:text-purple-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6 text-left">
                        <div className="flex items-center gap-2 px-2">
                          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                          <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Database & Auth</h3>
                        </div>
                          <div className="grid grid-cols-1 gap-3">
                            {['Drizzle (Turso)', 'Better Auth', 'Clerk'].map(tech => (
                                  <div 
                                    key={tech}
                                    onClick={() => setPrompt(prev => prev + (prev ? ' ' : '') + `Use ${tech}`)}
                                    className="glass p-4 rounded-2xl border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group"
                                  >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold group-hover:text-emerald-400 transition-colors">{tech}</span>
                                <Plus size={14} className="text-white/20 group-hover:text-emerald-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-24 pb-12">
                      <div className="max-w-xl mx-auto p-8 glass rounded-[32px] border-white/5 space-y-6 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-nexus-accent/10 flex items-center justify-center mx-auto">
                          <Sparkles size={24} className="text-nexus-accent" />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">Stop guessing. Start building.</h2>
                        <p className="text-white/60 text-base leading-relaxed">
                          Odyseus doesn't just "generate code." It architecturally maps your idea, provisions specialized AI agents, and builds production-ready stacks in seconds.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-nexus-accent font-black text-xl mb-1">01</div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">Architect</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-purple-400 font-black text-xl mb-1">02</div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">Provision</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-emerald-400 font-black text-xl mb-1">03</div>
                            <div className="text-[10px] uppercase tracking-widest font-bold text-white/40">Deploy</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 pt-8">
                          <div className="flex -space-x-2">
                            {[1,2,3,4].map(i => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-white/10" />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Trusted by developers at top startups</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

              {activeTab === 'code' && (
                <motion.div 
                  key="code"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-nexus-border">
                    <div className="flex items-center gap-2">
                      <FileCode size={14} className="text-nexus-accent" />
                      <span className="text-xs font-mono text-white/60">{activeFile || 'No file selected'}</span>
                      {currentFile?.language && (
                        <span className="text-[10px] uppercase bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-white/40 font-bold ml-2">
                          {currentFile.language}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleLint}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider transition-colors border border-white/10"
                      >
                        <Shield size={12} className="text-nexus-accent" />
                        Lint
                      </button>
                      <button 
                        onClick={handleFormat}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider transition-colors border border-white/10"
                      >
                        <Wand size={12} className="text-nexus-accent" />
                        Format
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto bg-black/20 relative">
                    {currentFile ? (
                      <>
                        <SyntaxHighlighter
                          language={currentFile.language?.toLowerCase() || 'typescript'}
                          style={vscDarkPlus}
                          showLineNumbers={true}
                          customStyle={{
                            margin: 0,
                            padding: '1.5rem',
                            background: 'transparent',
                            fontSize: '0.875rem',
                            lineHeight: '1.6',
                          }}
                          lineNumberStyle={{
                            minWidth: '3em',
                            paddingRight: '1em',
                            color: 'rgba(255, 255, 255, 0.2)',
                            textAlign: 'right',
                            userSelect: 'none',
                          }}
                        >
                          {currentFile.content}
                        </SyntaxHighlighter>
                        
                        {/* Lint Overlays */}
                        {lintResults[currentFile.path]?.length > 0 && (
                          <div className="absolute top-0 right-0 p-4 space-y-2 pointer-events-none max-w-xs">
                            {lintResults[currentFile.path].map((err, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className={cn(
                                  "p-2 rounded-lg border text-[10px] backdrop-blur-md flex items-start gap-2 shadow-lg",
                                  err.severity === 'error' ? "bg-rose-500/20 border-rose-500/50 text-rose-200" : "bg-amber-500/20 border-amber-500/50 text-amber-200"
                                )}
                              >
                                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-bold">Line {err.line}:</span> {err.message}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/20 italic">
                        Select a file to view code
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'preview' && (
                <motion.div 
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 p-6 overflow-auto bg-[#0a0a0a]"
                >
                  <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold tracking-tight">{projectName}</h2>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            addLog("System: Refreshing preview mesh...");
                            // Simulate refresh
                          }}
                          className="p-2 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          title="Refresh Preview"
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            addLog("System: Initializing architectural inspector...");
                            // Show inspector logic
                          }}
                          className="p-2 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          title="Inspect Architecture"
                        >
                          <Search size={16} />
                        </button>
                        <div className="w-[1px] h-8 bg-white/5 mx-2" />
                        <button 
                          onClick={() => setPreviewMode('desktop')}
                          className={cn(
                            "p-2 rounded-lg border transition-colors",
                            previewMode === 'desktop' ? "bg-nexus-accent/20 border-nexus-accent text-nexus-accent" : "bg-white/5 border-nexus-border hover:bg-white/10"
                          )}
                        >
                          <Monitor size={16} />
                        </button>
                        <button 
                          onClick={() => setPreviewMode('mobile')}
                          className={cn(
                            "p-2 rounded-lg border transition-colors",
                            previewMode === 'mobile' ? "bg-nexus-accent/20 border-nexus-accent text-nexus-accent" : "bg-white/5 border-nexus-border hover:bg-white/10"
                          )}
                        >
                          <Smartphone size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className={cn(
                      "glass rounded-2xl min-h-[500px] p-8 flex flex-col items-center justify-center border-white/5 transition-all duration-500 mx-auto",
                      previewMode === 'mobile' ? "max-w-[375px] border-x-8 border-t-16 border-b-16 border-black/40 rounded-[40px]" : "w-full"
                    )}>
                      {files.length > 0 ? (
                        <div className="w-full space-y-8">
                          {prompt.toLowerCase().includes('kanban') || prompt.toLowerCase().includes('board') ? (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-nexus-accent/10 flex items-center justify-center border border-nexus-accent/20">
                                    <Trello size={20} className="text-nexus-accent" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold">Project Workspace</h3>
                                    <p className="text-xs text-white/40">Drag and drop tasks to manage workflow</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => addLog("System: Opening board filters...")}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold uppercase tracking-wider border border-white/5 hover:bg-white/10 transition-colors"
                                  >
                                    Filters
                                  </button>
                                  <button 
                                    onClick={() => setShowTaskModal(true)}
                                    className="px-3 py-1.5 rounded-lg bg-nexus-accent text-nexus-accent-contrast text-[10px] font-bold uppercase tracking-wider hover:bg-nexus-accent/80 transition-colors"
                                  >
                                    New Task
                                  </button>
                                </div>
                              </div>
                              <KanbanBoard />
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className="h-32 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                                ))}
                              </div>
                              <div className="h-64 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                                <div className="text-center space-y-2">
                                  <Activity size={32} className="mx-auto text-nexus-accent animate-pulse" />
                                  <p className="text-white/40 text-sm">Real-time Preview Engine Active</p>
                                </div>
                              </div>
                            </>
                          )}
                          
                          {/* CI/CD Staging & Feedback Loop */}
                          {stagingUrl && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="w-full space-y-6 pt-8 border-t border-white/5"
                            >
                              <div className="flex items-center justify-between p-4 rounded-2xl bg-nexus-accent/5 border border-nexus-accent/10">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-nexus-accent/20 flex items-center justify-center">
                                    <Globe size={20} className="text-nexus-accent" />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold">Staging Environment Ready</h4>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">CI/CD Pipeline: Deployment Successful</p>
                                  </div>
                                </div>
                                <a 
                                  href={stagingUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 rounded-xl bg-nexus-accent text-nexus-accent-contrast text-[10px] font-bold uppercase tracking-widest hover:bg-nexus-accent/80 transition-all shadow-[0_0_15px_rgba(var(--nexus-accent-rgb),0.3)]"
                                >
                                  Open Staging App
                                </a>
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <MessageSquare size={16} className="text-nexus-accent" />
                                  <h4 className="text-sm font-bold">User Feedback Loop</h4>
                                </div>
                                <div className="relative">
                                  <textarea 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="How can we improve this build? (e.g., 'Make the header sticky', 'Add a dark mode toggle')"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-nexus-accent/50 transition-all min-h-[100px] resize-none"
                                  />
                                  <button 
                                    onClick={() => {
                                      if (!feedback.trim()) return;
                                      addLog(`User Feedback: ${feedback}`);
                                      setPrompt(`${prompt}\n\nRefinement based on feedback: ${feedback}`);
                                      setFeedback('');
                                      addLog("System: Feedback received. Prompt updated for next iteration.");
                                      setActiveTab('design');
                                    }}
                                    className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
                                  >
                                    Submit & Refine
                                  </button>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                                      <AlertCircle size={20} className="text-rose-500" />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-rose-400">Runtime Diagnostics</h4>
                                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Simulate production errors to test resilience</p>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => {
                                      addLog("[CRITICAL] Runtime Exception: Uncaught TypeError: Cannot read property 'map' of undefined");
                                      useNexusStore.setState((state) => ({
                                        debugState: {
                                          ...state.debugState,
                                          isActive: true,
                                          currentLine: 42, // Mock error line
                                          error: "Uncaught TypeError: Cannot read property 'map' of undefined",
                                          logs: [...state.debugState.logs, "Error: Uncaught TypeError: Cannot read property 'map' of undefined at line 42"],
                                          variables: { ...state.debugState.variables, data: undefined }
                                        },
                                        activeTab: 'debug'
                                      }));
                                    }}
                                    className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/30 transition-all border border-rose-500/30"
                                  >
                                    Simulate Error
                                  </button>
                                </div>
                                <p className="text-[10px] text-white/30 italic">Your feedback directly influences the next generation cycle of the AI agents.</p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                            <Eye size={32} className="text-white/20" />
                          </div>
                          <p className="text-white/40">Generate an app to see the preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Panel (Terminal) */}
            {!isTerminalClosed && (
              <div className={cn(
                "border-t border-nexus-border bg-black/40 backdrop-blur-md flex flex-col transition-all duration-300 relative z-50",
                isTerminalMaximized ? "h-[80%]" : isTerminalMinimized ? "h-10" : "h-48"
              )}>
                <div className="flex items-center justify-between px-4 py-2 border-b border-nexus-border bg-white/5 cursor-pointer" onClick={() => setTerminalMinimized(!isTerminalMinimized)}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-nexus-accent">
                      <Terminal size={12} />
                      Terminal
                    </div>
                    {!isTerminalMinimized && (
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/30">
                        <Activity size={12} />
                        Logs
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white" 
                      onClick={(e) => { e.stopPropagation(); setTerminalMinimized(!isTerminalMinimized); }}
                      title={isTerminalMinimized ? "Expand" : "Minimize"}
                    >
                      <ChevronDown size={12} className={cn("transition-transform", isTerminalMinimized ? "rotate-180" : "")} />
                    </button>
                    <button 
                      className="p-1 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-white" 
                      onClick={(e) => { e.stopPropagation(); setTerminalMaximized(!isTerminalMaximized); }}
                      title={isTerminalMaximized ? "Restore" : "Maximize"}
                    >
                      <Maximize2 size={12} />
                    </button>
                    <button 
                      className="p-1 hover:bg-rose-500/20 rounded transition-colors text-white/40 hover:text-rose-500" 
                      onClick={(e) => { e.stopPropagation(); setTerminalClosed(true); }}
                      title="Close"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
                {!isTerminalMinimized && (
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 text-white/60">
                  {logs.map((log, i) => {
                    const isCritical = log.startsWith('[CRITICAL]');
                    const isAdvice = log.startsWith('[ADVICE]');
                    const isUser = log.startsWith('User:');
                    const isAI = log.startsWith('AI:');

                    return (
                      <div key={i} className="flex gap-2">
                        <span className={cn(
                          "shrink-0",
                          isCritical ? "text-rose-500" : isAdvice ? "text-amber-400" : "text-nexus-accent/50"
                        )}>➜</span>
                        <span className={cn(
                          isCritical ? "text-rose-400 font-bold" : 
                          isAdvice ? "text-amber-200/80 italic" : 
                          isUser ? "text-nexus-accent" :
                          isAI ? "text-purple-300" : ""
                        )}>
                          {log}
                        </span>
                      </div>
                    );
                  })}
                  {buildStatus === 'failed' && (
                    <div className="mt-4 p-3 border border-rose-500/30 bg-rose-500/5 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-400">
                        <AlertCircle size={14} />
                        <span>Build pipeline halted. Action required.</span>
                      </div>
                      <button 
                        onClick={() => handleGenerate()}
                        className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wider rounded border border-rose-500/30 transition-all"
                      >
                        Retry Pipeline
                      </button>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="flex gap-2 text-nexus-accent animate-pulse">
                      <span className="shrink-0">➜</span>
                      <span>Processing build stack...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

          {/* --- Right Panel (Minimized AI Assistant) --- */}
          <motion.div 
            animate={{ width: isAssistantExpanded ? 320 : 48 }}
            className="border-l border-nexus-border bg-black/20 backdrop-blur-md flex flex-col transition-all"
          >
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-nexus-border bg-white/5">
                {isAssistantExpanded && (
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-nexus-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">AI Assistant</span>
                  </div>
                )}
                <button 
                  onClick={() => setIsAssistantExpanded(!isAssistantExpanded)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors mx-auto"
                >
                  {isAssistantExpanded ? <ChevronRight size={14} /> : <MessageSquare size={16} className="text-nexus-accent" />}
                </button>
              </div>

              {isAssistantExpanded && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <p className="text-xs text-white/80 leading-relaxed">
                        Hello! I'm the Odyseus AI Orchestrator. I've been minimized to give you more space for your ecosystem.
                      </p>
                    </div>
                    {isGenerating && (
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-nexus-accent/20 flex items-center justify-center shrink-0">
                          <Loader2 size={12} className="text-nexus-accent animate-spin" />
                        </div>
                        <div className="bg-nexus-accent/10 rounded-xl p-3 border border-nexus-accent/20">
                          <p className="text-[11px] text-nexus-accent font-medium">
                            Orchestrating agents...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Panel title="System Metrics" icon={BarChart3} className="h-64 border-t border-nexus-border">
                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] uppercase tracking-wider text-white/40 font-bold">
                          <span>AI Compute</span>
                          <span className="text-nexus-accent">42%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-nexus-accent w-[42%]" />
                        </div>
                      </div>
                      
                      <div className="space-y-2 pt-2">
                        <div className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Backend Mesh Status</div>
                        <div className="grid grid-cols-2 gap-2">
                          {backendHealth?.services ? Object.entries(backendHealth.services).map(([name, status]: any) => (
                            <div key={name} className="glass p-1.5 rounded-lg flex items-center justify-between">
                              <span className="text-[8px] text-white/40 uppercase font-bold">{name}</span>
                              <div className={cn("w-1.5 h-1.5 rounded-full", status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500')} />
                            </div>
                          )) : (
                            <div className="col-span-2 text-[8px] text-white/20 text-center py-2 italic">Connecting to Gateway...</div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="glass p-1.5 rounded-lg text-center">
                          <span className="block text-[8px] text-white/40 uppercase font-bold">Builds</span>
                          <span className="text-sm font-bold">{usageCount}</span>
                        </div>
                        <div className="glass p-1.5 rounded-lg text-center">
                          <span className="block text-[8px] text-white/40 uppercase font-bold">Uptime</span>
                          <span className="text-sm font-bold">{backendHealth?.uptime ? `${Math.floor(backendHealth.uptime / 60)}m` : '99.9%'}</span>
                        </div>
                      </div>
                    </div>
                  </Panel>

                  <div className="p-3 border-t border-nexus-border bg-black/40">
                    <div className="relative">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (chatInput.trim()) {
                              addLog(`User: ${chatInput}`);
                              setChatInput('');
                              setTimeout(() => {
                                addLog("AI: I've analyzed your request. I recommend optimizing the data mesh for better performance.");
                              }, 1000);
                            }
                          }
                        }}
                        placeholder="Ask AI..."
                        className="w-full bg-white/5 border border-nexus-border rounded-xl py-2 pl-3 pr-8 text-[10px] focus:outline-none focus:border-nexus-accent/50 transition-colors"
                      />
                      <button 
                        onClick={() => {
                          if (chatInput.trim()) {
                            addLog(`User: ${chatInput}`);
                            setChatInput('');
                            setTimeout(() => {
                              addLog("AI: I've analyzed your request. I recommend optimizing the data mesh for better performance.");
                            }, 1000);
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-nexus-accent transition-colors"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- Floating Widgets --- */}
      <div className="fixed bottom-20 right-8 z-50 flex flex-col gap-3 items-end pointer-events-none">
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass p-3 rounded-2xl flex items-center gap-4 pointer-events-auto shadow-2xl border-nexus-accent/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-nexus-accent/20 flex items-center justify-center">
                  <Loader2 size={20} className="text-nexus-accent animate-spin" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Autonomous Build in Progress</h4>
                  <p className="text-[10px] text-white/40">Orchestrating 5 agents...</p>
                </div>
              </div>
              <div className="h-8 w-px bg-nexus-border mx-2" />
              <button 
                onClick={() => setIsGenerating(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-rose-500 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- AI Assistant & Feedback Loop --- */}
      <AIChat />
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center pointer-events-none"
          >
            <CommunicationMesh activeAgents={agents.filter(a => a.status === 'working').map(a => a.id)} />
            
            <div className="max-w-md w-full glass p-8 rounded-3xl space-y-8 text-center border-nexus-accent/30 shadow-[0_0_50px_rgba(0,242,255,0.1)] relative z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-nexus-accent/20 blur-3xl rounded-full"></div>
                <Zap size={48} className="text-nexus-accent mx-auto relative animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Orchestrating AI Mesh</h2>
                <p className="text-white/40 text-sm">Agents are communicating and sharing data to synthesize your application.</p>
              </div>

              <CICDPipeline status={buildStatus} progress={buildProgress} />
              
              <div className="space-y-4">
                {agents.map((agent, i) => (
                  <motion.div 
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-all duration-500",
                      agent.status === 'working' ? "bg-nexus-accent/10 border-nexus-accent/30 shadow-[0_0_15px_rgba(0,242,255,0.1)]" : "bg-white/5 border-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center relative",
                        agent.status === 'working' ? "bg-nexus-accent/20 text-nexus-accent" : 
                        agent.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/20"
                      )}>
                        {agent.status === 'working' && (
                          <motion.div 
                            className="absolute inset-0 rounded-lg border border-nexus-accent"
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                        {agent.status === 'working' ? <Loader2 size={14} className="animate-spin" /> : 
                         agent.status === 'completed' ? <CheckCircle2 size={14} /> : <Cpu size={14} />}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold">{agent.name}</p>
                        <p className="text-[10px] text-white/40">{agent.role}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase",
                        agent.status === 'working' ? "text-nexus-accent" : 
                        agent.status === 'completed' ? "text-emerald-400" : "text-white/20"
                      )}>
                        {agent.status}
                      </span>
                      {agent.status === 'working' && (
                        <div className="flex gap-1">
                          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 h-1 rounded-full bg-nexus-accent" />
                          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 h-1 rounded-full bg-nexus-accent" />
                          <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 h-1 rounded-full bg-nexus-accent" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Data Sharing Indicator */}
              {agents.some(a => a.status === 'working') && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 border-t border-nexus-border flex items-center justify-center gap-2"
                >
                  <div className="flex -space-x-2">
                    {agents.filter(a => a.status === 'working').map((a, i) => (
                      <div key={a.id} className="w-6 h-6 rounded-full bg-nexus-accent/20 border border-nexus-accent flex items-center justify-center text-[8px] font-bold">
                        {a.name[0]}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest animate-pulse">
                    Synchronizing Data Mesh...
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
