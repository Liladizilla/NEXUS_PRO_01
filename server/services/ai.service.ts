import prettier from "prettier";

type ProviderConfig = { name: "groq" | "openrouter" | "gemini"; key: string; baseUrl?: string; model: string };

const firstSecret = (...names: string[]): string | undefined => {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
};

export class AIService {
  // Accept historical spellings already saved in Vercel. Never log or return secret values.
  private getProviders(): ProviderConfig[] {
    const providers: ProviderConfig[] = [];
    const groqKey = firstSecret(
      "GROQ_API_KEY", "GROQ_APIKEY", "GROQ_KEY",
      "GROK_API_KEY", "GROK_APIKEY", "GROK_KEY",
      "GROQ_API_TOKEN", "GROK_API_TOKEN"
    );
    const openRouterKey = firstSecret(
      "OPENROUTER_API_KEY", "OPEN_ROUTER_API_KEY",
      "OPENROUTER_KEY", "OPEN_ROUTER_KEY",
      "OPENROUTER_APIKEY", "OPEN_ROUTER_APIKEY"
    );
    const geminiKey = firstSecret("GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY", "API_KEY");

    if (groqKey) providers.push({
      name: "groq", key: groqKey, baseUrl: "https://api.groq.com/openai/v1",
      model: firstSecret("GROQ_MODEL", "GROK_MODEL") || "llama-3.3-70b-versatile"
    });
    if (openRouterKey) providers.push({
      name: "openrouter", key: openRouterKey, baseUrl: "https://openrouter.ai/api/v1",
      model: firstSecret("OPENROUTER_MODEL", "OPEN_ROUTER_MODEL") || "openai/gpt-4o-mini"
    });
    if (geminiKey) providers.push({ name: "gemini", key: geminiKey, model: "gemini-2.5-flash" });
    return providers;
  }

  getProviderStatus() {
    const providers = this.getProviders();
    return {
      available: providers.length > 0,
      providers: providers.map(({ name, model }) => ({ name, model, configured: true })),
      missing: ["Groq", "OpenRouter", "Gemini"].filter((name) =>
        !providers.some((p) => p.name === name.toLowerCase())
      )
    };
  }

