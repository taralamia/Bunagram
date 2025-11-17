import { checkAnagram, pickBase, getGame } from "../service/anagramService";
interface AnagramRequest {
  base?: string;
  guess?: string;
  difficulty?: string;
}
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
export function getBaseHandler(req: Request): Response {
  try {
    const url = new URL(req.url);
    const difficulty = url.searchParams.get("difficulty") ?? "easy";
    const game = getGame(difficulty);
    const candidate = pickBase(game);
    return jsonResponse({ success: true, candidate }, 200);
  } catch (err) {
    console.error("[getBaseHandler] error:", err);
    return jsonResponse({ success: false, error: "Failed to pick base word" }, 500);
  }
}
export async function checkHandler(req: Request): Promise<Response> {
  try {
    console.log("[checkHandler] method:", req.method);
    console.log("[checkHandler] headers:", Object.fromEntries(req.headers));

    const raw = await req.text();
    console.log("[checkHandler] raw body:", raw);

    let body: unknown;
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch (parseErr) {
      console.error("[checkHandler] JSON parse error:", parseErr);
      return new Response(JSON.stringify({ success: false, error: "Invalid JSON body", detail: String(parseErr) }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { base, guess, difficulty } = (body as AnagramRequest) ?? {};
    console.log("[checkHandler] parsed body:", body);

    if (!base || !guess) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing 'base' or 'guess' in request body",
        received: body
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const game = getGame(difficulty ?? "easy");
    const isCorrect = checkAnagram(String(base), String(guess), game);
    return new Response(JSON.stringify({ success: true, isCorrect }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[checkHandler] unexpected error:", err);
    return new Response(JSON.stringify({ success: false, error: "Server error", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
