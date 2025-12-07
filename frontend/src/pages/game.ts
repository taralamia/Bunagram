import { pick, check } from "../utils/api";
import { showToast } from "../ui/toast";
import { celebrate } from "../ui/confetti";
import type { PickResult, CheckResult, Difficulty } from "../types";
import { scrambleWord } from "../utils/string";

function getDifficultyFromHash(): { difficulty: Difficulty } {
  const [, query] = location.hash.split("?");
  const params = new URLSearchParams(query);
  const diff = (params.get("difficulty") ?? "easy").toLowerCase();
  if (diff === "medium" || diff === "hard") {
    return { difficulty: diff as Difficulty };
  }
  return { difficulty: "easy" };
}

function getDifficultyColor(difficulty: Difficulty): string {
  return difficulty === "medium" ? "text-black" : "text-white";
}

function getDifficultyButtonClass(difficulty: Difficulty): string {
  const base = "px-6 py-3 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-4";
  switch (difficulty) {
    case "easy":
      return `${base} bg-indigo-100 hover:bg-indigo-200 text-gray-900 focus:ring-indigo-400`;
    case "medium":
      return `${base} bg-amber-100 hover:bg-amber-200 text-gray-900 focus:ring-amber-400`;
    case "hard":
      return `${base} bg-red-100 hover:bg-red-200 text-gray-900 focus:ring-red-400`;
  }
}

export async function showGame(root: HTMLElement): Promise<void> {
  const { difficulty } = getDifficultyFromHash();
  const difficultyColorClass = getDifficultyColor(difficulty);

  root.innerHTML = `
    <div class="card-surface transform scale-95 mt-16" role="main" aria-label="Word Scramble Game">
      <div class="text-center space-y-8">
        <!-- Header -->
        <div class="space-y-3">
          <h1 class="text-2xl font-mono text-gray-300 text-center font-normal">Unscramble the Word</h1>
          <div class="flex items-center justify-center gap-2">
            <span class="text-lg text-gray-400">Difficulty:</span>
            <span id="diff" class="text-xl font-semibold ${difficultyColorClass}">${difficulty}</span>
          </div>
        </div>

        <!-- Scrambled Word -->
        <div class="py-8 px-8 bg-gray-900/50 rounded-2xl border border-gray-700/50">
          <div id="scrambled" class="text-5xl font-mono font-bold tracking-wider text-gray-100"></div>
        </div>

        <!-- Score -->
        <div id="score" class="text-lg font-mono text-gray-300">Score: 0</div>

        <!-- Input Area -->
        <div class="space-y-6">
          <input 
            id="guess" 
            class="w-full px-6 py-4 rounded-2xl border border-gray-600 bg-gray-800/50 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center font-medium text-lg" 
            placeholder="Type your guess here..."
            autocomplete="off"
            spellcheck="false"
          />
          
          <!-- Action Buttons -->
          <div class="btn-row pt-4">
            <button id="checkBtn" class="${getDifficultyButtonClass(difficulty)}">
              Check Answer
            </button>
            <button id="skipBtn" class="px-6 py-3 rounded-lg text-sm font-semibold bg-gray-600 hover:bg-gray-500 text-gray-100 transition focus:outline-none focus:ring-4 focus:ring-gray-400">
              Skip
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="pt-6">
          <a href="#/" class="text-lg text-indigo-300 hover:text-indigo-200 transition-colors font-mono">
            ← Back to Menu
          </a>
        </div>
      </div>
    </div>
  `;

  const scrambled = root.querySelector<HTMLDivElement>("#scrambled")!;
  const scoreContainer = root.querySelector<HTMLDivElement>("#score")!;
  const guess = root.querySelector<HTMLInputElement>("#guess")!;
  const checkButton = root.querySelector<HTMLButtonElement>("#checkBtn")!;
  const skipButton = root.querySelector<HTMLButtonElement>("#skipBtn")!;
  const badge = root.querySelector<HTMLElement>("#diff")!;

  badge.className = `text-xl font-semibold ${difficultyColorClass}`;
  badge.textContent = difficulty;

  let currentBase = "";  // We'll store just the base string here
  let score = 0;

  async function loadNext(): Promise<void> {
    try {
      const response: PickResult = await pick(difficulty);
      const baseWord = response.candidate.base;

      currentBase = baseWord;
      scrambled.textContent = scrambleWord(baseWord).toUpperCase();

      guess.value = "";
      guess.focus();
    } catch (err) {
      showToast("Failed to load word: " + String(err), { type: "error" });
    }
  }

  async function handleCheck(): Promise<void> {
    if (!currentBase) return;
    const playerGuess = guess.value.trim();
    if (!playerGuess) {
      showToast("Type a guess first", { type: "info" });
      return;
    }

    try {
      const res: CheckResult = await check(currentBase, playerGuess, difficulty);

      if (res.isCorrect) {
        score++;
        scoreContainer.textContent = `Score: ${score}`;
        celebrate();
        showToast("Correct! Play again?", {
          type: "success",
          actions: [
            { label: "Yes", onClick: loadNext },
            { label: "Stop", onClick: () => location.hash = "#/" }
          ]
        });
      } else {
        showToast("Wrong! Try again", {
          type: "error",
          actions: [
            { label: "Next", onClick: loadNext },
            { label: "Stop", onClick: () => location.hash = "#/" }
          ]
        });
      }
    } catch (err) {
      showToast("Network error", { type: "error" });
    }
  }

  checkButton.onclick = () => void handleCheck();
  skipButton.onclick = () => {
    showToast("Skipped", { type: "info" });
    loadNext();
  };
  guess.onkeydown = (e) => e.key === "Enter" && void handleCheck();

  await loadNext();
}