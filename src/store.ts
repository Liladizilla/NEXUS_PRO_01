import { create } from 'zustand';
import { getContrastColor } from './lib/utils';

export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';
export type DeployTarget = 'railway' | 'aws-s3' | 'cloudflare-pages';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  lastAction?: string;
  model: string;
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

interface NexusState {
  projectName: string;
  prompt: string;
  isGenerating: boolean;
  activeTab: 'design' | 'code' | 'preview' | 'debug';
  files: ProjectFile[];
  activeFile: string | null;
  agents: Agent[];
  logs: string[];
  isAuthenticated: boolean;
  user: { email: string } | null;
  usageCount: number;
  usageLimit: number;
  isPro: boolean;
  isEnterprise: boolean;
  showPaywall: boolean;
  showSettings: boolean;
  showAssetManager: boolean;
  showTemplateSearch: boolean;
  showTaskModal: boolean;
  showHistory: boolean;
  deployTarget: DeployTarget;
  theme: 'dark' | 'light' | 'cyberpunk';
  accentColor: string;
  autonomousMode: boolean;
  parallelSynthesis: boolean;
  notificationsEnabled: boolean;
  previewMode: 'desktop' | 'mobile';
  projectDescription: string;
  projectFramework: string;
  projectLanguage: string;
  stagingUrl: string | null;
  feedback: string;
  userProfile: any | null;
  templates: any[];
  templateFilter: string;
  selectedTemplate: any | null;
  
  // Debugger State
  debugState: {
    isActive: boolean;
    currentLine: number;
    breakpoints: number[];
    variables: Record<string, any>;
    callStack: { name: string; line: number }[];
    logs: string[];
    error: string | null;
  };
  
  setProjectName: (name: string) => void;
  setProjectDescription: (desc: string) => void;
  setProjectFramework: (framework: string) => void;
  setProjectLanguage: (lang: string) => void;
  setStagingUrl: (url: string | null) => void;
  setFeedback: (feedback: string) => void;
  setUserProfile: (profile: any | null) => void;
  setPrompt: (prompt: string) => void;
  setIsGenerating: (val: boolean) => void;
  setActiveTab: (tab: 'design' | 'code' | 'preview' | 'debug') => void;
  setFiles: (files: ProjectFile[]) => void;
  setActiveFile: (path: string | null) => void;
  addLog: (log: string) => void;
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  setAgentModel: (id: string, model: string) => void;
  addAgent: (agent: Agent) => void;
  login: (email: string) => void;
  logout: () => void;
  incrementUsage: () => void;
  setSubscription: (tier: 'free' | 'pro' | 'enterprise') => void;
  setDeployTarget: (target: DeployTarget) => void;
  setShowPaywall: (val: boolean) => void;
  setShowSettings: (val: boolean) => void;
  setShowAssetManager: (val: boolean) => void;
  setShowTemplateSearch: (val: boolean) => void;
  setShowTaskModal: (val: boolean) => void;
  setShowHistory: (val: boolean) => void;
  setTheme: (theme: 'dark' | 'light' | 'cyberpunk') => void;
  setAccentColor: (color: string) => void;
  setAutonomousMode: (val: boolean) => void;
  setParallelSynthesis: (val: boolean) => void;
  setNotificationsEnabled: (val: boolean) => void;
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  setTemplates: (templates: any[]) => void;
  setTemplateFilter: (filter: string) => void;
  setSelectedTemplate: (template: any | null) => void;
  fetchTemplates: () => Promise<void>;
  
  // Debugger Actions
  setDebugActive: (active: boolean) => void;
  setCurrentLine: (line: number) => void;
  toggleBreakpoint: (line: number) => void;
  setDebugVariables: (vars: Record<string, any>) => void;
  addDebugLog: (log: string) => void;
  stepOver: () => void;
  stepInto: () => void;
  stepOut: () => void;
  resume: () => void;
  evaluateExpression: (expr: string) => void;
  
  reset: () => void;
}

