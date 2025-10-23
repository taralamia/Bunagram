declare const confetti: ((opts?: { particleCount?: number; spread?: number; origin?: { y?: number } }) => void) | undefined;
export function celebrate(): void {
  try {
    if (typeof confetti === "function") {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } else {
      document.body.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.3)" }, { filter: "brightness(1)" }], { duration: 500 });
    }
  } catch {
    // swallow silent errors - confetti should be non-critical
  }
}