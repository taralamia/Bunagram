import * as readline from "node:readline";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  loadDictionary,
  groupBySignature,
  wordSignature,
} from "../lib/utils.ts";
import { pickBaseWord, isAnagramOf } from "../lib/game.ts";
function ask(rl: readline.Interface, q: string) {
  return new Promise<string>(res => rl.question(q, res));
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

  function pickNoRepeat(g: Map<string, string[]>) {
    const playableSigs = Array.from(g.entries())
      .filter(([, words]) => (words?.length ?? 0) >= 2)
      .map(([sig]) => sig);

    if (playableSigs.length === 0) {
      throw new Error("No playable groups. Add more words.");
    }
    if (usedSigs.size >= playableSigs.length) {
      usedSigs.clear();
    }
    while (true) {
      const { base, anagrams } = pickBaseWord(g);
      const sig = wordSignature(base);
      if (!usedSigs.has(sig)) {
        usedSigs.add(sig);
        return { base, anagrams, sig };
      }
    }
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
        const alt = anagrams.find(w => w !== base);
        console.log(`❌ Wrong! Example valid anagram: ${alt ?? "(none)"}`);
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
