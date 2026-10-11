/** Explicit Vercel route for streamed app generation. */
import app from "../../server/index.js";
export const config = { maxDuration: 60 };
export default app;
