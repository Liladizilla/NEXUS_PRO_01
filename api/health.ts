export default function handler(_req: any, res: any) {
  const aiConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY);
  const githubConfigured = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    success: true,
    status: 'healthy',
    services: {
      api: 'online',
      ai: aiConfigured ? 'configured' : 'missing-credentials',
      auth: githubConfigured ? 'configured' : 'not-configured',
      billing: 'disabled-until-verified'
    },
    timestamp: new Date().toISOString()
  });
}
