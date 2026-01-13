declare const confetti: ((
  opts?: {
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    zIndex?: number;
  }
) => void) | undefined;

export function celebrate(): void {
  try {
    if (typeof confetti !== "function") {
      // Fallback if CDN failed
      document.body.animate(
        [{ filter: "brightness(1)" }, { filter: "brightness(1.4)" }, { filter: "brightness(1)" }],
        { duration: 600 }
      );
      return;
    }

    const duration = 1200;
    const end = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const frame = () => {
      const timeLeft = end - Date.now();
      if (timeLeft <= 0) return;

      const particleCount = Math.round(50 * (timeLeft / duration));

      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });

      requestAnimationFrame(frame);
    };

    frame();
  } catch {
    // silent fallback
  }
}