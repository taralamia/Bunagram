import type { PickResult, CheckResult, Difficulty } from "../types";
import { BASE_URL } from "../config";

const API_ORIGIN = BASE_URL;

function ensureOk(response: Response, parsed: unknown): asserts response is Response {
  if (response.ok) return;
  let msg = response.statusText || `HTTP ${response.status}`;
  try {
    if (typeof parsed === "object" && parsed !== null && "error" in (parsed as Record<string, unknown>)) {
      msg = String((parsed as Record<string, unknown>).error);
    }
  } catch {
    //no message
  }
  throw new Error(msg);
}

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const parsed = await res.json().catch(() => ({}));
  ensureOk(res, parsed);
  return parsed as T;
}

function shuffleString(s: string): string {
  const a = s.split("");
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.join("") === s) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  return a.join("");
}

export function validateAlphaOnly(s: string): boolean {
  return /^[a-zA-Z]+$/.test(s);
}

type PickResponseShape = {
  candidate?: {
    base?: string | null;
    anagrams?: Array<string | null> | null;
    example?: string | null;
  } | null;
};

type CheckResponseShape = {
  isCorrect?: boolean | null;
  example?: string | null;
  reason?: string | null;
};

export async function pick(difficulty: Difficulty = "easy"): Promise<PickResult> {
  const url = `${API_ORIGIN}/api/pick?difficulty=${encodeURIComponent(difficulty)}`;
  const body = await fetchJson<PickResponseShape>(url, { method: "GET" });

  if (!body || typeof body !== "object" || !body.candidate) {
    throw new Error("Unexpected response shape from /api/pick");
  }

  const candidate = body.candidate;
  const base = String(candidate.base ?? "");
  const anagrams = Array.isArray(candidate.anagrams) ? candidate.anagrams.map(String) : [];
  const exampleFromServer = typeof candidate.example === "string" ? candidate.example : null;
  const example = exampleFromServer ?? (anagrams.length ? anagrams[0] : "");
  const scrambled = shuffleString(base);

  return {
    base,
    scrambled,
    example,
    difficulty,
  };
}

export async function check(base: string, guess: string, difficulty: Difficulty = "easy"): Promise<CheckResult> {
  if (!validateAlphaOnly(guess)) {
    return { ok: false, example: null, reason: "invalid_input" };
  }

  const url = `${API_ORIGIN}/api/check`;
  const payload = { base, guess, difficulty };

  const res = await fetchJson<CheckResponseShape>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const isCorrect = Boolean(res.isCorrect);
  const example = typeof res.example === "string" ? res.example : null;
  const reason = typeof res.reason === "string" ? res.reason : undefined;

  if (isCorrect) {
    return { ok: true, example, reason };
  }

  return { ok: false, example, reason };
}
