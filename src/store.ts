import { create } from 'zustand';

export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';
export type DeployTarget = 'railway' | 'aws-s3' | 'cloudflare-pages';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  lastAction?: string;
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
  activeTab: 'design' | 'code' | 'preview';
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
  
  setProjectName: (name: string) => void;
  setProjectDescription: (desc: string) => void;
  setProjectFramework: (framework: string) => void;
  setProjectLanguage: (lang: string) => void;
  setPrompt: (prompt: string) => void;
  setIsGenerating: (val: boolean) => void;
  setActiveTab: (tab: 'design' | 'code' | 'preview') => void;
  setFiles: (files: ProjectFile[]) => void;
  setActiveFile: (path: string | null) => void;
  addLog: (log: string) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
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
  reset: () => void;
}

export const useNexusStore = create<NexusState>((set) => ({
  projectName: 'Untitled Project',
  prompt: '',
  isGenerating: false,
  activeTab: 'design',
  files: [],
  activeFile: null,
  agents: [
    { id: 'architect', name: 'Architect', role: 'System Design', status: 'idle' },
    { id: 'frontend', name: 'Frontend', role: 'UI/UX Builder', status: 'idle' },
    { id: 'backend', name: 'Backend', role: 'API & Logic', status: 'idle' },
    { id: 'debug', name: 'Debug', role: 'Error Correction', status: 'idle' },
    { id: 'devops', name: 'DevOps', role: 'Deployment', status: 'idle' },
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
  
  setProjectName: (name) => set({ projectName: name }),
  setProjectDescription: (desc) => set({ projectDescription: desc }),
  setProjectFramework: (framework) => set({ projectFramework: framework }),
  setProjectLanguage: (lang) => set({ projectLanguage: lang }),
  setPrompt: (prompt) => set({ prompt }),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFiles: (files) => set({ files }),
  setActiveFile: (path) => set({ activeFile: path }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, `[${new Date().toLocaleTimeString()}] ${log}`] })),
  updateAgent: (id, updates) => set((state) => ({
    agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
  })),
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
  setAccentColor: (color) => set({ accentColor: color }),
  setAutonomousMode: (val) => set({ autonomousMode: val }),
  setParallelSynthesis: (val) => set({ parallelSynthesis: val }),
  setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  reset: () => set({
    projectName: 'Untitled Project',
    projectDescription: 'A high-performance software ecosystem.',
    projectFramework: 'React + Vite',
    projectLanguage: 'TypeScript',
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
      { id: 'architect', name: 'Architect', role: 'System Design', status: 'idle' },
      { id: 'frontend', name: 'Frontend', role: 'UI/UX Builder', status: 'idle' },
      { id: 'backend', name: 'Backend', role: 'API & Logic', status: 'idle' },
      { id: 'debug', name: 'Debug', role: 'Error Correction', status: 'idle' },
      { id: 'devops', name: 'DevOps', role: 'Deployment', status: 'idle' },
    ],
  }),
}));
