export default function handler(_req: any, res: any) {
  // Keep this in sync with the environment variable aliases accepted by AIService.
  // "configured" means a key exists; it does not prove the provider is reachable.
  const aiConfigured = Boolean(
    process.env.GROQ_API_KEY || process.env.GROQ_APIKEY || process.env.GROQ_KEY ||
    process.env.GROK_API_KEY || process.env.GROK_APIKEY || process.env.GROK_KEY ||
    process.env.GROQ_API_TOKEN || process.env.GROK_API_TOKEN ||
    process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY ||
    process.env.OPENROUTER_KEY || process.env.OPEN_ROUTER_KEY ||
    process.env.OPENROUTER_APIKEY || process.env.OPEN_ROUTER_APIKEY ||
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || process.env.API_KEY
  );
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
