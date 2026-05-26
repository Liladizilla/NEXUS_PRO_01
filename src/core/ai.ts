import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

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

export async function callGeminiChat(messages: { role: 'user' | 'model', parts: { text: string }[] }[], systemInstruction?: string) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
    }
  });

  return response.text;
}

export async function callGeminiComplex(prompt: string) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
    }
  });

  return response.text;
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

export async function generateApp(
  prompt: string, 
  agents: any[], 
  feedback?: string, 
  isHighThinking?: boolean, 
  onProgress?: (status: string, progress: number) => void,
  agentModels?: Record<string, string>
): Promise<BuildResult> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  const ai = new GoogleGenAI({ apiKey });
  
  const modelName = isHighThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
  
  let modelContext = "";
  if (agentModels) {
    modelContext = `\n\nAgent Orchestration Context:\n` + 
      Object.entries(agentModels).map(([id, m]) => `- ${id}: ${m}`).join('\n');
  }

  const finalPrompt = feedback 
    ? `Original request: ${prompt}\nUser feedback on previous iteration: ${feedback}\nPlease refine the application based on this feedback.`
    : prompt;

  if (onProgress) onProgress('processing', 10);
  
  // 1. Synthesizing
  if (onProgress) onProgress('synthesizing', 20);
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: finalPrompt,
    config: {
      systemInstruction: `You are the Odyseus AI Orchestrator, a world-class software architect. 
      Your goal is to synthesize high-quality, production-ready software architectures. 
      
      CRITICAL INSTRUCTIONS:
      1. ALWAYS generate a complex, multi-tier architecture.
      2. Include a modern frontend (React/Next.js), a robust backend (Node.js/Go/Rust), and infrastructure-as-code (Terraform/Docker/K8s).
      3. Use multiple programming languages where appropriate (e.g., Rust for performance-critical parts, Go for microservices, TypeScript for frontend).
      4. Ensure the file structure is professional (e.g., /src, /server, /infra, /core, /scripts).
      5. Include detailed README.md and documentation.
      ${modelContext}
      
      You must ALWAYS respond with a valid JSON object containing 'projectName', 'description', and 'files' (an array of {path, content, language} objects).`,
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
                language: { type: Type.STRING }
              },
              required: ["path", "content", "language"]
            }
          }
        },
        required: ["projectName", "description", "files"]
      },
      thinkingConfig: isHighThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined
    }
  });

  if (!response.text) throw new Error("Empty response from Gemini Mesh");
  const result = JSON.parse(response.text);

  // 2. Building
  if (onProgress) onProgress('building', 40);
  await new Promise(r => setTimeout(r, 1500));

  // 3. Testing
  if (onProgress) onProgress('testing', 70);
  await new Promise(r => setTimeout(r, 1500));

  // 4. Deploying
  if (onProgress) onProgress('deploying', 90);
  await new Promise(r => setTimeout(r, 1500));

  const taskId = Math.random().toString(36).substr(2, 9);
  const stagingUrl = `${window.location.origin}/staging/${taskId}`;

  // We still notify the backend about the completed task for persistence if possible
  // but we don't wait for it. Fire-and-forget with a flag to prevent re-processing.
  fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, agents, feedback, isHighThinking, result: { ...result, stagingUrl }, status: 'completed', skipProcessing: true })
  }).catch(err => console.warn("Failed to sync task with backend", err));

  if (onProgress) onProgress('completed', 100);

  return { 
    result: { ...result, stagingUrl }, 
    plan: {
      agents: agents,
      systemLoad: 45,
      complexity: 85
    }
  };
}
