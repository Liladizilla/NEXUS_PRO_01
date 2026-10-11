/** Vercel-native streaming endpoint. Avoid importing the Express app here: Vercel
 * bundles each function independently and a runtime import of server/index.ts
 * fails because TypeScript source files are not present in the deployed runtime.
 */
import { AIService } from "../../server/services/ai.service";

export const config = { maxDuration: 60 };

type BuildEvent = Record<string, unknown>;

function writeEvent(res: any, event: BuildEvent) {
  if (res.writableEnded || res.destroyed) return;
  res.write(JSON.stringify(event) + "\n");
  res.flush?.();
}

function normalizeFiles(generated: any) {
  if (!generated || typeof generated.projectName !== "string" || !generated.projectName.trim() ||
      !Array.isArray(generated.files) || generated.files.length === 0) {
    throw new Error("The AI response did not contain a project name and at least one file.");
  }
  if (generated.files.length > 150) {
    throw new Error("The generated project contains too many files (limit: 150). Narrow the request and retry.");
  }
  const seen = new Set<string>();
  return generated.files.map((file: any) => {
    if (!file || typeof file.path !== "string" || typeof file.content !== "string" || !file.path.trim()) {
      throw new Error("A generated file is missing its path or text content.");
    }
    const filePath = file.path.replace(/\\/g, "/").replace(/^\/+/, "");
    if (!filePath || filePath.split("/").some((part: string) => part === "..") || /^[a-zA-Z]:/.test(filePath)) {
      throw new Error(`Unsafe file path returned by the model: ${file.path}`);
    }
    if (seen.has(filePath)) throw new Error(`The generated project contains a duplicate path: ${filePath}`);
    seen.add(filePath);
    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    const languages: Record<string, string> = { tsx: "typescript", ts: "typescript", jsx: "javascript", js: "javascript", css: "css", html: "html", json: "json", md: "markdown" };
    return { path: filePath, content: file.content, language: file.language || languages[ext] || "text" };
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST to start app generation." });
  }

  const { prompt, agents, feedback, isHighThinking, agentModels } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Describe the application you want to build first." });
  }
  if (prompt.length > 50000) return res.status(413).json({ error: "Prompt is too long." });

  res.status(200);
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  let streamOpen = true;
  res.on("close", () => { streamOpen = false; });
  const taskId = `build-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const emit = (event: BuildEvent) => { if (streamOpen) writeEvent(res, { taskId, ...event }); };

  try {
    const safeAgents = Array.isArray(agents) ? agents : [];
    const plan = {
      agents: safeAgents,
      systemLoad: 0,
      complexity: Math.min(100, Math.max(1, Math.round(prompt.length / 12))),
      metrics: ["Provider stream", "Generated file validation"]
    };
    emit({ type: "progress", status: "processing", progress: 10, message: "Request accepted; preparing the generation pipeline." });
    emit({ type: "progress", status: "synthesizing", progress: 20, message: "Connecting to the configured Gemini provider." });

    const finalPrompt = feedback
      ? `Original request: ${prompt}\nUser feedback on previous iteration: ${feedback}\nPlease refine the application based on this feedback.`
      : prompt;
    const service = new AIService();
    const raw = await service.generate(finalPrompt, Boolean(isHighThinking), agentModels, ({ characters, preview }) => {
      emit({
        type: "progress",
        status: "synthesizing",
        progress: Math.min(40, 20 + Math.floor(characters / 1500)),
        message: `Gemini stream: ${characters.toLocaleString()} characters received. ${preview}`
      });
    });

    let generated: any;
    try { generated = JSON.parse(raw); }
    catch { throw new Error("The AI provider returned invalid project JSON. Retry the build or simplify the prompt."); }

    emit({ type: "progress", status: "building", progress: 50, message: "Validating generated files and safe paths." });
    const files = normalizeFiles(generated);
    emit({ type: "progress", status: "testing", progress: 75, message: `Structure checks passed for ${files.length} files.` });
    emit({ type: "progress", status: "deploying", progress: 90, message: "Preparing the generated project preview data." });

    const appBaseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const result = {
      projectName: generated.projectName.trim(),
      description: typeof generated.description === "string" ? generated.description : "",
      files,
      stagingUrl: `${appBaseUrl}/staging/${taskId}`
    };
    emit({ type: "progress", status: "completed", progress: 100, message: `Generated project passed validation with ${files.length} files.` });
    emit({ type: "complete", plan, result });
    streamOpen = false;
    return res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed for an unknown reason.";
    if (res.headersSent) {
      emit({ type: "error", message });
      streamOpen = false;
      return res.end();
    }
    return res.status(500).json({ error: message });
  }
}
