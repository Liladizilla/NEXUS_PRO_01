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
  onProgress?: (status: string, progress: number) => void,
  agentModels?: Record<string, string>
): Promise<BuildResult> {
  if (!prompt.trim()) throw new Error('Describe the application you want to build first.');

  const { taskId, plan } = await readJson<{ taskId: string; plan: BuildResult['plan'] }>(
    await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, agents, feedback, isHighThinking, agentModels })
    })
  );

  if (!taskId) throw new Error('The server did not return a generation task ID.');

  const startedAt = Date.now();
  let lastStatus = '';
  while (Date.now() - startedAt < 5 * 60 * 1000) {
    const task = await readJson<{
      status: string;
      progress?: number;
      result?: GeneratedApp & { error?: string };
      agents?: any[];
    }>(await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, { cache: 'no-store' }));

    if (task.status !== lastStatus) {
      lastStatus = task.status;
      onProgress?.(task.status, task.progress ?? 0);
    } else if (task.progress != null) {
      onProgress?.(task.status, task.progress);
    }

    if (task.status === 'completed') {
      if (!task.result || !Array.isArray(task.result.files)) {
        throw new Error('Generation was marked complete but the server returned no project files.');
      }
      return {
        result: task.result,
        plan: { ...plan, agents: task.agents?.length ? task.agents : plan.agents }
      };
    }

    if (task.status === 'failed') {
      throw new Error(task.result?.error || 'Generation failed on the server.');
    }

    await new Promise(resolve => setTimeout(resolve, 900));
  }

  throw new Error('Generation is taking too long. Check the task status before retrying.');
}
