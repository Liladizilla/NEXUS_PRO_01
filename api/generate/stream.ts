/** Explicit Vercel route for streamed app generation. */
import app from "../../server/index";
export const config = { maxDuration: 60 };
export default app;
