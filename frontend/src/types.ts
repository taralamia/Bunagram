export type Difficulty = "easy" | "medium" | "hard";
export type PickResult = {
  success: true;
  candidate: {
    base: string;
  };
};
export type CheckResult = {
  success: true;
  isCorrect: boolean;
};