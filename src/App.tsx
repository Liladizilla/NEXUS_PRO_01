/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CICDPipeline } from './components/CICDPipeline';
import { FeedbackWidget } from './components/FeedbackWidget';
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
  Dumbbell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectTemplates } from './components/ProjectTemplates';
import { KanbanBoard } from './components/KanbanBoard';
import { Paywall } from './components/Paywall';
import { Settings } from './components/Settings';
import { AuthModal } from './components/AuthModal';
import { AssetManager, TemplateSearch, TaskModal, HistoryModal } from './components/Modals';
import { Debugger } from './components/Debugger';
import { useNexusStore, AgentStatus } from './store';
import { generateApp } from './ai';
import { getContrastColor } from './lib/utils';
import { auth, googleProvider, syncUserProfile } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants ---

// --- Components ---

const Intro = ({ onComplete }: { onComplete: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 3, duration: 1 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[200] bg-nexus-bg flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-nexus-accent/20 blur-[100px] rounded-full animate-pulse"></div>
        <Zap size={120} className="text-nexus-accent relative glow-accent" />
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-8 text-4xl font-black tracking-[0.2em] text-white uppercase"
      >
        NEXUS AI
      </motion.h1>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ delay: 1, duration: 2 }}
        className="h-0.5 bg-nexus-accent mt-4 rounded-full"
      />
    </motion.div>
  );
};

