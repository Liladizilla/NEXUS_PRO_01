/** Explicit Vercel route for streamed app generation. */
import app from "../../server/index.ts";
export const config = { maxDuration: 60 };
export default app;
