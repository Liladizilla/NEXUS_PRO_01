/** Honest deployment boundary: never fabricate a live URL when provider adapters are absent. */
const supportedTargets = new Set(['railway', 'vercel', 'netlify', 'aws-s3', 'cloudflare-pages', 'docker']);

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed', message: 'Use POST to request a deployment.' });
  }
  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : (req.body || {});
  const target = typeof body.target === 'string' ? body.target : '';
  if (!supportedTargets.has(target)) return res.status(400).json({ error: 'Invalid deployment target.' });
  if (typeof body.projectName !== 'string' || !body.projectName.trim() || !Array.isArray(body.files) || body.files.length === 0) {
    return res.status(400).json({ error: 'A project name and generated files are required before deployment.' });
  }
  return res.status(501).json({
    error: 'Deployment provider not connected',
    message: `${target} deployment is not connected yet. The app has not been deployed. Configure the provider adapter and server-side credentials before retrying.`
  });
}
