const providerRequirements: Record<string, string[]> = {
  railway: ['RAILWAY_TOKEN'],
  vercel: ['VERCEL_TOKEN'],
  netlify: ['NETLIFY_AUTH_TOKEN'],
  'aws-s3': ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET'],
  'cloudflare-pages': ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'],
  docker: []
};

export default function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ configured: false, message: 'Use POST to check provider configuration.' });
  }

  const body = typeof req.body === 'string' ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })() : (req.body || {});
  const target = typeof body.target === 'string' ? body.target : '';
  if (!Object.prototype.hasOwnProperty.call(providerRequirements, target)) {
    return res.status(400).json({ configured: false, message: 'Unknown deployment provider.' });
  }

  if (target === 'docker') {
    return res.status(200).json({
      configured: false,
      connectionVerified: false,
      message: 'Remote Docker deployment is not supported by this serverless deployment. Use a dedicated deployment agent or CI runner.'
    });
  }

  const required = providerRequirements[target];
  const missing = required.filter(name => !process.env[name]?.trim());
  if (missing.length) {
    return res.status(200).json({
      configured: false,
      connectionVerified: false,
      missing,
      message: `Missing server-side environment variables: ${missing.join(', ')}. Add them to the deployment environment, never to client-side code.`
    });
  }

  return res.status(200).json({
    configured: true,
    connectionVerified: false,
    message: 'Required environment variables are present. Remote authentication has not been tested, and deployment is not enabled until the provider adapter is implemented.'
  });
}