  private async requestText(
    system: string,
    prompt: string,
    options: { json?: boolean; maxTokens?: number; temperature?: number } = {}
  ): Promise<string> {
    const providers = this.getProviders();
    if (!providers.length) {
      throw new Error("AI is not configured. Add a Groq, OpenRouter, or Gemini server environment variable. Common accepted names include GROK_API_KEY and OPEN_ROUTER_API_KEY.");
    }
    const errors: string[] = [];
    for (const provider of providers) {
      try {
        let result = "";
        if (provider.name === "gemini") {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${encodeURIComponent(provider.key)}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: system }] },
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: options.temperature ?? 0.2,
                  maxOutputTokens: options.maxTokens ?? 8192,
                  ...(options.json ? { responseMimeType: "application/json" } : {})
                }
              }),
              signal: AbortSignal.timeout(90000)
            }
          );
          const data: any = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data?.error?.message || `Gemini returned HTTP ${response.status}`);
          result = data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || "").join("") || "";
        } else {
          const response = await fetch(`${provider.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${provider.key}`,
              "Content-Type": "application/json",
              ...(provider.name === "openrouter" ? { "HTTP-Referer": process.env.APP_URL || "https://nexus-pro-01.vercel.app", "X-Title": "Odyseus Nexus Pro" } : {})
            },
            body: JSON.stringify({
              model: provider.model,
              messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
              temperature: options.temperature ?? 0.2,
              max_tokens: options.maxTokens ?? 8192,
              ...(options.json ? { response_format: { type: "json_object" } } : {})
            }),
            signal: AbortSignal.timeout(90000)
          });
          const data: any = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data?.error?.message || `${provider.name} returned HTTP ${response.status}`);
          result = data?.choices?.[0]?.message?.content || "";
        }
        if (result.trim()) return result.trim();
        throw new Error("Provider returned an empty response.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown provider error";
        // Avoid accidentally including a secret in any surfaced provider error.
        errors.push(`${provider.name}: ${message.replaceAll(provider.key, "[redacted]")}`);
        console.warn(`[Odyseus AI] ${provider.name} request failed; trying the next configured provider.`);
      }
    }
    throw new Error(`All configured AI providers failed. ${errors.join(" | ")}`);
  }

  async generate(
    prompt: string,
    isHighThinking = false,
    agentModels?: Record<string, string>,
    onStream?: (snapshot: { characters: number; preview: string }) => void
  ): Promise<string> {
    const modelContext = agentModels
      ? "\n\nAgent orchestration preferences:\n" + Object.entries(agentModels).map(([id, model]) => `- ${id}: ${model}`).join("\n")
      : "";
    const system = `You are the Odyseus AI Orchestrator, a senior software architect. Generate a complete, useful project, not a mock description. Return only valid JSON with projectName, description, and files (array of {path, content, language}). Include appropriate frontend and backend files, setup instructions, safe defaults, and a README. Never claim an integration is configured unless it is. Avoid unnecessary infrastructure boilerplate. ${isHighThinking ? "Think carefully about architecture, correctness and security before answering." : ""}${modelContext}`;
    onStream?.({ characters: 0, preview: "Contacting configured AI provider…" });
    const text = await this.requestText(system, prompt, { json: true, maxTokens: 12000, temperature: 0.2 });
    onStream?.({ characters: text.length, preview: "AI response received; validating project output." });
    return text;
  }

  async chat(messages: { role: "user" | "model"; parts: { text: string }[] }[], systemInstruction?: string): Promise<string> {
    const prompt = messages.map((message) =>
      `${message.role === "model" ? "Assistant" : "User"}: ${message.parts.map((part) => part.text).join("\n")}`
    ).join("\n\n");
    return this.requestText(systemInstruction || "You are Odyseus, a helpful software-building assistant. Be accurate and concise.", prompt, { maxTokens: 4096, temperature: 0.4 });
  }

  async complex(prompt: string): Promise<string> {
    return this.requestText("You are a careful senior engineer. Think deeply and provide a rigorous, practical answer.", prompt, { maxTokens: 8192, temperature: 0.2 });
  }

  async debug(code: string, error: string | null): Promise<any> {
    try {
      const text = await this.requestText(
        "You are a code debugger. Return JSON with an issues array; each issue has line (number), message, severity (error or warning), and fix.",
        `Reported error: ${error || "none"}\n\nCode:\n${code}`,
        { json: true, maxTokens: 4096 }
      );
      const parsed = JSON.parse(text);
      return { issues: Array.isArray(parsed.issues) ? parsed.issues : [] };
    } catch (err) {
      console.error("[Odyseus AI] Debug request failed:", err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  }

  async lint(code: string, language: string): Promise<any> {
    try {
      const text = await this.requestText(
        "You are a strict code linter. Return JSON with a results array; each item has line (number), message, severity (error or warning).",
        `Lint this ${language} code for actionable style and best-practice issues:\n\n${code}`,
        { json: true, maxTokens: 4096 }
      );
      const parsed = JSON.parse(text);
      return { results: Array.isArray(parsed.results) ? parsed.results : [] };
    } catch (err) {
      console.error("[Odyseus AI] Lint request failed:", err instanceof Error ? err.message : "Unknown error");
      throw err;
    }
  }

  async format(code: string, language: string): Promise<string> {
    try {
      const parser = language === "typescript" || language === "tsx" ? "typescript"
        : language === "javascript" || language === "jsx" ? "babel"
        : language === "css" ? "css" : language === "html" ? "html"
        : language === "json" ? "json" : "babel";
      return await prettier.format(code, { parser, semi: true, singleQuote: true, trailingComma: "es5", printWidth: 100 });
    } catch (err) {
      console.error("[Odyseus AI] Format failed:", err instanceof Error ? err.message : "Unknown error");
      return code;
    }
  }
}
