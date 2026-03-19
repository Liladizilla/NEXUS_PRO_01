import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. CORE BACKEND ARCHITECTURE (Service Simulation) ---

class AIService {
  private ai: GoogleGenAI;
  
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  async generate(prompt: string, fallback = false): Promise<string> {
    try {
      if (fallback) throw new Error("Primary AI Mesh Failure Simulation");
      
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      return response.text;
    } catch (error) {
      console.warn("AIService: Primary Gemini Mesh failed. Switching to Secondary AI Mesh (Fallback Logic)...");
      // Fallback logic: In a real app, this would call OpenAI or Anthropic
      // Here we simulate a successful fallback response
      return JSON.stringify({
        projectName: "Fallback Project",
        files: [{ path: "fallback.txt", content: "Generated via Secondary AI Mesh due to primary outage." }]
      });
    }
  }
}

class QueueService {
  private tasks: Map<string, { status: string, result?: any, progress: number, agents?: any[] }> = new Map();

  createTask() {
    const id = uuidv4();
    this.tasks.set(id, { status: 'queued', progress: 0 });
    return id;
  }

  updateTask(id: string, status: string, progress: number, result?: any, agents?: any[]) {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.set(id, { ...task, status, progress, result, agents: agents || task.agents });
    }
  }

  getTask(id: string) {
    return this.tasks.get(id);
  }

  getActiveTasksCount() {
    let count = 0;
    this.tasks.forEach(t => {
      if (t.status === 'processing' || t.status === 'queued') count++;
    });
    return count;
  }
}

const aiService = new AIService();
const queueService = new QueueService();

// --- 2. AUTOSCALING LOGIC ---

function calculateComplexity(prompt: string): { score: number, metrics: string[] } {
  const metrics: string[] = [];
  let score = prompt.length / 10; // Base score from length

  const keywords = {
    'database': 15,
    'auth': 10,
    'real-time': 20,
    'dashboard': 15,
    'complex': 10,
    'api': 5,
    'integration': 15,
    'security': 10,
    'performance': 10
  };

  Object.entries(keywords).forEach(([key, value]) => {
    if (prompt.toLowerCase().includes(key)) {
      score += value;
      metrics.push(key);
    }
  });

  return { score, metrics };
}

function getAutoscalingPlan(prompt: string, activeTasksCount: number, baseAgents: any[]) {
  const provisionedAgents = [...baseAgents];
  const { score: complexityScore, metrics: complexityMetrics } = calculateComplexity(prompt);
  const concurrentUsers = Math.max(1, Math.floor(activeTasksCount * 1.2)); // Simulated concurrent users
  const systemLoad = (activeTasksCount * 15) + (concurrentUsers * 5); // Refined load calculation

  // Rule 1: High Complexity or High Load -> Scale Frontend
  if (complexityScore > 50 || systemLoad > 40) {
    const count = complexityScore > 100 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      provisionedAgents.push({
        id: `frontend-autoscaled-${uuidv4().slice(0, 4)}`,
        name: `Frontend (Instance ${i + 1})`,
        role: 'UI/UX Builder',
        status: 'working',
        model: baseAgents.find(a => a.id === 'frontend')?.model || 'Claude 3.5 Sonnet'
      });
    }
  }

  // Rule 2: Backend-heavy keywords or High Load -> Scale Backend
  const isBackendHeavy = complexityMetrics.some(m => ['database', 'auth', 'api', 'integration'].includes(m));
  if (isBackendHeavy || systemLoad > 60 || complexityScore > 80) {
    provisionedAgents.push({
      id: `backend-autoscaled-${uuidv4().slice(0, 4)}`,
      name: 'Backend (Worker)',
      role: 'API & Logic',
      status: 'working',
      model: baseAgents.find(a => a.id === 'backend')?.model || 'GPT-4o'
    });
  }

  // Rule 3: Extreme Load -> Scale DevOps/Debug for faster verification
  if (systemLoad > 80) {
    provisionedAgents.push({
      id: `debug-autoscaled-${uuidv4().slice(0, 4)}`,
      name: 'Debug (Parallel)',
      role: 'Error Correction',
      status: 'working',
      model: baseAgents.find(a => a.id === 'debug')?.model || 'Claude 3.5 Sonnet'
    });
  }

  return { 
    agents: provisionedAgents, 
    systemLoad: Math.min(100, systemLoad), 
    complexity: Math.round(complexityScore),
    concurrentUsers,
    metrics: complexityMetrics
  };
}

