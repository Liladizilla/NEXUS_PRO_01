/**
 * Vercel adapter for the existing Express API.
 * Report module initialization failures as JSON so the build UI can show the cause.
 */
export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  try {
    const module = await import('../server/index.ts');
    const app = module.default;
    if (typeof app !== 'function') {
      return res.status(500).json({ error: 'API initialization failed', detail: 'Express app export is missing.' });
    }
    return app(req, res);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('[API BOOT FAILURE]', detail);
    return res.status(500).json({ error: 'API handler failed to initialize', detail: detail.slice(0, 500) });
  }
}
