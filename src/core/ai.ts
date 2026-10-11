export interface GeneratedApp {
  projectName: string;
  files: { path: string; content: string; language: string }[];
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

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.error === "string" ? body.error
      : typeof body?.message === "string" ? body.message
      : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}

// All provider calls go through the server. Never bundle provider credentials into the renderer.
export async function callGeminiChat(
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[],
  systemInstruction?: string
): Promise<string> {
  const data = await readJson<{ text: string }>(await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemInstruction })
  }));
  return data.text;
}

export async function callGeminiComplex(prompt: string): Promise<string> {
  const data = await readJson<{ text: string }>(await fetch('/api/complex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  }));
  return data.text;
}

export async function generateApp(
  prompt: string,
  agents: any[],
  feedback?: string,
  isHighThinking?: boolean,
  onProgress?: (status: string, progress: number, message?: string) => void,
  agentModels?: Record<string, string>
): Promise<BuildResult> {
  if (!prompt.trim()) throw new Error('Describe the application you want to build first.');

  const response = await fetch('/api/generate/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/x-ndjson' },
    body: JSON.stringify({ prompt, agents, feedback, isHighThinking, agentModels })
  });

  if (!response.ok) {
    const rawError = await response.text().catch(() => '');
    let body: any = {};
    try { body = JSON.parse(rawError); } catch { body = {}; }
    const message = typeof body?.error === 'string' ? body.error
      : typeof body?.message === 'string' ? body.message
      : rawError.trim().slice(0, 500) || `Generation request failed (HTTP ${response.status}).`;
    throw new Error(message);
  }
  if (!response.body) throw new Error('The server opened the generation request without a live response stream.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completed: { result: GeneratedApp; plan: BuildResult['plan'] } | null = null;

  const handleLine = (line: string) => {
    if (!line.trim()) return;
    let event: any;
    try { event = JSON.parse(line); }
    catch { throw new Error('The generation stream returned malformed progress data.'); }

    if (event.type === 'progress') {
      onProgress?.(event.status, event.progress ?? 0, event.message);
    } else if (event.type === 'complete') {
      if (!event.result || !Array.isArray(event.result.files) || !event.result.files.length) {
        throw new Error('Generation finished but returned no usable project files.');
      }
      completed = { result: event.result, plan: event.plan };
    } else if (event.type === 'error') {
      throw new Error(event.message || 'Generation failed on the server.');
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) handleLine(line);
      if (done) break;
    }
    if (buffer.trim()) handleLine(buffer);
  } finally {
    reader.releaseLock();
  }

  if (!completed) throw new Error('The generation stream closed before the server returned a completed project.');
  return completed as { result: GeneratedApp; plan: BuildResult['plan'] };
}
