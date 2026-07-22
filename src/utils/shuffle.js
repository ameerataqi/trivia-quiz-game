/**
 * Fisher–Yates shuffle. Returns a new array — the input is never mutated,
 * which matters because the question bank is a shared imported module.
 */
export function shuffle(input) {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/** Returns up to `count` randomly chosen items. */
export function sample(input, count) {
  return shuffle(input).slice(0, count);
}

export default shuffle;
