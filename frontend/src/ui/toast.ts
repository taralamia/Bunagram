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
  "pointer-events-auto max-w-md w-full mx-auto rounded-xl shadow-md overflow-hidden flex items-center gap-3 p-3";
const ICON_BASE = "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold";
const TEXT_BASE = "text-sm font-medium text-white break-words";
const ACTION_BTN = "px-3 py-1 rounded-md text-sm font-medium bg-white/90 text-black hover:bg-white transition";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function ensureRoot() {
  if (rootEl) return rootEl;
  const r = el("div", "fixed left-1/2 -translate-x-1/2 bottom-8 transform p-0 rounded z-50 pointer-events-none flex flex-col items-center gap-2");
  r.setAttribute("role", "status");
  r.setAttribute("aria-live", "polite");
  r.id = ROOT_ID;
  document.body.appendChild(r);
  rootEl = r;
  return r;
}

function clearRoot() {
  if (!rootEl) return;
  rootEl.innerHTML = "";
}

export function hideToast() {
  if (!rootEl) return;
  clearRoot();
}

export function showToast(message: string, options?: ToastOptions) {
  const { type = "info", duration = 3000, actions, variant = "default" } = options ?? {};
  const root = ensureRoot();
  clearRoot();

  const card = el("div", BASE_CARD);
  if (type === "success") card.className += " bg-emerald-500";
  else if (type === "error") card.className += " bg-violet-600" ;
  else if (type === "warn") card.className += " bg-amber-500";
  else card.className += " bg-gray-700";

  const icon = el("div", ICON_BASE);
  if (type === "success") { icon.className += " bg-emerald-600"; icon.textContent = "✔"; }
  else if (type === "error") { icon.className +=" bg-violet-700"; icon.textContent = "✖"; }
  else if (type === "warn") { icon.className += " bg-amber-600"; icon.textContent = "!"; }
  else { icon.className += " bg-gray-600"; icon.textContent = "i"; }

  const txtWrap = el("div", "flex-1 min-w-0");
  const txt = el("div", TEXT_BASE, message);
  txtWrap.appendChild(txt);

  let actionsEl: HTMLDivElement | null = null;
  if (actions && actions.length > 0) {
    actionsEl = el("div", "flex gap-2 items-center");
    actions.forEach(a => {
      const b = el("button", ACTION_BTN, a.label);
      b.addEventListener("click", (ev) => {
        try { a.onClick(ev as MouseEvent); } catch { /* swallow */ }
        hideToast();
      });
      actionsEl!.appendChild(b);
    });
  }

  card.appendChild(icon);
  card.appendChild(txtWrap);
  if (actionsEl) card.appendChild(actionsEl);
  root.appendChild(card);

  card.style.opacity = "0";
  card.style.transform = "translateY(8px)";
  card.style.transition = "opacity 180ms ease, transform 180ms ease";
  requestAnimationFrame(() => {
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
  });
  let timeoutId: number | null = null;
  const startTimer = () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    if (!actions || actions.length === 0) {
      timeoutId = window.setTimeout(() => {
        card.style.opacity = "0";
        card.style.transform = "translateY(8px)";
        setTimeout(() => clearRoot(), 200);
      }, duration);
    }
  };
  const stopTimer = () => {
    if (timeoutId) { window.clearTimeout(timeoutId); timeoutId = null; }
  };

  card.addEventListener("mouseenter", stopTimer);
  card.addEventListener("mouseleave", startTimer);

  startTimer();
}
