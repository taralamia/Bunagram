import type { PickResult, CheckResult, Difficulty } from "../types";
const API_ORIGIN = (window as Window & { __BUNAGRAM_API_ORIGIN__?: string }).__BUNAGRAM_API_ORIGIN__ ?? "http://localhost:3001";
function ensureOk(response: Response, parsed: unknown): asserts response is Response {
  if (!response.ok) {
    // parsed may be object with error
    let msg = response.statusText;
    try {
      if (typeof parsed === "object" && parsed !== null && "error" in (parsed as Record<string, unknown>)) {
        msg = String((parsed as Record<string, unknown>).error);
      }
    } catch {
      //
    }
    throw new Error(msg);
  }
}

export async function pick(difficulty: Difficulty = "easy"): Promise<PickResult> {
  const url = `${API_ORIGIN}/api/pick?difficulty=${encodeURIComponent(difficulty)}`;
  const res = await fetch(url, { method: "GET" });
  const j = await res.json().catch(() => ({}));
  ensureOk(res, j);
  return j as PickResult;
}

export async function check(base: string, guess: string, difficulty: Difficulty = "easy"): Promise<CheckResult> {
  const url = `${API_ORIGIN}/api/check`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base, guess, difficulty })
  });
  const j = await res.json().catch(() => ({}));
  ensureOk(res, j);
  return j as CheckResult;
}