import { wordSignature, randomChoice } from "./utils";
import { type NonEmptyArray } from "./utils";
export type Candidate = { base: string; anagrams: string[] };
function assertNonEmpty<T>(
  arr: T[],
  msg: string
): asserts arr is NonEmptyArray<T> {
  if (arr.length === 0) throw new Error(msg);
}
export function pickBaseWord(groups: Map<string, string[]>): Candidate {
  const candidates: Candidate[] = [];
  for (const [, words] of groups) {
    if (words.length >= 2) {
      const base = words[0];
      if (base === undefined)
        throw new Error("unreachable: words[0] undefined");
      candidates.push({ base, anagrams: words });
    }
  }
  assertNonEmpty(candidates, "No playable groups. Add more words.");
  return randomChoice(candidates as [Candidate, ...Candidate[]]);
}
export function isAnagramOf(
  base: string,
  guess: string,
  dict: Set<string>
): boolean {
  const g = guess.trim().toLowerCase();
  if (!/^[a-z]+$/.test(g)) return false;
  if (g.length !== base.length) return false;
  if (!dict.has(g)) return false;
  return wordSignature(g) === wordSignature(base) ;
}
