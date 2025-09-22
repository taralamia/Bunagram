import * as readline from "node:readline";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  loadDictionary,
  groupBySignature
} from "../lib/utils.ts";
import { isAnagramOf } from "../lib/game.ts";
import { randomChoice, type NonEmptyArray } from "../lib/utils.ts";

function ask(rl: readline.Interface, q: string) {
  return new Promise<string>(res => rl.question(q, res));
}
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]] as [T, T];
  }
  return shuffled;
}
async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const dictPath = resolve(__dirname, "words.txt");
  const words = loadDictionary(dictPath);
  const dict = new Set(words);
  const groups = groupBySignature(words);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const closeRL = () => {
    try {
      rl.close();
    } catch {
      /* ignore */
    }
  };
  process.on("SIGINT", () => {
    console.log("\nBye!");
    closeRL();
    process.exit(0);
  });

  const usedSigs = new Set<string>();
  const allSigs = Array.from(groups.keys()).filter(sig => {
    const groupWords = groups.get(sig);
    return groupWords && groupWords.length >= 2;
  });
  function pickNoRepeat(g: Map<string, string[]>) {
    if (allSigs.length === 0) {
      throw new Error("No playable groups. Add more words.");
    }
    if (usedSigs.size >= allSigs.length) {
      usedSigs.clear();
    }
    const availableSigs = allSigs.filter(sig => !usedSigs.has(sig));

    if (availableSigs.length === 0) {
      throw new Error("No available signatures found.");
    }

    const randomSig = randomChoice(availableSigs as NonEmptyArray<string>);
    usedSigs.add(randomSig);

    const anagrams = groups.get(randomSig) || [];
    const shuffledAnagrams = shuffleArray(anagrams);

    const base = shuffledAnagrams[0];
    if (!base) {
      throw new Error("No valid base word found.");
    }

    return {
      base,
      anagrams: shuffledAnagrams,
      sig: randomSig,
    };
  }

  console.log("🎲 Welcome to Bunagram!");
  let score = 0;

  try {
    while (true) {
      const { base, anagrams } = pickNoRepeat(groups);
      console.log(`Base word: ${base}`);

      const raw = await ask(rl, "Your guess: ");
      const guess = raw.trim().toLowerCase();

      if (isAnagramOf(base, guess, dict)) {
        score += 1;
        console.log("✅ Correct! You earn 1 point.");
      } else {
        // Find an alternative anagram that's not the base word
        const alt = anagrams.find(w => w !== base);
        console.log(`❌ Wrong! Example valid anagram: ${alt || "(none)"}`);
      }

      console.log(`Score: ${score}`);
      const again = (await ask(rl, "Play again? (y/n) ")).trim().toLowerCase();
      if (again !== "y") break;
      console.log();
    }
  } finally {
    closeRL();
  }
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
