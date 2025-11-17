import { serve } from "bun";
import { anagramRoutesFactory } from "./routes/anagramRoute";
const PORT = Number(process.env.PORT ?? "3001");
const handler = anagramRoutesFactory();
console.log(`Starting server on http://localhost:${PORT}`);
serve({
  port: PORT,
  fetch: handler, 
});