export const useNexusStore = create<NexusState>((set, get) => ({
  projectName: 'Untitled Project',
  prompt: '',
  isGenerating: false,
  activeTab: 'design',
  files: [],
  activeFile: null,
  agents: [
    { id: 'architect', name: 'Architect', role: 'System Design', status: 'idle', model: 'Gemini 1.5 Pro' },
    { id: 'frontend', name: 'Frontend', role: 'UI/UX Builder', status: 'idle', model: 'Claude 3.5 Sonnet' },
    { id: 'backend', name: 'Backend', role: 'API & Logic', status: 'idle', model: 'GPT-4o' },
    { id: 'debug', name: 'Debug', role: 'Error Correction', status: 'idle', model: 'Claude 3.5 Sonnet' },
    { id: 'devops', name: 'DevOps', role: 'Deployment', status: 'idle', model: 'GPT-4o' },
  ],
  logs: ['System initialized. Ready for input.'],
  isAuthenticated: false,
  user: null,
  usageCount: 0,
  usageLimit: 3, // Free tier limit
  isPro: false,
  isEnterprise: false,
  showPaywall: false,
  showSettings: false,
  showAssetManager: false,
  showTemplateSearch: false,
  showTaskModal: false,
  showHistory: false,
  deployTarget: 'railway',
  theme: 'dark',
  accentColor: '#00F0FF',
  autonomousMode: true,
  parallelSynthesis: true,
  notificationsEnabled: true,
  previewMode: 'desktop',
  projectDescription: 'A high-performance software ecosystem.',
  projectFramework: 'React + Vite',
  projectLanguage: 'TypeScript',
  stagingUrl: null,
  feedback: '',
  userProfile: null,
  templates: [],
  templateFilter: '',
  selectedTemplate: null,
  
  debugState: {
    isActive: false,
    currentLine: 0,
    breakpoints: [],
    variables: {},
    callStack: [],
    logs: [],
    error: null,
  },
  
  setProjectName: (name) => set({ projectName: name }),
  setProjectDescription: (desc) => set({ projectDescription: desc }),
  setProjectFramework: (framework) => set({ projectFramework: framework }),
  setProjectLanguage: (lang) => set({ projectLanguage: lang }),
  setStagingUrl: (url) => set({ stagingUrl: url }),
  setFeedback: (feedback) => set({ feedback }),
  setUserProfile: (profile) => set({ userProfile: profile }),
  setPrompt: (prompt) => set({ prompt }),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFiles: (files) => set({ files }),
  setActiveFile: (path) => set({ activeFile: path }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, `[${new Date().toLocaleTimeString()}] ${log}`] })),
  updateAgent: (id, updates) => set((state) => ({
    agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
  })),
  setAgentModel: (id, model) => set((state) => ({
    agents: state.agents.map((a) => (a.id === id ? { ...a, model } : a)),
  })),
  setAgents: (agents) => set({ agents }),
  addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
  login: (email) => set({ isAuthenticated: true, user: { email } }),
  logout: () => set({ isAuthenticated: false, user: null, isPro: false, isEnterprise: false, usageLimit: 3 }),
  incrementUsage: () => set((state) => {
    const newCount = state.usageCount + 1;
    const shouldShowPaywall = newCount >= state.usageLimit;
    return { 
      usageCount: newCount,
      showPaywall: shouldShowPaywall
    };
  }),
  setSubscription: (tier) => set({ 
    isPro: tier === 'pro', 
    isEnterprise: tier === 'enterprise',
    usageLimit: tier === 'free' ? 3 : (tier === 'pro' ? 100 : 999999),
    showPaywall: false 
  }),
  setDeployTarget: (target) => set({ deployTarget: target }),
  setShowPaywall: (val) => set({ showPaywall: val }),
  setShowSettings: (val) => set({ showSettings: val }),
  setShowAssetManager: (val) => set({ showAssetManager: val }),
  setShowTemplateSearch: (val) => set({ showTemplateSearch: val }),
  setShowTaskModal: (val) => set({ showTaskModal: val }),
  setShowHistory: (val) => set({ showHistory: val }),
  setTheme: (theme) => set({ theme }),
  setAccentColor: (color) => {
    document.documentElement.style.setProperty('--nexus-accent', color);
    document.documentElement.style.setProperty('--nexus-accent-contrast', getContrastColor(color));
    set({ accentColor: color });
  },
  setAutonomousMode: (val) => set({ autonomousMode: val }),
  setParallelSynthesis: (val) => set({ parallelSynthesis: val }),
  setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setTemplates: (templates) => set({ templates }),
  setTemplateFilter: (filter) => set({ templateFilter: filter }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  fetchTemplates: async () => {
    // Simulate API fetch
    await new Promise(r => setTimeout(r, 1000));
    const mockTemplates = [
      { id: 'ecommerce', title: 'E-commerce Store', description: 'A full-featured online store with product listings, cart, and checkout.', prompt: 'Build a modern e-commerce platform...', category: 'Web', icon: 'ShoppingBag', color: 'text-blue-400' },
      { id: 'social', title: 'Social Media App', description: 'A social platform with user profiles, feed, and real-time interactions.', prompt: 'Build a social media app...', category: 'Web', icon: 'Users', color: 'text-purple-400' },
      { id: 'dashboard', title: 'Enterprise Dashboard', description: 'A data-rich dashboard with analytics, charts, and user management.', prompt: 'Build an enterprise dashboard...', category: 'Enterprise', icon: 'LayoutDashboard', color: 'text-emerald-400' },
      { id: 'ai-chat', title: 'AI Assistant', description: 'A conversational AI interface with streaming responses and history.', prompt: 'Build an AI assistant...', category: 'AI', icon: 'Bot', color: 'text-orange-400' },
      { id: 'portfolio', title: 'Creative Portfolio', description: 'A minimalist portfolio for designers and developers.', prompt: 'Build a creative portfolio...', category: 'Web', icon: 'Palette', color: 'text-pink-400' },
      { id: 'mobile-fitness', title: 'Fitness Tracker', description: 'A mobile-first fitness app with workout plans and progress tracking.', prompt: 'Build a fitness tracker...', category: 'Mobile', icon: 'Dumbbell', color: 'text-rose-400' },
    ];
    set({ templates: mockTemplates });
  },
  
  setDebugActive: (active) => set((state) => ({ 
    debugState: { ...state.debugState, isActive: active } 
  })),
  setCurrentLine: (line) => set((state) => ({ 
    debugState: { ...state.debugState, currentLine: line } 
  })),
  toggleBreakpoint: (line) => set((state) => ({ 
    debugState: { 
      ...state.debugState, 
      breakpoints: state.debugState.breakpoints.includes(line)
        ? state.debugState.breakpoints.filter(b => b !== line)
        : [...state.debugState.breakpoints, line]
    } 
  })),
  setDebugVariables: (vars) => set((state) => ({ 
    debugState: { ...state.debugState, variables: vars } 
  })),
  addDebugLog: (log) => set((state) => ({ 
    debugState: { ...state.debugState, logs: [...state.debugState.logs, log] } 
  })),
  stepOver: () => set((state) => {
    const nextLine = state.debugState.currentLine + 1;
    const currentFile = state.files.find(f => f.path === state.activeFile);
    const lines = currentFile?.content.split('\n') || [];
    
    if (nextLine > lines.length) {
      return { debugState: { ...state.debugState, isActive: false, currentLine: 0 } };
    }

    // Check for breakpoint
    if (state.debugState.breakpoints.includes(nextLine)) {
      set({ activeTab: 'debug' });
    }

    // Simulate variable changes based on "code"
    const lineContent = lines[nextLine - 1]?.trim();
    let newVars = { ...state.debugState.variables };
    if (lineContent?.includes('const') || lineContent?.includes('let') || lineContent?.includes('var')) {
      const match = lineContent.match(/(?:const|let|var)\s+(\w+)\s*=/);
      if (match) {
        newVars[match[1]] = Math.floor(Math.random() * 100); // Mock value
      }
    }

    return { 
      debugState: { ...state.debugState, currentLine: nextLine, variables: newVars } 
    };
  }),
  stepInto: () => set((state) => {
    const nextLine = state.debugState.currentLine + 1;
    const newStack = [...state.debugState.callStack, { name: 'anonymous_func', line: state.debugState.currentLine }];
    return {
      debugState: { ...state.debugState, currentLine: nextLine, callStack: newStack }
    };
  }),
  stepOut: () => set((state) => {
    const lastFrame = state.debugState.callStack[state.debugState.callStack.length - 1];
    const newStack = state.debugState.callStack.slice(0, -1);
    return {
      debugState: { ...state.debugState, currentLine: lastFrame?.line || 0, callStack: newStack }
    };
  }),
  resume: () => set((state) => {
    const currentFile = state.files.find(f => f.path === state.activeFile);
    const lines = currentFile?.content.split('\n') || [];
    let nextLine = state.debugState.currentLine + 1;
    
    // Find next breakpoint
    while (nextLine <= lines.length && !state.debugState.breakpoints.includes(nextLine)) {
      nextLine++;
    }

    if (nextLine > lines.length) {
      return { debugState: { ...state.debugState, isActive: false, currentLine: 0 } };
    }

    return { 
      debugState: { ...state.debugState, currentLine: nextLine } 
    };
  }),
  evaluateExpression: (expr: string) => {
    const state = get();
    try {
      // In a real app, we'd use a sandbox. Here we mock it.
      const result = state.debugState.variables[expr] !== undefined 
        ? state.debugState.variables[expr] 
        : `Error: '${expr}' is not defined in current scope`;
      set((state) => ({
        debugState: { ...state.debugState, logs: [...state.debugState.logs, `> ${expr}`, String(result)] }
      }));
    } catch (e) {
      set((state) => ({
        debugState: { ...state.debugState, logs: [...state.debugState.logs, `> ${expr}`, `Error: ${e}`] }
      }));
    }
  },

  reset: () => set({
    projectName: 'Untitled Project',
    projectDescription: 'A high-performance software ecosystem.',
    projectFramework: 'React + Vite',
    projectLanguage: 'TypeScript',
    stagingUrl: null,
    feedback: '',
    prompt: '',
    isGenerating: false,
    activeTab: 'design',
    files: [],
    activeFile: null,
    logs: ['System reset.'],
    deployTarget: 'railway',
    showPaywall: false,
    showSettings: false,
    showAssetManager: false,
    showTemplateSearch: false,
    showTaskModal: false,
    showHistory: false,
    agents: [
      { id: 'architect', name: 'Architect', role: 'System Design', status: 'idle', model: 'Gemini 1.5 Pro' },
      { id: 'frontend', name: 'Frontend', role: 'UI/UX Builder', status: 'idle', model: 'Claude 3.5 Sonnet' },
      { id: 'backend', name: 'Backend', role: 'API & Logic', status: 'idle', model: 'GPT-4o' },
      { id: 'debug', name: 'Debug', role: 'Error Correction', status: 'idle', model: 'Claude 3.5 Sonnet' },
      { id: 'devops', name: 'DevOps', role: 'Deployment', status: 'idle', model: 'GPT-4o' },
    ],
  }),
}));
