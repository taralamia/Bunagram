import { serve } from "bun";
import { anagramRoutesFactory } from "./routes/anagramRoute";
import { game } from "./service/anagramGame";
const PORT = Number(process.env.PORT ?? "3001");
const handler = anagramRoutesFactory(game);
console.log(`Starting server on http://localhost:${PORT}`);
serve({
  port: PORT,
  fetch: handler, 
});
