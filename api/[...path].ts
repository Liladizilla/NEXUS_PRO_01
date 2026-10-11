/**
 * Vercel catch-all function for the existing Express API.
 *
 * API routes must be deployed as functions, not rewritten to the SPA's
 * static HTML entry point. Importing the Express app preserves its existing
 * route handlers while allowing /api/* requests to execute server-side.
 */
import app from "../server/index.ts";

export const config = { maxDuration: 60 };

export default app;