const AuthPage = ({ onLogin }: { onLogin: (email: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setLoadingText(`Connecting to ${provider} Gateway...`);
    
    setTimeout(() => {
      setLoadingText(`Authenticating with ${provider} Identity...`);
      setTimeout(() => {
        setLoadingText('Finalizing Nexus Handshake...');
        setTimeout(() => {
          onLogin(`${provider.toLowerCase()}-user@nexus.ai`);
          setIsLoading(false);
        }, 800);
      }, 1000);
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[150] bg-nexus-bg flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full glass p-8 rounded-3xl space-y-8 border-nexus-accent/20 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-nexus-bg/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-nexus-accent/20 border-t-nexus-accent rounded-full animate-spin"></div>
            <p className="text-nexus-accent font-bold text-xs tracking-widest uppercase animate-pulse">{loadingText}</p>
          </div>
        )}

        <div className="text-center space-y-2">
          <Zap size={40} className="text-nexus-accent mx-auto mb-4" />
          <h2 className="text-3xl font-black tracking-tight">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-white/40 text-sm">Access the world's most stable software builder OS</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-nexus-border rounded-xl px-4 py-3 text-sm focus:border-nexus-accent/50 transition-colors"
              placeholder="name@company.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-nexus-border rounded-xl px-4 py-3 text-sm focus:border-nexus-accent/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button 
            onClick={() => onLogin(email || 'user@nexus.ai')}
            className="w-full bg-nexus-accent text-nexus-accent-contrast font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all glow-accent"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-nexus-border"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold"><span className="bg-nexus-bg px-2 text-white/20">Or continue with</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-nexus-border hover:bg-white/10 transition-colors text-xs font-bold"
          >
            <Globe size={14} /> Google
          </button>
          <button 
            onClick={() => handleSocialLogin('Apple')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-nexus-border hover:bg-white/10 transition-colors text-xs font-bold"
          >
            <Smartphone size={14} /> Apple
          </button>
        </div>

        <p className="text-center text-xs text-white/40">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-nexus-accent font-bold hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
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

const AgentCard = ({ agent }: { agent: any }) => {
  const statusColors = {
    idle: 'text-white/30',
    working: 'text-nexus-accent animate-pulse',
    completed: 'text-emerald-400',
    error: 'text-rose-500'
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-nexus-border/50">
      <div className={cn("p-1.5 rounded-md bg-black/40", statusColors[agent.status as AgentStatus])}>
        <Cpu size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium truncate">{agent.name}</span>
          <span className={cn("text-[10px] uppercase font-bold", statusColors[agent.status as AgentStatus])}>
            {agent.status}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] text-white/50 truncate">{agent.role}</p>
          <span className="text-[8px] text-nexus-accent/60 font-mono uppercase truncate">{agent.model}</span>
        </div>
      </div>
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
    accentColor,
    reset,
    templates, fetchTemplates,
    setDebugActive, setCurrentLine, setDebugVariables, addDebugLog, isPro
  } = useNexusStore();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [buildStatus, setBuildStatus] = useState<string>('idle');
  const [buildProgress, setBuildProgress] = useState<number>(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        useNexusStore.setState({ isAuthenticated: true });
        const unsubscribeProfile = syncUserProfile(user, (profile) => {
          setUserProfile(profile);
        });
        return () => unsubscribeProfile();
      } else {
        useNexusStore.setState({ isAuthenticated: false });
        setUserProfile(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

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
      addLog("Subscription successful! Welcome to NEXUS Pro.");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const [showIntro, setShowIntro] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAssistantExpanded, setIsAssistantExpanded] = useState(false);
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
  const [backendHealth, setBackendHealth] = useState<any>(null);
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
      advice = "The NEXUS mesh is currently processing a high volume of requests. Please wait a few minutes or upgrade to NEXUS Pro for priority access.";
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
      advice = "Lost connection to the NEXUS backend. Please verify your network stability and ensure the gateway is online (check the health indicator in the footer).";
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
    setBuildStatus('processing');
    setBuildProgress(0);
    addLog(`Starting generation for: ${prompt}${feedback ? ` (with feedback: ${feedback})` : ''}`);
    
    try {
      const { result, plan } = await generateApp(prompt, agents, feedback, (status, progress) => {
        setBuildStatus(status);
        setBuildProgress(progress);
        
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
      });
      
      // Update UI with provisioned agents from backend
      setAgents(plan.agents);
      addLog(`Autoscaling Logic: Provisioned ${plan.agents.length} agents. Metrics: Complexity Score ${plan.complexity}, System Load ${plan.systemLoad}%, Concurrent Users ${plan.concurrentUsers || 0}. Detected features: ${plan.metrics?.join(', ') || 'none'}.`);
      
      // Update global state
      setProjectName(result.projectName);
      setFiles(result.files);
      if (result.files.length > 0) setActiveFile(result.files[0].path);
      
      const finalStagingUrl = result.stagingUrl || `https://staging-${result.projectName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(7)}.nexus-preview.app`;
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
      'aws-s3': { name: 'AWS S3', url: 's3-website.aws.com', action: 'Provisioning S3 Bucket & CloudFront...' },
      'cloudflare-pages': { name: 'Cloudflare Pages', url: 'pages.dev', action: 'Syncing with Cloudflare Edge...' }
    }[deployTarget];

    updateAgent('devops', { status: 'working', lastAction: targetConfig.action });
    await new Promise(r => setTimeout(r, 2500));
    updateAgent('devops', { status: 'completed' });
    
    const deployUrl = `https://${projectName.toLowerCase().replace(/\s+/g, '-')}.${targetConfig.url}`;
    addLog(`Deployment successful! App live on ${targetConfig.name} at: ${deployUrl}`);
    setIsGenerating(false);
  };

  const handleDebug = async () => {
    setIsGenerating(true);
    addLog("Debug Agent: Initializing runtime debugger...");
    updateAgent('debug', { status: 'working', lastAction: 'Attaching debugger...' });
    await new Promise(r => setTimeout(r, 1500));
    updateAgent('debug', { status: 'completed' });
    addLog("Debug Agent: Debugger attached. Switching to Debug view.");
    setIsGenerating(false);
    setActiveTab('debug');
    setDebugActive(true);
    setCurrentLine(1);
    setDebugVariables({
      projectName: projectName,
      isPro: isPro,
      agentsCount: agents.length,
      timestamp: Date.now()
    });
    addDebugLog("Debugger: Runtime session started.");
  };

  const currentFile = files.find(f => f.path === activeFile);

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
    <div className="flex h-screen w-full bg-nexus-bg text-white selection:bg-nexus-accent/30">
      <AnimatePresence>
        {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      {!showIntro && !isAuthenticated && <AuthPage onLogin={login} />}
      
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

      {/* --- Left Sidebar --- */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 60 }}
        className="flex flex-col border-r border-nexus-border bg-black/20 backdrop-blur-md z-20"
      >
        <div className="flex items-center gap-3 p-4 border-b border-nexus-border h-14">
          <div className="w-8 h-8 rounded-lg bg-nexus-accent/20 flex items-center justify-center border border-nexus-accent/50 glow-accent">
            <Zap size={18} className="text-nexus-accent" />
          </div>
          {isSidebarOpen && <span className="font-bold tracking-tighter text-lg">NEXUS AI</span>}
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
                    {files.map(file => (
                      <div 
                        key={file.path}
                        onClick={() => setActiveFile(file.path)}
                        className={cn(
                          "flex items-center gap-2 p-1.5 rounded-md text-xs cursor-pointer transition-colors",
                          activeFile === file.path ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
                        )}
                      >
                        <FileCode size={14} />
                        <span className="truncate">{file.path}</span>
                      </div>
                    ))}
                    {files.length === 0 && (
                      <div className="text-[10px] text-white/20 italic p-2">No files generated yet.</div>
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
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header / Tabs */}
        <div className="h-14 border-b border-nexus-border flex items-center justify-between px-6 bg-black/10 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-lg border border-nexus-border">
              <button 
                onClick={() => setActiveTab('design')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeTab === 'design' ? "bg-nexus-accent text-nexus-accent-contrast shadow-lg shadow-nexus-accent/20" : "text-white/60 hover:text-white"
                )}
              >
                <Layers size={14} />
                Design
              </button>
              <button 
                onClick={() => setActiveTab('code')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeTab === 'code' ? "bg-nexus-accent text-nexus-accent-contrast shadow-lg shadow-nexus-accent/20" : "text-white/60 hover:text-white"
                )}
              >
                <Code2 size={14} />
                Code
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeTab === 'preview' ? "bg-nexus-accent text-nexus-accent-contrast shadow-lg shadow-nexus-accent/20" : "text-white/60 hover:text-white"
                )}
              >
                <Eye size={14} />
                Preview
              </button>
              <button 
                onClick={() => setActiveTab('debug')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  activeTab === 'debug' ? "bg-nexus-accent text-nexus-accent-contrast shadow-lg shadow-nexus-accent/20" : "text-white/60 hover:text-white"
                )}
              >
                <Bug size={14} />
                Debug
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live System
            </div>
            <button 
              onClick={handleDebug}
              disabled={isGenerating}
              className="p-2 rounded-lg bg-white/5 border border-nexus-border hover:bg-white/10 transition-colors"
              title="Autonomous Debug"
            >
              <Shield size={16} className="text-purple-400" />
            </button>
            <div className="flex items-center gap-1 bg-white/5 border border-nexus-border rounded-lg p-1">
              <select 
                value={deployTarget}
                onChange={(e) => setDeployTarget(e.target.value as any)}
                disabled={isGenerating}
                className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-white/60 focus:outline-none px-2 cursor-pointer hover:text-white transition-colors"
              >
                <option value="railway" className="bg-nexus-bg">Railway</option>
                <option value="aws-s3" className="bg-nexus-bg">AWS S3</option>
                <option value="cloudflare-pages" className="bg-nexus-bg">Cloudflare Pages</option>
              </select>
              <button 
                onClick={handleDeploy}
                disabled={isGenerating}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                title={`Deploy to ${deployTarget}`}
              >
                <Play size={14} className="text-nexus-accent" />
              </button>
            </div>

            {/* Usage Indicator */}
            <div className="hidden lg:flex flex-col items-end mr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Builds</span>
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                  usageCount >= usageLimit ? "bg-rose-500/20 text-rose-500" : "bg-nexus-accent/10 text-nexus-accent"
                )}>
                  {usageCount}/{usageLimit}
                </span>
              </div>
              <div className="w-16 h-0.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (usageCount / usageLimit) * 100)}%` }}
                  className={cn(
                    "h-full rounded-full",
                    usageCount >= usageLimit ? "bg-rose-500" : "bg-nexus-accent"
                  )}
                />
              </div>
            </div>

            <div 
              className="w-8 h-8 rounded-full bg-nexus-accent/20 border border-nexus-accent/50 flex items-center justify-center text-[10px] font-bold text-nexus-accent cursor-pointer hover:bg-nexus-accent/30 transition-all overflow-hidden"
              onClick={() => isAuthenticated ? setShowSettings(true) : handleLogin()}
              title={isAuthenticated ? "User Profile" : "Sign In"}
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
                  className="flex-1 p-8 overflow-auto flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="max-w-2xl w-full space-y-8">
                    <div className="space-y-4">
                      <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
                        What are we building today?
                      </h1>
                      <p className="text-white/40 text-lg">
                        Describe your vision. NEXUS AI will architect, build, and deploy it instantly.
                      </p>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-nexus-accent/50 to-purple-500/50 rounded-2xl blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
                      <div className="relative glass rounded-2xl p-4 flex flex-col gap-4">
                        <textarea 
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleGenerate();
                            }
                          }}
                          placeholder="e.g. A real-time crypto analytics dashboard with social sentiment analysis..."
                          className="w-full h-32 bg-transparent border-none focus:ring-0 text-lg resize-none placeholder:text-white/20"
                        />
                        <div className="flex items-center justify-between pt-2 border-t border-nexus-border">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setShowAssetManager(true)}
                              className="p-2 rounded-lg bg-white/5 border border-nexus-border hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                              title="Add Assets"
                            >
                              <Plus size={16} />
                            </button>
                            <button 
                              onClick={() => setShowTemplateSearch(true)}
                              className="p-2 rounded-lg bg-white/5 border border-nexus-border hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                              title="Search Templates"
                            >
                              <Search size={16} />
                            </button>
                          </div>
                          <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className={cn(
                              "flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all",
                              isGenerating || !prompt.trim() 
                                ? "bg-white/5 text-white/20 cursor-not-allowed" 
                                : "bg-nexus-accent text-nexus-accent-contrast hover:scale-105 active:scale-95 glow-accent"
                            )}
                          >
                            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                            {isGenerating ? 'Architecting...' : 'Build System'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Project Templates</span>
                        <span 
                          className="text-[10px] text-nexus-accent font-bold cursor-pointer hover:underline"
                          onClick={() => setShowTemplateSearch(true)}
                        >
                          View All
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-4">
                        {templates.slice(0, 3).map((template) => {
                          const Icon = (template.icon === 'ShoppingBag' ? ShoppingBag : 
                                       template.icon === 'Users' ? Users : 
                                       template.icon === 'LayoutDashboard' ? LayoutDashboard : 
                                       template.icon === 'Bot' ? Bot : 
                                       template.icon === 'Palette' ? Palette : Dumbbell);
                          return (
                            <motion.div
                              key={template.id}
                              whileHover={{ y: -5, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setPrompt(template.prompt)}
                              className="glass p-6 rounded-2xl text-left cursor-pointer border-white/5 hover:border-nexus-accent/30 transition-colors group"
                            >
                              <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                                template.color.replace('text-', 'bg-').replace('400', '400/10')
                              )}>
                                <Icon size={24} className={cn("text-white/40 group-hover:text-nexus-accent", template.color)} />
                              </div>
                              <h4 className="font-bold text-sm mb-1 group-hover:text-nexus-accent transition-colors">{template.title}</h4>
                              <p className="text-[10px] text-white/40 line-clamp-2">{template.description}</p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">UI Widget Library</span>
                        <span 
                          className="text-[10px] text-nexus-accent font-bold cursor-pointer hover:underline"
                          onClick={() => addLog("System: Opening full widget library catalog...")}
                        >
                          View All
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {widgetLibrary.map(widget => (
                          <div 
                            key={widget.id} 
                            onClick={() => addWidgetToPrompt(widget.name)}
                            className="glass p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all border-white/5 hover:border-nexus-accent/30 group relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus size={10} className="text-nexus-accent" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-2 group-hover:bg-nexus-accent/10 transition-colors">
                              <widget.icon size={16} className="text-white/40 group-hover:text-nexus-accent" />
                            </div>
                            <h3 className="text-[11px] font-bold truncate">{widget.name}</h3>
                            <p className="text-[9px] text-white/30 mt-0.5 truncate">{widget.category}</p>
                          </div>
                        ))}
                      </div>
                    </div>
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
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border-b border-nexus-border">
                    <FileCode size={14} className="text-nexus-accent" />
                    <span className="text-xs font-mono text-white/60">{activeFile || 'No file selected'}</span>
                  </div>
                  <div className="flex-1 overflow-auto bg-black/20">
                    {currentFile ? (
                      <SyntaxHighlighter
                        language={currentFile.language || 'typescript'}
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
            <div className={cn(
              "border-t border-nexus-border bg-black/40 backdrop-blur-md flex flex-col transition-all duration-300",
              isTerminalMinimized ? "h-10" : "h-48"
            )}>
              <div className="flex items-center justify-between px-4 py-2 border-b border-nexus-border bg-white/5 cursor-pointer" onClick={() => setIsTerminalMinimized(!isTerminalMinimized)}>
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
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-white/10 rounded transition-colors" onClick={(e) => { e.stopPropagation(); useNexusStore.setState({ logs: [] }); }}><X size={12} /></button>
                  <button className="p-1 hover:bg-white/10 rounded transition-colors">
                    {isTerminalMinimized ? <ChevronDown size={12} /> : <ChevronRight size={12} className="-rotate-90" />}
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
                        Hello! I'm the NEXUS AI Orchestrator. I've been minimized to give you more space for your ecosystem.
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

      {/* --- Feedback Loop Widget --- */}
      <FeedbackWidget />

      {/* --- Global Overlay for Generation --- */}
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
