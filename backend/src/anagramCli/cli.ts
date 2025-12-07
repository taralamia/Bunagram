import * as readline from "node:readline";
import { games } from "../service/anagramService";
import { createAnagramGame, checkAnagram, type AnagramGame } from "../service/anagramService";
function ask(rl: readline.Interface, q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, resolve));
}
function shuffleArray<T>(array: T[]): T[] {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a === undefined || b === undefined) {
      throw new Error("shuffleArray: unexpected undefined element");
    }
    out[i] = b;
    out[j] = a;
  }
  return out;
}
function randomChoice<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error("randomChoice: cannot pick from an empty array");
  }
  const index = Math.floor(Math.random() * arr.length);
  const item = arr[index];
  if (item === undefined) {
    throw new Error("randomChoice: unexpected undefined element");
  }
  return item;
}
function createPicker(game: AnagramGame) {
  const usedSigs = new Set<string>();

  const allSigs = Array.from(game.groups.keys()).filter((sig) => {
    const groupWords = game.groups.get(sig);
    return !!groupWords && groupWords.length >= 2;
  });

  if (allSigs.length === 0) {
    throw new Error("No playable groups found in dictionary. Add more words.");
  }

  return function pickNoRepeat() {
    if (usedSigs.size >= allSigs.length) {
      usedSigs.clear(); // reset once all used
    }

    const available = allSigs.filter((s) => !usedSigs.has(s));
    if (available.length === 0) {
      usedSigs.clear();
    }
    const sig = randomChoice(available.length ? available : allSigs);
    usedSigs.add(sig);
    const group = game.groups.get(sig) ?? [];
    const shuffled = shuffleArray(group);
    const base = shuffled[0];
    if (!base) throw new Error("No valid base word found.");

    return { base, anagrams: shuffled, sig };
  };
}
async function main() {
  const game = games.easy;
  const pick = createPicker(game);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const closeRl = () => {
    try {
      rl.close();
    } catch {
      // ignore
    }
  };

  process.on("SIGINT", () => {
    console.log("\nBye!");
    closeRl();
    process.exit(0);
  });

  console.log("🎲 Welcome to Bunagram (CLI)!");
  let score = 0;

  try {
    while (true) {
      const { base, anagrams } = pick();
      console.log(`Base word: ${base}`);

      const raw = await ask(rl, "Your guess: ");
      const guess = raw.trim().toLowerCase();

      if (guess.length === 0) {
        console.log("Please enter a guess (or press Ctrl+C to exit).");
      } else if (checkAnagram(base, guess, game)) {
        score += 1;
        console.log("✅ Correct! You earn 1 point.");
      } else {
        const alt = anagrams.find((w) => w !== base);
        console.log(`❌ Wrong! Example valid anagram: ${alt ?? "(none)"}`);
      }

      console.log(`Score: ${score}`);
      const again = (await ask(rl, "Play again? (y/n) ")).trim().toLowerCase();
      if (again !== "y") break;
      console.log();
    }
  } finally {
    closeRl();
  }
}
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
