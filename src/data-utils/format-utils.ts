export function formatTime(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${round(ms / 1000)}s`
}


export function round(n: number, numDecimals: number = 1) {
  const factor = Math.pow(10, numDecimals)
  return Math.round(n * factor) / factor
}
