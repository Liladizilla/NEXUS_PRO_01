import { create } from 'zustand';
import { getContrastColor } from '../lib/utils';

export type AgentStatus = 'idle' | 'queued' | 'thinking' | 'working' | 'completed' | 'error';
export type DeployTarget = 'railway' | 'aws-s3' | 'cloudflare-pages' | 'vercel' | 'netlify' | 'docker';

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
  isTerminalMinimized: boolean;
  isTerminalMaximized: boolean;
  isTerminalClosed: boolean;
  freeApiKey: string | null;
  lastApiKeyReset: number | null;
  deployTarget: DeployTarget;
  theme: 'dark' | 'light' | 'cyberpunk';
  accentColor: string;
  autonomousMode: boolean;
  parallelSynthesis: boolean;
  isHighThinking: boolean;
  notificationsEnabled: boolean;
  previewMode: 'desktop' | 'mobile';
  projectDescription: string;
  projectFramework: string;
  projectLanguage: string;
  stagingUrl: string | null;
  feedback: string;
  userProfile: any | null;
  currentProjectId: string | null;
  userProjects: any[];
  isAuthLoading: boolean;
  githubConnected: boolean;
  githubUser: string | null;
  avatar: string | null;
  templates: any[];
  templateFilter: string;
  selectedTemplate: any | null;
  lintResults: Record<string, { line: number; message: string; severity: 'error' | 'warning' }[]>;
  
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
  setCurrentProjectId: (id: string | null) => void;
  setUserProjects: (projects: any[]) => void;
  saveCurrentProject: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  setIsAuthLoading: (val: boolean) => void;
  setGithubConnected: (val: boolean) => void;
  setGithubUser: (user: string | null) => void;
  setAvatar: (avatar: string | null) => void;
  setPrompt: (prompt: string | ((prev: string) => string)) => void;
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
  setTerminalMinimized: (val: boolean) => void;
  setTerminalMaximized: (val: boolean) => void;
  setTerminalClosed: (val: boolean) => void;
  setApiKeyData: (key: string | null, lastReset: number | null) => void;
  revokeApiKey: () => Promise<void>;
  generateFreeApiKey: () => Promise<void>;
  setTheme: (theme: 'dark' | 'light' | 'cyberpunk') => void;
  setAccentColor: (color: string) => void;
  setAutonomousMode: (val: boolean) => void;
  setParallelSynthesis: (val: boolean) => void;
  setIsHighThinking: (val: boolean) => void;
  setNotificationsEnabled: (val: boolean) => void;
  setPreviewMode: (mode: 'desktop' | 'mobile') => void;
  setTemplates: (templates: any[]) => void;
  setTemplateFilter: (filter: string) => void;
  setSelectedTemplate: (template: any | null) => void;
  setLintResults: (path: string, results: { line: number; message: string; severity: 'error' | 'warning' }[]) => void;
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
  projectName: 'Odyseus Project',
  prompt: '',
  isGenerating: false,
  activeTab: 'design',
  files: [],
  activeFile: null,
  agents: [
    { id: 'architect', name: 'Architect', role: 'System Design', status: 'idle', model: 'Gemini 3.1 Pro' },
    { id: 'frontend', name: 'Frontend', role: 'UI/UX Builder', status: 'idle', model: 'Gemini 3 Flash' },
    { id: 'backend', name: 'Backend', role: 'API & Logic', status: 'idle', model: 'Gemini 3.1 Pro' },
    { id: 'debug', name: 'Debug', role: 'Error Correction', status: 'idle', model: 'Gemini 3 Flash' },
    { id: 'devops', name: 'DevOps', role: 'Deployment', status: 'idle', model: 'Gemini 3.1 Pro' },
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
  isTerminalMinimized: false,
  isTerminalMaximized: false,
  isTerminalClosed: false,
  freeApiKey: null,
  lastApiKeyReset: null,
  deployTarget: 'railway',
  theme: 'dark',
  accentColor: '#00F0FF',
  autonomousMode: true,
  parallelSynthesis: true,
  isHighThinking: false,
  notificationsEnabled: true,
  previewMode: 'desktop',
  projectDescription: 'A high-performance Odyseus ecosystem.',
  projectFramework: 'React + Vite',
  projectLanguage: 'TypeScript',
  stagingUrl: null,
  feedback: '',
  userProfile: null,
  currentProjectId: null,
  userProjects: [],
  isAuthLoading: true,
  githubConnected: false,
  githubUser: null,
  avatar: null,
  templates: [],
  templateFilter: '',
  selectedTemplate: null,
  lintResults: {},
  
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
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  setUserProjects: (projects) => set({ userProjects: projects }),
  saveCurrentProject: async () => {
    const state = get();
    const { auth, saveProject, saveProjectFile, serverTimestamp } = await import('./firebase');
    const user = auth?.currentUser;
    if (!user) return;

    const projectId = state.currentProjectId || `proj_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      await saveProject({
        id: projectId,
        ownerId: user.uid,
        name: state.projectName,
        description: state.projectDescription,
        framework: state.projectFramework,
        language: state.projectLanguage,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Save files efficiently: only if they have content
      for (const file of state.files) {
        if (file.content) {
          await saveProjectFile(projectId, file);
        }
      }

      set({ currentProjectId: projectId });
      state.addLog(`System: Project "${state.projectName}" saved successfully.`);
    } catch (error) {
      state.addLog(`Error: Failed to save project. ${error instanceof Error ? error.message : ''}`);
    }
  },
  loadProject: async (id) => {
    const state = get();
    const { loadProjectFiles } = await import('./firebase');
    
    try {
      const project = state.userProjects.find(p => p.id === id);
      if (!project) throw new Error("Project not found");

      const files = await loadProjectFiles(id);
      
      set({
        currentProjectId: id,
        projectName: project.name,
        projectDescription: project.description,
        projectFramework: project.framework,
        projectLanguage: project.language,
        files: files,
        activeFile: files.length > 0 ? files[0].path : null,
        activeTab: 'code'
      });
      
      state.addLog(`System: Project "${project.name}" loaded.`);
    } catch (error) {
      state.addLog(`Error: Failed to load project. ${error instanceof Error ? error.message : ''}`);
    }
  },
  setIsAuthLoading: (val) => set({ isAuthLoading: val }),
  setGithubConnected: (val) => set({ githubConnected: val }),
  setGithubUser: (user) => set({ githubUser: user }),
  setAvatar: (avatar) => set({ avatar }),
  setPrompt: (prompt) => set((state) => ({ 
    prompt: typeof prompt === 'function' ? prompt(state.prompt) : prompt 
  })),
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
  logout: () => set({ isAuthenticated: false, user: null, isPro: false, isEnterprise: false, usageLimit: 3, userProjects: [], currentProjectId: null }),
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
  setTerminalMinimized: (val) => set({ isTerminalMinimized: val, isTerminalMaximized: false }),
  setTerminalMaximized: (val) => set({ isTerminalMaximized: val, isTerminalMinimized: false }),
  setTerminalClosed: (val) => set({ isTerminalClosed: val }),
  setApiKeyData: (key, lastReset) => set({ freeApiKey: key, lastApiKeyReset: lastReset }),
  revokeApiKey: async () => {
const { auth, db, doc, setDoc, serverTimestamp } = await import('./firebase');
    const user = auth?.currentUser;
    if (!user || !db) return;

    try {
      const keyRef = doc(db, 'api_keys', user.uid);
      await setDoc(keyRef, {
        key: null,
        lastGeneratedAt: serverTimestamp()
      }, { merge: true });
      set({ freeApiKey: null });
      get().addLog("Security: API key revoked successfully.");
    } catch (error) {
      get().addLog(`Security Error: ${error instanceof Error ? error.message : 'Failed to revoke key'}`);
    }
  },
  generateFreeApiKey: async () => {
    const state = get();
    if (!state.isPro && !state.isEnterprise) {
      set({ showPaywall: true });
      state.addLog("Security: Daily Free API Keys are exclusive to Pro and Enterprise tiers.");
      return;
    }

    const { auth, generateUserApiKey } = await import('./firebase');
    const user = auth?.currentUser;
    if (!user) return;
    
    const lastReset = get().lastApiKeyReset;
    if (lastReset && Date.now() - lastReset < 24 * 60 * 60 * 1000) {
      get().addLog("Security: You can only generate one API key every 24 hours.");
      return;
    }

    try {
      const newKey = await generateUserApiKey(user.uid);
      if (newKey) {
        set({ freeApiKey: newKey, lastApiKeyReset: Date.now() });
        get().addLog("Security: New global API key generated successfully.");
      }
    } catch (error) {
      get().addLog(`Security Error: ${error instanceof Error ? error.message : 'Failed to generate key'}`);
    }
  },
  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  setAccentColor: (color) => {
    // Map color to CSS variable name
    const colorMap: Record<string, string> = {
      '#00f2ff': 'cyan',
      '#a855f7': 'purple',
      '#ec4899': 'pink',
      '#3b82f6': 'blue',
      '#10b981': 'green',
    };
    
    const colorName = colorMap[color.toLowerCase()] || 'cyan';
    document.documentElement.setAttribute('data-accent-color', colorName);
    document.documentElement.style.setProperty('--nexus-accent', color);
    document.documentElement.style.setProperty('--nexus-accent-contrast', getContrastColor(color));
    set({ accentColor: color });
  },
  setAutonomousMode: (val) => set({ autonomousMode: val }),
  setParallelSynthesis: (val) => set({ parallelSynthesis: val }),
  setIsHighThinking: (val) => set({ isHighThinking: val }),
  setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  setTemplates: (templates) => set({ templates }),
  setTemplateFilter: (filter) => set({ templateFilter: filter }),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  setLintResults: (path, results) => set((state) => ({
    lintResults: { ...state.lintResults, [path]: results }
  })),
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
    debugState: { ...state.debugState, variables: { ...state.debugState.variables, ...vars } } 
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
    const cmd = expr.trim().toLowerCase();
    
    // Handle Commands
    if (cmd === 'help') {
      set((state) => ({
        debugState: { 
          ...state.debugState, 
          logs: [...state.debugState.logs, `> ${expr}`, "Available commands: help, clear, status, mesh, agents, build, deploy, lint, format, reset"] 
        }
      }));
      return;
    }
    
    if (cmd === 'clear') {
      set((state) => ({
        debugState: { ...state.debugState, logs: [] }
      }));
      return;
    }

    if (cmd === 'status') {
      set((state) => ({
        debugState: { 
          ...state.debugState, 
          logs: [...state.debugState.logs, `> ${expr}`, `System Status: STABLE | Mesh: ONLINE | Agents: ${state.agents.length} active`] 
        }
      }));
      return;
    }

    if (cmd === 'mesh') {
      set((state) => ({
        debugState: { 
          ...state.debugState, 
          logs: [...state.debugState.logs, `> ${expr}`, "Mesh Connectivity: 100% | Latency: 12ms | Nodes: 5"] 
        }
      }));
      return;
    }

    if (cmd === 'agents') {
      const agentList = state.agents.map(a => `${a.name} (${a.status})`).join(', ');
      set((state) => ({
        debugState: { 
          ...state.debugState, 
          logs: [...state.debugState.logs, `> ${expr}`, `Active Agents: ${agentList}`] 
        }
      }));
      return;
    }

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
    projectName: 'Odyseus Project',
    projectDescription: 'A high-performance Odyseus ecosystem.',
    projectFramework: 'React + Vite',
    projectLanguage: 'TypeScript',
    stagingUrl: null,
    feedback: '',
    prompt: '',
    isGenerating: false,
    activeTab: 'design',
    files: [],
    activeFile: null,
    currentProjectId: null,
    logs: ['System reset.'],
    deployTarget: 'railway',
    showPaywall: false,
    showSettings: false,
    showAssetManager: false,
    showTemplateSearch: false,
    showTaskModal: false,
    showHistory: false,
    agents: [
      { id: 'architect', name: 'Architect', role: 'System Design', status: 'idle', model: 'Gemini 3.1 Pro' },
      { id: 'frontend', name: 'Frontend', role: 'UI/UX Builder', status: 'idle', model: 'Gemini 3 Flash' },
      { id: 'backend', name: 'Backend', role: 'API & Logic', status: 'idle', model: 'Gemini 3.1 Pro' },
      { id: 'debug', name: 'Debug', role: 'Error Correction', status: 'idle', model: 'Gemini 3 Flash' },
      { id: 'devops', name: 'DevOps', role: 'Deployment', status: 'idle', model: 'Gemini 3.1 Pro' },
    ],
  }),
}));
