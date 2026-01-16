type ToastAction = { label: string; onClick: (ev: MouseEvent) => void };
type ToastOptions = {
  type?: "info" | "success" | "error" | "warn";
  duration?: number;
  actions?: ToastAction[];
  variant?: "default" | "soft";
};

const ROOT_ID = "bunagram-toast-root";
let rootEl: HTMLDivElement | null = null;

const BASE_CARD =
  "pointer-events-auto max-w-sm w-full mx-auto rounded-2xl backdrop-blur-md border border-white/10 " +
  "shadow-xl flex items-center gap-4 p-4 " +
  "animate-in fade-in zoom-in duration-300";

const ICON_BASE =
  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"; // <- text-lg for visual weight


const TEXT_BASE = "flex-1 text-sm font-medium text-gray-100 break-words";

function ensureRoot(): HTMLDivElement {
  if (rootEl) return rootEl;
  const existing = document.getElementById(ROOT_ID) as HTMLDivElement | null;
  if (existing) {
    rootEl = existing;
    return rootEl;
  }
  const el = document.createElement("div");
  el.id = ROOT_ID;
  el.setAttribute("aria-live", "polite");
  Object.assign(el.style, {
  position: "fixed",
  right: "1rem",
  bottom: "1rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "0.75rem",
  zIndex: "1000",
  pointerEvents: "none",
});

  document.body.appendChild(el);
  rootEl = el;
  return el;
}
function iconForType(type?: ToastOptions["type"]) {
  switch (type) {
    case "success": return { bg: "bg-emerald-500/80", text: "✓" };
    case "error":   return { bg: "bg-rose-500/80",    text: "!" };   // changed from "X"
    case "warn":    return { bg: "bg-amber-500/80",  text: "!" };
    default:        return { bg: "bg-indigo-500/80", text: "i" };
  }
}
export function showToast(message: string, opts: ToastOptions = {}) {
  const root = ensureRoot();
  const card = document.createElement("div");
  const icon = iconForType(opts.type);
  const variantBg = opts.variant === "soft" ? "bg-gray-900/60" : "bg-gray-900/80";
  card.tabIndex = -1;
  card.className = `${BASE_CARD} ${variantBg}`;
  card.style.pointerEvents = "auto";
  const remove = () => {
    if (timeoutId !== null) clearTimeout(timeoutId);
    card.classList.remove("animate-in", "fade-in", "zoom-in");
    card.classList.add("animate-out", "fade-out", "slide-out-to-top", "duration-300");
    setTimeout(() => {
      card.remove();
      if (!root.children.length) {
        root.remove();
        rootEl = null;
      }
    }, 300);
  };
  const iconNode = document.createElement("div");
  iconNode.className = `${ICON_BASE} ${icon.bg}`;
  iconNode.textContent = icon.text;
  card.appendChild(iconNode);
  const content = document.createElement("div");
  content.className = "flex-1 pr-2";
  const text = document.createElement("div");
  text.className = TEXT_BASE;
  text.textContent = message;
  content.appendChild(text);
  if (opts.actions?.length) {
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "flex gap-2 items-center mt-3";
    opts.actions.forEach(action => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "px-3 py-1 rounded bg-white/10 text-white text-xs font-medium hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 transition";
      btn.tabIndex = -1;
      btn.textContent = action.label;
      btn.addEventListener("click", async(ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        stopTimer();
        try {
        await Promise.resolve(action.onClick(ev));
      } catch (err) {
        //console.error("Toast action failed:", err);
      } finally {
        remove(); 
      }
    });

      actionsWrap.appendChild(btn);
    });
    content.appendChild(actionsWrap);
  }
  card.appendChild(content);
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = `
    <svg class="w-5 h-5 text-gray-400 hover:text-white transition" 
         fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M6 18L18 6M6 6l12 12"/>
    </svg>
  `;
  closeBtn.className = "ml-auto p-1 rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.tabIndex = -1;
  closeBtn.addEventListener("click", remove);
  card.appendChild(closeBtn);

  root.appendChild(card);
  const duration = opts.duration ?? 4000;
  let timeoutId: number | null = null;

  const startTimer = () => {
    timeoutId = window.setTimeout(remove, duration);
  };
  const stopTimer = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  card.addEventListener("mouseenter", stopTimer);
  card.addEventListener("mouseleave", startTimer);
  startTimer();
}