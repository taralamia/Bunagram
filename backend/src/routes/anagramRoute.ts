import { pickWord, checkGuess } from "../controller/anagramController";
const JSON_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
function errorToMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return String(err);
  } catch {
    return "Unknown error";
  }
}
type CheckBody = {
  base?: unknown;
  guess?: unknown;
  difficulty?: unknown;
};
export const anagramRoutes = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: JSON_HEADERS });
  }

  try {
    if (url.pathname === "/api/status" && req.method === "GET") {
      return new Response(JSON.stringify({ status: "ok", service: "bunagram" }), {
        status: 200,
        headers: JSON_HEADERS,
      });
    }
    if (url.pathname === "/api/pick" && req.method === "GET") {
      const difficulty = (url.searchParams.get("difficulty") || "easy").toString().toLowerCase();
      try {
        const result = pickWord(difficulty);
        return new Response(JSON.stringify(result), { status: 200, headers: JSON_HEADERS });
      } catch (err: unknown) {
        return new Response(JSON.stringify({ error: errorToMessage(err) }), {
          status: 500,
          headers: JSON_HEADERS,
        });
      }
    }
    if (url.pathname === "/api/check" && req.method === "POST") {
      let parsed: unknown;
      try {
        parsed = await req.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: JSON_HEADERS,
        });
      }
      if (typeof parsed !== "object" || parsed === null) {
        return new Response(JSON.stringify({ error: "JSON body must be an object" }), {
          status: 400,
          headers: JSON_HEADERS,
        });
      }

      const body = parsed as CheckBody;

      const base = typeof body.base === "string" ? body.base : undefined;
      const guess = typeof body.guess === "string" ? body.guess : undefined;
      const difficulty =
        typeof body.difficulty === "string" && body.difficulty.length > 0
          ? body.difficulty.toLowerCase()
          : "easy";

      if (!base || !guess) {
        return new Response(JSON.stringify({ ok: false, reason: "Missing base or guess" }), {
          status: 400,
          headers: JSON_HEADERS,
        });
      }

      try {
        const result = checkGuess(base, guess, difficulty);
        return new Response(JSON.stringify(result), { status: 200, headers: JSON_HEADERS });
      } catch (err: unknown) {
        return new Response(JSON.stringify({ error: errorToMessage(err) }), {
          status: 500,
          headers: JSON_HEADERS,
        });
      }
    }
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: JSON_HEADERS });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: errorToMessage(err) }), { status: 500, headers: JSON_HEADERS });
  }
};
