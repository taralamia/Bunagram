import { readFileSync } from "fs";
export function loadDictionary(path: string): string[] {
  const text = readFileSync(path, "utf-8");
  const seen = new Set<string>();
  for (const raw of text.split("\n")) {
    const w = raw.trim().toLowerCase();
    if (!w || w.length < 3) continue;
    if (!/^[a-z]+$/.test(w)) continue;
    seen.add(w);
  }
  return [...seen];
}
export function wordSignature(w: string): string {
  const counts = new Array<number>(26).fill(0);
  for (const ch of w) {
    const idx = ch.charCodeAt(0) - 97;
    if (idx >= 0 && idx < 26) {
        counts[idx] = (counts[idx] ?? 0) + 1;
    }
  }
  return counts.map(n => `#${n}`).join("");
}
export function groupBySignature(words: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const w of words) {
    const key = wordSignature(w);
    const arr = map.get(key);
    if (arr) arr.push(w);
    else map.set(key, [w]);
  }
  return map;
}
export type NonEmptyArray<T> = [T, ...T[]];

export function randomChoice<T>(arr: NonEmptyArray<T>): T {
  const i = (Math.random() * arr.length) | 0; 
  const v = arr[i];                          
  if (v === undefined) {
    throw new Error("randomChoice: unreachable index");
  }
  return v;                                 
}
