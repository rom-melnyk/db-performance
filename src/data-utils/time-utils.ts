export class Tracer {
  private readonly startedAt: number
  private step: number
  private readonly name?: string


  constructor(name?: string) {
    this.startedAt = Date.now()
    this.step = this.startedAt

    if (name) {
      this.name = name
      console.info(`🕐 "${name}" started`)
    }
  }


  trace(name?: string) {
    const now = Date.now()
    let msg = this.name ?? ""
    if (name) msg += (msg ? ": " : "") + name
    if (!msg) msg = "—"
    console.info(`🕐 "${msg}" lasted ${this.format(now - this.step)}`)
    this.step = now
  }


  private format(n: number) {
    if (n < 1000) return `${n}ms`
    return `${this.round(n / 1000)}s`
  }


  private round(n: number, numDecimals: number = 1) {
    const factor = Math.pow(10, numDecimals)
    return Math.round(Math.round(n) * factor) / factor
  }
}