export default function handler(_req: any, res: any) {
  // Keep this in sync with the environment variable aliases accepted by AIService.
  // "configured" means a key exists; it does not prove the provider is reachable.
  const aiConfigured = [
    "GROQ_API_KEY", "GROQ_APIKEY", "GROQ_KEY",
    "GROK_API_KEY", "GROK_APIKEY", "GROK_KEY",
    "GROQ_API_TOKEN", "GROK_API_TOKEN",
    "OPENROUTER_API_KEY", "OPEN_ROUTER_API_KEY",
    "OPENROUTER_KEY", "OPEN_ROUTER_KEY",
    "OPENROUTER_APIKEY", "OPEN_ROUTER_APIKEY",
    "GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY", "API_KEY"
  ].some((name) => Boolean(process.env[name]?.trim()));
  const githubConfigured = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(aiConfigured ? 200 : 503).json({
    success: aiConfigured,
    status: aiConfigured ? 'healthy' : 'degraded',
    services: {
      api: 'online',
      ai: aiConfigured ? 'configured' : 'missing-credentials',
      auth: githubConfigured ? 'configured' : 'not-configured',
      billing: 'disabled-until-verified'
    },
    timestamp: new Date().toISOString()
  });
}
