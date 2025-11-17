import { showLanding } from "./pages/landing";
import { showGame } from "./pages/game";
const routes: Record<string, (root: HTMLElement) => void | Promise<void>> = {
  "": showLanding,
  "#/": showLanding,
  "#/game": showGame
};
function router(): void {
  const hash = location.hash || "#/";
  const root = document.getElementById("app");
  if (!root) throw new Error("Missing #app mount element");

  const [path] = hash.split("?");
  const routeFn = routes[path] ?? showLanding;
  void routeFn(root);
}
window.addEventListener("hashchange", router);
window.addEventListener("load", router);

