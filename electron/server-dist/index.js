import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { rateLimit } from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
// Use the CJS dist entry for Firebase to avoid ESM resolution issues in this Node environment
// Firebase imports removed to avoid package export resolution issues during development.
// We'll dynamically import Firebase only when a config is present AND in production.
import { readFileSync } from 'fs';
import { AIService } from './services/ai.service.js';
import { QueueService } from './services/queue.service.js';
dotenv.config();
// --- 0. FIREBASE INITIALIZATION ---
let db = null;
try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    const firebaseConfig = JSON.parse(readFileSync(configPath, 'utf8'));
    if (firebaseConfig && firebaseConfig.projectId) {
        if (process.env.NODE_ENV === 'production') {
            void (async () => {
                try {
                    const { initializeApp } = await import('firebase/app');
                    const { getFirestore } = await import('firebase/firestore');
                    const app = initializeApp(firebaseConfig);
                    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
                    console.log(`\x1b[36m[ODYSEUS BACKEND]\x1b[0m Firestore initialized: \x1b[32mSUCCESS\x1b[0m`);
                }
                catch (err) {
                    console.warn("\x1b[33m[ODYSEUS BACKEND]\x1b[0m Firebase import failed. Task persistence disabled.", err);
                }
            })();
        }
        else {
            console.log('\x1b[36m[ODYSEUS BACKEND]\x1b[0m Skipping Firebase initialization in development.');
        }
    }
}
catch (error) {
    console.warn("\x1b[33m[ODYSEUS BACKEND]\x1b[0m Firebase config missing or invalid. Task persistence disabled.", error);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- 1. CORE BACKEND ARCHITECTURE (Service Simulation) ---
const aiService = new AIService();
const queueService = new QueueService(db);
// --- 2. AUTOSCALING LOGIC ---
function calculateComplexity(prompt) {
    const metrics = [];
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
function getAutoscalingPlan(prompt, activeTasksCount, baseAgents) {
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
    const isBackendHeavy = complexityMetrics.some(m => m === 'database' || m === 'auth' || m === 'api' || m === 'integration');
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
export const app = express();
const PORT = 3000;
// Trust proxy for express-rate-limit (required when running behind Nginx/Cloud Run/Vercel)
app.set('trust proxy', 1);
// Security Headers (Helmet + Custom)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://*.googleapis.com", "https://*.gstatic.com", "https://*.firebaseapp.com", "https://*.google.com"],
            connectSrc: ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com", "https://*.google.com", "wss://*.run.app", "https://*.run.app", "https://api.github.com"],
            imgSrc: ["'self'", "data:", "https:", "https://*.picsum.photos", "https://*.googleusercontent.com", "https://*.githubusercontent.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            frameSrc: ["'self'", "https://*.firebaseapp.com", "https://*.google.com"],
            frameAncestors: ["'self'", "https://*.google.com", "https://*.run.app"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
        },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xFrameOptions: { action: 'sameorigin' },
    xContentTypeOptions: true,
}));
// Additional custom security headers
app.use((req, res, next) => {
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self), fullscreen=(self), payment=()');
    next();
});
// Performance: Enable compression
app.use(compression());
// Performance: Increase body parser limits for larger project structures
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Rate Limiting (Security) - Tiered Approach
// Global rate limiter - stricter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 requests per 15 min (~2 per minute)
    message: { error: "Too many requests. Rate limit exceeded." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/api/health', // Skip health checks
});
// Strict limiter for expensive operations
const generateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 5, // limit each IP to 5 requests per minute for /api/generate
    message: { error: "Too many generation requests. Please wait before requesting another generation." },
    standardHeaders: true,
    legacyHeaders: false,
});
// Standard limiter for other APIs
const standardLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute for standard endpoints
    message: { error: "Rate limit exceeded. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply global limiter to all /api routes except health
app.use('/api/', globalLimiter);
// Apply strict limiter to expensive generation endpoint
app.use('/api/generate', generateLimiter);
// Apply standard limiter to task queries
app.use('/api/tasks/', standardLimiter);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
// --- 3. AI ORCHESTRATION & TASK QUEUE FLOW ---
// --- 3.1 GITHUB OAUTH FLOW ---
app.get('/api/auth/github/url', (req, res) => {
    const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/github/callback`;
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID || '',
        redirect_uri: redirectUri,
        scope: 'repo,user',
        state: uuidv4(),
    });
    res.json({ url: `https://github.com/login/oauth/authorize?${params}` });
});
app.get('/api/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    if (!code)
        return res.status(400).send('Code is required');
    try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.error)
            throw new Error(tokenData.error_description);
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${tokenData.access_token}`,
                'Accept': 'application/json',
            },
        });
        const userData = await userRes.json();
        // In a real app, you'd store the token in Firestore associated with the user
        // For this prototype, we'll just send a success message to the parent window
        res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                provider: 'github',
                user: '${userData.login}'
              }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>GitHub connected successfully. This window should close automatically.</p>
        </body>
      </html>
    `);
    }
    catch (error) {
        console.error('GitHub OAuth Error:', error);
        res.status(500).send('Authentication failed');
    }
});
app.post('/api/generate', async (req, res) => {
    const { prompt, agents, feedback, isHighThinking, agentModels, result: clientResult, skipProcessing } = req.body;
    if (!prompt && !skipProcessing)
        return res.status(400).json({ error: "Prompt is required" });
    // If the client already processed (client-side Gemini), just return the result
    if (skipProcessing && clientResult) {
        return res.json({ taskId: 'client-side', plan: { agents: agents || [], systemLoad: 0, complexity: 0 } });
    }
    const activeTasks = await queueService.getActiveTasksCount();
    const plan = getAutoscalingPlan(prompt, activeTasks, agents || []);
    const taskId = await queueService.createTask();
    // Process task asynchronously (Background Worker Simulation)
    const processTask = async () => {
        try {
            await queueService.updateTask(taskId, 'processing', 10, null, plan.agents);
            // Refine prompt with feedback
            const finalPrompt = feedback
                ? `Original request: ${prompt}\nUser feedback on previous iteration: ${feedback}\nPlease refine the application based on this feedback.`
                : prompt;
            // Simulation delay helper
            const delay = (ms) => new Promise(r => setTimeout(r, process.env.VERCEL ? ms / 4 : ms));
            await queueService.updateTask(taskId, 'synthesizing', 20);
            // Simulate AI Orchestration
            const result = await aiService.generate(finalPrompt, isHighThinking, agentModels);
            const parsedResult = JSON.parse(result);
            // --- CI/CD PIPELINE SIMULATION ---
            await queueService.updateTask(taskId, 'building', 40, parsedResult);
            await delay(2000); // Build time
            await queueService.updateTask(taskId, 'testing', 70, parsedResult);
            await delay(2000); // Test time
            await queueService.updateTask(taskId, 'deploying', 90, parsedResult);
            await delay(2000); // Deploy time
            const stagingUrl = `${process.env.APP_URL || 'http://localhost:3000'}/staging/${taskId}`;
            await queueService.updateTask(taskId, 'completed', 100, { ...parsedResult, stagingUrl });
        }
        catch (error) {
            let errorMsg = "Pipeline: Generation failed during synthesis";
            if (error instanceof SyntaxError) {
                errorMsg = "AI Mesh Failure: LLM output malformed or incomplete";
            }
            else if (error instanceof Error && error.message.includes('timeout')) {
                errorMsg = "CI/CD Failure: Build pipeline timed out during deployment";
            }
            await queueService.updateTask(taskId, 'failed', 0, { error: errorMsg });
        }
    };
    // Start processing
    processTask();
    // On Vercel, we need to wait a bit to ensure the task starts or even finishes
    // but we can't wait too long. The polling will handle the rest if it's still running.
    // However, Vercel will kill the process after response.
    // So for Vercel, we actually SHOULD wait for completion if possible.
    if (process.env.VERCEL) {
        // Wait up to 8 seconds for completion (Vercel limit is 10s)
        let elapsed = 0;
        while (elapsed < 8000) {
            const task = await queueService.getTask(taskId);
            if (task?.status === 'completed' || task?.status === 'failed')
                break;
            await new Promise(r => setTimeout(r, 500));
            elapsed += 500;
        }
    }
    res.json({ taskId, plan });
});
app.get('/api/tasks/:id', async (req, res) => {
    const task = await queueService.getTask(req.params.id);
    if (!task)
        return res.status(404).json({ error: "Task not found" });
    res.json(task);
});
app.post('/api/debug', async (req, res) => {
    const { code, error } = req.body;
    if (!code)
        return res.status(400).json({ error: "Code is required" });
    const result = await aiService.debug(code, error);
    res.json(result);
});
app.post('/api/lint', async (req, res) => {
    const { code, language } = req.body;
    if (!code)
        return res.status(400).json({ error: "Code is required" });
    const result = await aiService.lint(code, language || 'typescript');
    res.json(result);
});
app.post('/api/format', async (req, res) => {
    const { code, language } = req.body;
    if (!code)
        return res.status(400).json({ error: "Code is required" });
    const formatted = await aiService.format(code, language || 'typescript');
    res.json({ formatted });
});
// --- 3.2 STAGING SERVER (THE SANDBOX) ---
app.get('/staging/:taskId/*', async (req, res) => {
    const { taskId } = req.params;
    const params = req.params;
    const filePath = params['0'] || 'index.html';
    const task = await queueService.getTask(taskId);
    if (!task || task.status !== 'completed' || !task.result) {
        return res.status(404).send('Staging environment not ready or task not found.');
    }
    const files = task.result.files || [];
    const file = files.find((f) => f.path === filePath || f.path === `/${filePath}` || f.path.endsWith(filePath));
    if (!file) {
        // If it's a directory request, try index.html
        const indexFile = files.find((f) => f.path.endsWith('index.html'));
        if (indexFile) {
            return res.type('html').send(indexFile.content);
        }
        return res.status(404).send('File not found in staging environment.');
    }
    // Set content type based on extension
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
    };
    res.type(mimeTypes[ext] || 'text/plain').send(file.content);
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
// --- 4. SERVER INITIALIZATION ---
const isProd = process.env.NODE_ENV === 'production';
const bootstrap = async () => {
    if (!isProd) {
        // Only use Vite in development
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
        if (!process.env.VERCEL) {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`\x1b[36m[ODYSEUS BACKEND]\x1b[0m Gateway initialized on http://localhost:${PORT}`);
            });
        }
    }
    else {
        // In production (including Vercel), serve static files
        const distPath = path.join(process.cwd(), 'dist');
        // Performance: Cache static assets (1 year for hashed files)
        app.use(express.static(distPath, {
            maxAge: '1y',
            etag: true,
            lastModified: true,
            setHeaders: (res, path) => {
                if (path.endsWith('.html')) {
                    // Don't cache HTML files
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                }
            }
        }));
        // SPA Fallback: Serve index.html for any non-API routes
        app.get('*', (req, res, next) => {
            if (req.path.startsWith('/api'))
                return next();
            res.sendFile(path.join(distPath, 'index.html'));
        });
        // Only listen if not on Vercel
        if (!process.env.VERCEL) {
            const server = app.listen(PORT, '0.0.0.0', () => {
                console.log(`\x1b[36m[ODYSEUS BACKEND]\x1b[0m Gateway initialized on http://localhost:${PORT}`);
            });
            // Graceful Shutdown
            const shutdown = () => {
                console.log('\x1b[33m[ODYSEUS BACKEND]\x1b[0m Shutting down gracefully...');
                server.close(() => {
                    console.log('\x1b[32m[ODYSEUS BACKEND]\x1b[0m Server closed.');
                    process.exit(0);
                });
                // Force close after 10s
                setTimeout(() => {
                    console.error('\x1b[31m[ODYSEUS BACKEND]\x1b[0m Forced shutdown.');
                    process.exit(1);
                }, 10000);
            };
            process.on('SIGTERM', shutdown);
            process.on('SIGINT', shutdown);
        }
    }
};
void bootstrap();
export default app;
//# sourceMappingURL=index.js.map