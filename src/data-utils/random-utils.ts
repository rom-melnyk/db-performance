export function random(from: number, to: number): number {
  return Math.floor(Math.random() * Math.abs(to - from)) + Math.min(from, to)
}


export function pickRandom<T>(array: T[]): T {
  return array[random(0, array.length)]
}


/**
 * Return `true` with given % of probability.
 *
 * @param {} n Chancep percentage (0..100)
 */
export function withChances(n: number): boolean {
  return Math.random() < n / 100
}
