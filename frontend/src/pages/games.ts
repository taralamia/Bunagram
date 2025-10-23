import { pick, check } from "../utils/api";
import { showToast } from "../ui/toast";
import { celebrate } from "../ui/confetti";
import type { PickResult, CheckResult, Difficulty } from "../types";

function parseHash(): { difficulty: Difficulty } {
  const [, query] = location.hash.split("?");
  const params = new URLSearchParams(query);
  const diff = (params.get("difficulty") ?? "easy").toLowerCase();
  if (diff === "medium" || diff === "hard") {
    return { difficulty: diff as Difficulty };
  }
  return { difficulty: "easy" };
}

function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case "easy": return "text-indigo-300";
    case "medium": return "text-amber-300";
    case "hard": return "text-red-300";
    default: return "text-indigo-300";
  }
}

function getDifficultyButtonClass(difficulty: Difficulty): string {
  const baseClasses = "px-6 py-3 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-4";
  switch (difficulty) {
    case "easy": 
      return `${baseClasses} bg-indigo-100 hover:bg-indigo-200 text-gray-900 focus:ring-indigo-400`;
    case "medium":
      return `${baseClasses} bg-amber-100 hover:bg-amber-200 text-gray-900 focus:ring-amber-400`;
    case "hard":
      return `${baseClasses} bg-red-100 hover:bg-red-200 text-gray-900 focus:ring-red-400`;
    default:
      return `${baseClasses} bg-indigo-100 hover:bg-indigo-200 text-gray-900 focus:ring-indigo-400`;
  }
}

export async function showGame(root: HTMLElement): Promise<void> {
  const { difficulty } = parseHash();
  const difficultyColor = getDifficultyColor(difficulty);

  root.innerHTML = `
    <div class="card-surface transform scale-95 mt-16" role="main" aria-label="Word Scramble Game">
      <div class="text-center space-y-8">
        <!-- Header -->
        <div class="space-y-3">
          <h1 class="text-2xl font-mono text-gray-300 text-center font-normal">Unscramble the Word</h1>
          <div class="flex items-center justify-center gap-2">
            <span class="text-lg text-gray-400">Difficulty:</span>
            <span id="diff" class="text-xl font-semibold ${difficultyColor}">${difficulty}</span>
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

  const scrambledEl = root.querySelector<HTMLDivElement>("#scrambled")!;
  const scoreEl = root.querySelector<HTMLDivElement>("#score")!;
  const guessInput = root.querySelector<HTMLInputElement>("#guess")!;
  const checkBtn = root.querySelector<HTMLButtonElement>("#checkBtn")!;
  const skipBtn = root.querySelector<HTMLButtonElement>("#skipBtn")!;

  let current: PickResult | null = null;
  let score = 0;

  async function loadNext(): Promise<void> {
    try {
      current = await pick(difficulty);
      scrambledEl.textContent = current.scrambled;
      guessInput.value = "";
      guessInput.focus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast("Failed to load word: " + msg, { type: "error" });
    }
  }

  await loadNext();

  checkBtn.addEventListener("click", async () => {
    if (!current) return;
    const guess = guessInput.value.trim();
    if (!guess) {
      showToast("Type a guess first", { type: "info" });
      return;
    }

    try {
      const res: CheckResult = await check(current.base, guess, difficulty);
      if (res.ok) {
        score++;
        scoreEl.textContent = `Score: ${score}`;
        celebrate();
        showToast("Correct! Play again?", {
          type: "success",
          actions: [
            { label: "Yes", onClick: async () => { await loadNext(); } },
            { label: "Stop", onClick: () => { location.hash = "#/"; } }
          ]
        });
      } else {
        showToast(` Wrong! Example ${res.example ?? "-"}`, {
          type: "error",
          actions: [
            { label: "Try next", onClick: async () => await loadNext() },
            { label: "Stop", onClick: () => { location.hash = "#/"; } }
          ]
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast("Network error: " + msg, { type: "error" });
    }
  });

  skipBtn.addEventListener("click", async () => {
    showToast("Skipped. Showing next...", { type: "info" });
    await loadNext();
  });

  guessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkBtn.click();
  });
}