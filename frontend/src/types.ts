export type Difficulty = "easy" | "medium" | "hard";
export type PickResult = {
  base: string;
  scrambled: string;
  example: string;
  difficulty: Difficulty | string;
};
export type CheckResult = {
  ok: boolean;
  example: string | null;
  reason?: string;
};
