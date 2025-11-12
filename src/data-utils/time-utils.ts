import { formatTime } from "./format-utils.ts"

export class Tracer {
  private static counter = 0

  private readonly startedAt: number
  private lastStepAt: number
  private stepNo = 0
  private readonly name?: string


  constructor(name?: string) {
    this.startedAt = Date.now()
    this.lastStepAt = this.startedAt

    if (!name) {
      Tracer.counter++
      name = `Tracer ${Tracer.counter}`
    }

    this.name = name
    console.info(`🕐 ${name} started`)
  }


  step(name?: string) {
    const now = Date.now()
    this.stepNo++
    let msg = `· ${this.name}: (${this.stepNo})`
    if (name) msg += ` ${name}`
    console.info(`🕐 ${msg} lasted ${formatTime(now - this.lastStepAt)}`)
    this.lastStepAt = now
  }


  end() {
    const now = Date.now()
    let steps = `${this.stepNo || 1} step`
    if (this.stepNo > 1) steps += "s" // Pluralize
    console.info(`🕐 "${this.name}: ${steps}" lasted in total ${formatTime(now - this.startedAt)}`)
  }
}