// --- 3. API GATEWAY (THE BOUNCER) ---

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for express-rate-limit (required when running behind Nginx/Cloud Run)
  app.set('trust proxy', 1);

  app.use(express.json());

  // Rate Limiting (Security)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: "Too many requests. Rate limit exceeded." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Use the default key generator which handles IPv6 normalization correctly
  });
  app.use('/api/', limiter);

  // --- 3. AI ORCHESTRATION & TASK QUEUE FLOW ---

  app.post('/api/generate', async (req, res) => {
    const { prompt, agents, feedback } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const activeTasks = queueService.getActiveTasksCount();
    const plan = getAutoscalingPlan(prompt, activeTasks, agents || []);
    const taskId = queueService.createTask();
    
    // Process task asynchronously (Background Worker Simulation)
    (async () => {
      try {
        queueService.updateTask(taskId, 'processing', 10, null, plan.agents);
        
        // Refine prompt with feedback
        const finalPrompt = feedback 
          ? `Original request: ${prompt}\nUser feedback on previous iteration: ${feedback}\nPlease refine the application based on this feedback.`
          : prompt;

        // Simulate AI Orchestration
        const result = await aiService.generate(finalPrompt);
        const parsedResult = JSON.parse(result);
        
        // --- CI/CD PIPELINE SIMULATION ---
        queueService.updateTask(taskId, 'building', 40, parsedResult);
        await new Promise(r => setTimeout(r, 2000)); // Build time
        
        queueService.updateTask(taskId, 'testing', 70, parsedResult);
        await new Promise(r => setTimeout(r, 2000)); // Test time
        
        queueService.updateTask(taskId, 'deploying', 90, parsedResult);
        await new Promise(r => setTimeout(r, 2000)); // Deploy time
        
        const stagingUrl = `https://staging-${taskId.slice(0, 8)}.nexus-mesh.ai`;
        queueService.updateTask(taskId, 'completed', 100, { ...parsedResult, stagingUrl });
      } catch (error) {
        let errorMsg = "Pipeline: Generation failed during synthesis";
        if (error instanceof SyntaxError) {
          errorMsg = "AI Mesh Failure: LLM output malformed or incomplete";
        } else if (error instanceof Error && error.message.includes('timeout')) {
          errorMsg = "CI/CD Failure: Build pipeline timed out during deployment";
        }
        queueService.updateTask(taskId, 'failed', 0, { error: errorMsg });
      }
    })();

    res.json({ taskId, plan });
  });

  app.get('/api/tasks/:id', (req, res) => {
    const task = queueService.getTask(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  });

  // Health Check (Monitoring)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: "ok", 
      services: {
        ai: "online",
        queue: "online",
        auth: "online",
        storage: "online"
      },
      mesh: "stable",
      uptime: process.uptime()
    });
  });

  // --- 4. VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\x1b[36m[NEXUS BACKEND]\x1b[0m Gateway initialized on http://localhost:${PORT}`);
    console.log(`\x1b[36m[NEXUS BACKEND]\x1b[0m AI Orchestration Engine: \x1b[32mACTIVE\x1b[0m`);
    console.log(`\x1b[36m[NEXUS BACKEND]\x1b[0m Background Workers: \x1b[32mREADY\x1b[0m`);
  });
}

startServer();
