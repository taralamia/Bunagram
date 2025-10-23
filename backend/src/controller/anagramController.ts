import { loadDictionary, groupBySignature, randomChoice, type NonEmptyArray } from "../lib/utils.ts";
import { isAnagramOf } from "../lib/game.ts";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dictionaries: Record<string, string[]> = {};
const dictSets: Record<string, Set<string>> = {};
const groupsMap: Record<string, Map<string, string[]>> = {};
const usedSigsMap: Record<string, Set<string>> = {};
const allSigsMap: Record<string, string[]> = {};
function loadDifficulty(difficulty: string) {
  if (!dictionaries[difficulty]) {
    const path = resolve(__dirname, `../lib/words_${difficulty}.txt`);
    const words = loadDictionary(path);
    const dictSet = new Set(words);
    const groups = groupBySignature(words);
    const usedSigs = new Set<string>();
    const allSigs = Array.from(groups.keys()).filter(sig => {
      const groupWords = groups.get(sig);
      return !!(groupWords && groupWords.length >= 2);
    });
    dictionaries[difficulty] = words;
    dictSets[difficulty] = dictSet;
    groupsMap[difficulty] = groups;
    usedSigsMap[difficulty] = usedSigs;
    allSigsMap[difficulty] = allSigs;
  }
}
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]] as [T, T];
  }
  return shuffled;
}
export type PickResult = {
  base: string;
  scrambled: string;
  example: string;
  difficulty: string;
};
export function pickWord(difficulty = "easy"): PickResult {
  loadDifficulty(difficulty);

  const groups = groupsMap[difficulty];
  const usedSigs = usedSigsMap[difficulty];
  const allSigs = allSigsMap[difficulty];

  if (!groups) throw new Error(`Internal error: groups not initialized for "${difficulty}"`);
  if (!usedSigs) throw new Error(`Internal error: usedSigs not initialized for "${difficulty}"`);
  if (!allSigs) throw new Error(`Internal error: allSigs not initialized for "${difficulty}"`);
  if (allSigs.length === 0) {
    throw new Error(`No playable groups for difficulty="${difficulty}". Add more words.`);
  }
  if (usedSigs.size >= allSigs.length) {
    usedSigs.clear();
  }
  const available = allSigs.filter(sig => !usedSigs.has(sig));
  if (available.length === 0) {
    throw new Error("No available words found.");
  }
  const sig = randomChoice(available as NonEmptyArray<string>);
  usedSigs.add(sig);
  const anagrams = groups.get(sig) ?? [];
  if (anagrams.length === 0) {
    throw new Error("Selected signature has no words.");
  }
  const shuffledAnagrams = shuffleArray(anagrams);
  const base = shuffledAnagrams[0];
  if (!base) {
    throw new Error("No valid base word found.");
  }
  const scrambled = shuffleArray(base.split("")).join("");
  const example = shuffledAnagrams.find(w => w !== base) ?? base;
  return {
    base,
    scrambled,
    example,
    difficulty,
  };
}
export function checkGuess(base: string, guess: string, difficulty = "easy") {
  loadDifficulty(difficulty);

  const dict = dictSets[difficulty];
  const groups = groupsMap[difficulty];
  if (!base || !guess) return { ok: false, reason: "Missing base or guess" };
  if (!groups) throw new Error(`Internal error: groups not initialized for "${difficulty}"`);
  if (!dict) throw new Error(`Internal error: dict not initialized for "${difficulty}"`);
  const ok = isAnagramOf(base, guess, dict);
  const sig = base.split("").sort().join("");
  const group = groups.get(sig) || [];
  const example = group.find(w => w !== base) || null;
  return { ok, example };
}
