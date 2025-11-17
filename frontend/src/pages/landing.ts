import type { Difficulty } from "../types";
export function showLanding(root: HTMLElement): void {
   root.innerHTML = `
    <div class="card-surface" role="region" aria-label="Pick difficulty">
      <p class="card-title">Pick difficulty</p>
      <div class="btn-row">
        <button data-diff="easy" class="diff-btn diff-btn--easy" aria-pressed="false">Easy</button>
        <button data-diff="medium" class="diff-btn diff-btn--medium" aria-pressed="false">Medium</button>
        <button data-diff="hard" class="diff-btn diff-btn--hard" aria-pressed="false">Hard</button>
      </div>
    </div>
  `;
  const btns = Array.from(root.querySelectorAll<HTMLButtonElement>("button[data-diff]"));
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const diff = btn.getAttribute("data-diff") as Difficulty | null;
      if (!diff) return;
      location.hash = `#/game?difficulty=${encodeURIComponent(diff)}`;
    });
  });
}