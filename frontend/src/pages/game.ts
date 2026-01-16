import { pick, check } from "../utils/api";
import { showToast } from "../ui/toast";
import { celebrate } from "../ui/confetti";
import type { PickResult, CheckResult, Difficulty } from "../types";

function getDifficultyFromHash(): { difficulty: Difficulty } {
  const [, query] = location.hash.split("?");
  const params = new URLSearchParams(query);
  const diff = (params.get("difficulty") ?? "easy").toLowerCase();
  if (diff === "medium" || diff === "hard") return { difficulty: diff as Difficulty };
  return { difficulty: "easy" };
}

function getDifficultyColor(difficulty: Difficulty): string {
  return difficulty === "medium" ? "text-black" : "text-white";
}

function getDifficultyButtonClass(difficulty: Difficulty): string {
  const base = "px-6 py-3 rounded-lg text-sm font-semibold transition focus:outline-none focus:ring-4";
  switch (difficulty) {
    case "easy": return `${base} bg-indigo-100 hover:bg-indigo-200 text-gray-900 focus:ring-indigo-400`;
    case "medium": return `${base} bg-amber-100 hover:bg-amber-200 text-gray-900 focus:ring-amber-400`;
    case "hard": return `${base} bg-red-100 hover:bg-red-200 text-gray-900 focus:ring-red-400`;
  }
}
export async function showGame(root: HTMLElement): Promise<void> {
  const { difficulty } = getDifficultyFromHash();
  const difficultyColorClass = getDifficultyColor(difficulty);
  root.innerHTML = `
  <div class="card-surface max-w-md w-full" role="main" aria-label="Word Scramble Game">
    <div class="text-center space-y-8">
      <div class="space-y-3">
        <h1 class="text-2xl font-mono text-gray-300 font-normal">
          Unscramble the Word
        </h1>
        <div class="flex items-center justify-center gap-2">
          <span class="text-lg text-gray-400">Difficulty:</span>
          <span id="diff" class="text-xl font-semibold ${difficultyColorClass}">
            ${difficulty}
          </span>
        </div>
      </div>

      <!-- SCRAMBLED WORD -->
      <div class="py-6 px-6 bg-gray-900/50 rounded-2xl border border-gray-700/50">
        <div
          id="scrambled"
          class="min-h-[4rem] flex items-center justify-center
                 text-4xl font-mono font-bold tracking-wider
                 text-gray-100 text-center
                 whitespace-nowrap overflow-hidden text-ellipsis"
        >
          — — —
        </div>
      </div>

      <div id="score" class="text-lg font-mono text-gray-300">
        Score: 0
      </div>

      <div class="space-y-6">
        <input
          id="guess"
          class="w-full px-6 py-4 rounded-2xl border border-gray-600
                 bg-gray-800/50 text-gray-100 placeholder-gray-400
                 focus:outline-none focus:ring-2 focus:ring-indigo-500
                 text-center font-medium text-lg"
          placeholder="Type your guess here..."
          autocomplete="off"
          spellcheck="false"
        />

        <div class="btn-row pt-4">
          <button id="checkBtn" class="${getDifficultyButtonClass(difficulty)}">
            Check Answer
          </button>

          <button
            id="skipBtn"
            class="px-6 py-3 rounded-lg text-sm font-semibold
                   bg-gray-600 hover:bg-gray-500 text-gray-100
                   transition focus:outline-none focus:ring-4
                   focus:ring-gray-400"
          >
            Skip
          </button>
        </div>
      </div>

      <div class="pt-6">
        <a href="#/" class="text-lg text-indigo-300 hover:text-indigo-200 font-mono">
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

  let current: PickResult | null = null;
  let score = 0;
  async function loadNext(): Promise<void> {
    try {
      current = await pick(difficulty);
      scrambled.textContent = current.scrambled;
      guess.value = "";
      guess.placeholder = "Type your guess here...";
      guess.disabled = false;
      checkButton.disabled = false;
      skipButton.disabled = false;
      guess.focus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast("Failed to load word: " + msg, { type: "error" });
    }
  }

  async function handleCheck(): Promise<void> {
    if (!current) return;
    const playerGuess = guess.value.trim();
    if (!playerGuess) {
      showToast("Type a guess first", { type: "info" });
      return;
    }
    try {
      const res: CheckResult = await check(current.base, playerGuess, difficulty);
      if (res.ok) {
        score++;
        scoreContainer.textContent = `Score: ${score}`;
        celebrate();
        showToast("Correct! Play again?", {
          type: "success",
          actions: [
            { label: "Yes", onClick: async () => { await loadNext(); } },
            { label: "Stop", onClick: () => { location.hash = "#/"; } }
          ]
        });
      } else {
        showToast(`Wrong! Example: ${res.example ?? "-"}`, {
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
  }

  checkButton.addEventListener("click", handleCheck);
  skipButton.addEventListener("click", async () => {
    showToast("Skipped. Showing next...", { type: "info" });
    await loadNext();
  });
  guess.addEventListener("keydown", (e) => {
    if (e.key === "Enter") void handleCheck();
  });
  void loadNext();
}

