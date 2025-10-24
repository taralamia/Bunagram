import type { AnagramGame } from "../service/anagramService";
import { getBaseHandler, checkHandler } from "../controller/anagramController";

export function anagramRoutesFactory(game: AnagramGame) {
  return async function handler(req: Request) {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === "GET" && path === "/anagram/base") {
      return getBaseHandler(req, game);
    }

    if (req.method === "POST" && path === "/anagram/check") {
      return checkHandler(req, game);
    }

    return new Response("Not found", { status: 404 });
  };
}