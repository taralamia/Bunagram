import { showLanding } from "./pages/landing";
import { showGame } from "./pages/game";
const routes: Record<string, (root: HTMLElement) => void | Promise<void>> = {
  "": showLanding,
  "#/": showLanding,
  "#/game": showGame
};
let currentRoute = "";
function setLayout(mode: "home" | "game") {
  const header = document.getElementById("site-header");
  const main = document.querySelector("main");

  if (!header || !main) return;

  if (mode === "game") {
    header.style.display = "none";
    document.body.style.overflow = "hidden";

    main.classList.remove("pt-24", "items-start");
    main.classList.add("items-center");
  } else {
    header.style.display = "";
    document.body.style.overflow = "";

    main.classList.remove("items-center");
    main.classList.add("pt-24", "items-start");
  }
}
function router(): void {
  const hash = location.hash || "#/";
  const root = document.getElementById("app");
  if (!root) throw new Error("Missing #app mount element");

  const [path] = hash.split("?");
  if (path === currentRoute) return;
  currentRoute = path;
   if (path === "#/game") {
    setLayout("game");
  } else {
    setLayout("home");
  }
  const routeFn = routes[path] ?? showLanding;
  void routeFn(root);
}
window.addEventListener("hashchange", router);
window.addEventListener("load", router);

