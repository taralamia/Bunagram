import {serve} from "bun";
import { anagramRoutes } from "./routes/anagramRoute";

const PORT = 3001;

console.log(`Starting server on http://localhost:${PORT}`);
serve({
  port: PORT,
  fetch: anagramRoutes,
});