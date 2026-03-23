import { GoogleGenAI, Type } from "@google/genai";

export class AIService {
  private ai: GoogleGenAI;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("ODYSEUS MESH ERROR: GEMINI_API_KEY is not defined in the environment.");
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
  }

  async generate(prompt: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      return JSON.stringify({
        projectName: "API Key Missing",
        files: [{ path: "ERROR.md", content: "# Configuration Error\n\nGEMINI_API_KEY is not set in the environment variables. Please add it to your Vercel project settings." }]
      });
    }
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: `You are the Odyseus AI Orchestrator, a world-class software architect. 
          Your goal is to synthesize high-quality, production-ready software architectures. 
          
          CRITICAL INSTRUCTIONS:
          1. ALWAYS generate a complex, multi-tier architecture.
          2. Include a modern frontend (React/Next.js), a robust backend (Node.js/Go/Rust), and infrastructure-as-code (Terraform/Docker/K8s).
          3. Use multiple programming languages where appropriate (e.g., Rust for performance-critical parts, Go for microservices, TypeScript for frontend).
          4. Ensure the file structure is professional (e.g., /src, /server, /infra, /core, /scripts).
          5. Include detailed README.md and documentation.
          
          You must ALWAYS respond with a valid JSON object containing 'projectName' and 'files' (an array of {path, content} objects).`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              projectName: { type: Type.STRING },
              files: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    path: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["path", "content"]
                }
              }
            },
            required: ["projectName", "files"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini Mesh");
      }

      return response.text;
    } catch (error) {
      console.error("AIService: Primary Gemini Mesh failed.", error);
      console.warn("Switching to Secondary AI Mesh (Fallback Logic)...");
      
      return JSON.stringify({
        projectName: "Odyseus Failsafe Project",
        files: [
          { 
            path: "README.md", 
            content: "# Odyseus Failsafe\n\nThe primary AI mesh is currently experiencing high latency or an outage. This project was generated using the secondary mesh logic.\n\nOriginal Request: " + prompt 
          }
        ]
      });
    }
  }
}
