/** Explicit Vercel route for streamed app generation. */
import app, { initializeServer } from "../../server/index.ts";
export const config = { maxDuration: 60 };
export default async function handler(req: any, res: any) {
  try {
    await initializeServer();
    return app(req, res);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('[GENERATION API BOOT FAILURE]', detail);
    return res.status(500).json({ error: 'Generation API failed to initialize', detail: detail.slice(0, 500) });
  }
}
