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
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const defaultPath = resolve(__dirname, "../lib/words_easy.txt"); 
  const pathToUse = dictPath ?? defaultPath;
  const words = loadDictionary(pathToUse);
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