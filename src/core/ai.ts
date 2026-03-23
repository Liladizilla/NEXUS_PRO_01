import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export interface GeneratedApp {
  projectName: string;
  files: {
    path: string;
    content: string;
    language: string;
  }[];
  description: string;
  stagingUrl?: string;
}

export interface BuildResult {
  result: GeneratedApp;
  plan: {
    agents: any[];
    systemLoad: number;
    complexity: number;
    concurrentUsers?: number;
    metrics?: string[];
  };
}

async function callGemini(prompt: string): Promise<GeneratedApp> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Build a full application based on this prompt: "${prompt}". 
    Return a JSON object with a project name, a description, and an array of files. 
    Each file should have a path, content, and language. 
    Include at least a main App component (React), a basic backend (Node/Express), and a README.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING },
          description: { type: Type.STRING },
          files: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                path: { type: Type.STRING },
                content: { type: Type.STRING },
                language: { type: Type.STRING },
              },
              required: ["path", "content", "language"],
            },
          },
        },
        required: ["projectName", "description", "files"],
      },
    },
  });

  return JSON.parse(response.text);
}

// Simulation of other providers for the "Multi-AI Failsafe" requirement
async function callFallbackAI(prompt: string): Promise<GeneratedApp> {
  console.log("Primary AI failed. Switching to fallback...");
  // In a real app, this would call OpenAI, Anthropic, etc.
  // For this prototype, we'll just use Gemini again but log the fallback event.
  return callGemini(prompt);
}

export async function generateApp(prompt: string, agents: any[], feedback?: string, onProgress?: (status: string, progress: number) => void): Promise<BuildResult> {
  // 1. Submit task to queue
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, agents, feedback })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Backend Gateway: Request rejected (${res.status})`);
  }
  
  const { taskId, plan } = await res.json();
  console.log(`Task Queue: Job ${taskId.slice(0, 8)} created. Waiting for worker...`);

  // 2. Poll for completion (Task Queue Simulation)
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const taskRes = await fetch(`/api/tasks/${taskId}`);
        if (!taskRes.ok) throw new Error(`Connectivity: Task polling failed (${taskRes.status})`);
        
        const task = await taskRes.json();
        
        if (onProgress) {
          onProgress(task.status, task.progress);
        }

        if (task.status === 'completed') {
          console.log("Task Queue: Job completed. Retrieving build artifacts...");
          resolve({ result: task.result, plan });
        } else if (task.status === 'failed') {
          reject(new Error(task.result?.error || "Pipeline: Generation failed during synthesis"));
        } else {
          setTimeout(poll, 1000);
        }
      } catch (e) {
        reject(e);
      }
    };
    poll();
  });
}
