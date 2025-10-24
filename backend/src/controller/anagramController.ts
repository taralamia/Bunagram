import { checkAnagram, pickBase } from "../service/anagramService";
import type { AnagramGame } from "../service/anagramService";
interface AnagramRequest {
  base: string;
  guess: string;
}
export function getBaseHandler(_req: Request, game: AnagramGame): Response {
  const candidate = pickBase(game);
  return new Response(JSON.stringify({ success: true, base: candidate }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
export async function checkHandler(req: Request, game: AnagramGame): Promise<Response> {
  try {
    const { base, guess } = (await req.json()) as AnagramRequest;
    if (!base || !guess) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing 'base' or 'guess' in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const isCorrect = checkAnagram(base, guess, game);
    return new Response(JSON.stringify({ success: true, isCorrect }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("checkHandler error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
