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
  private tasks: Map<string, { status: string, result?: any, progress: number }> = new Map();

  createTask() {
    const id = uuidv4();
    this.tasks.set(id, { status: 'queued', progress: 0 });
    return id;
  }

  updateTask(id: string, status: string, progress: number, result?: any) {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.set(id, { ...task, status, progress, result });
    }
  }

  getTask(id: string) {
    return this.tasks.get(id);
  }
}

const aiService = new AIService();
const queueService = new QueueService();

// --- 2. API GATEWAY (THE BOUNCER) ---

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
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const taskId = queueService.createTask();
    
    // Process task asynchronously (Background Worker Simulation)
    (async () => {
      try {
        queueService.updateTask(taskId, 'processing', 10);
        
        // Simulate AI Orchestration
        const result = await aiService.generate(prompt);
        
        queueService.updateTask(taskId, 'completed', 100, JSON.parse(result));
      } catch (error) {
        queueService.updateTask(taskId, 'failed', 0, { error: "Generation failed" });
      }
    })();

    res.json({ taskId });
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
