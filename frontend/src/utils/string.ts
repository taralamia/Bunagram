export function scrambleWord(word: string): string {
  let result: string;
  do {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    result = letters.join("");
  } while (result === word);
  return result;
}