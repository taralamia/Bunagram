import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { loadDictionary, groupBySignature } from "../lib";
import type { Candidate } from "../lib";
import { pickBaseWord, isAnagramOf } from "../lib";
export type AnagramGame = {
  dict: Set<string>;
  groups: Map<string, string[]>;
};
export function createAnagramGame(dictPath?: string): AnagramGame {
  const words = loadDictionary(dictPath!);
  const dict = new Set(words);
  const groups = groupBySignature(words);
  return { dict, groups };
}
export function pickBase(game: AnagramGame): Candidate {
  return pickBaseWord(game.groups);
}
export function checkAnagram(base: string, guess: string, game: AnagramGame): boolean {
  return isAnagramOf(base, guess, game.dict);
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const easyPath = resolve(__dirname, "../lib/words_easy.txt");
const mediumPath = resolve(__dirname, "../lib/words_medium.txt");
const hardPath = resolve(__dirname, "../lib/words_hard.txt");

// preload at startup
export const games: Record<"easy" | "medium" | "hard", AnagramGame> = {
  easy: createAnagramGame(easyPath),
  medium: createAnagramGame(mediumPath),
  hard: createAnagramGame(hardPath),
};
export function getGame(difficulty?: string): AnagramGame {
  switch ((difficulty ?? "easy").toLowerCase()) {
    case "medium":
      return games.medium;
    case "hard":
      return games.hard;
    default:
      return games.easy;
  }
}
