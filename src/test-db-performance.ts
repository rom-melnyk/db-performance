import { random } from "./data-utils/random-utils.ts";
import { Tracer } from "./data-utils/time-utils.ts";
import { connect, query, shutdown, testConnection } from "./pg-utils/index.ts"

;(async () => {
  await connect()
  await testConnection()

  try {
    const queryTpl = `
      SELECT a.tid, a.interval, a.bid
      FROM availability AS a
      WHERE tid = {{tid}}
      AND interval >= '{{from}}'
      AND interval < '{{to}}'
    `

    const times: number[] = []
    const NUM_RUNS = 200
    const minTime = new Date("2025/01/01").getTime()
    const maxTime = new Date("2026/01/01").getTime()

    const tracer = new Tracer("SELECT")

    for (let i = 0; i < NUM_RUNS; i++) {
      const fromTime = random(minTime, maxTime)
      const fromDate = new Date(fromTime)
      const toDate = new Date(fromDate)
      toDate.setTime(fromTime + 24 * 3600 * 1000)

      const fromDateStr = fromDate.toJSON().substring(0, 10)
      const toDateStr = toDate.toJSON().substring(0, 10)

      const q = queryTpl
        .replace("{{tid}}", `${random(1, 1000)}`)
        .replace("{{from}}", `${fromDateStr}`)
        .replace("{{from}}", `${toDateStr}`)

      const timeNow = Date.now()
      await query(q)
      times.push(Date.now() - timeNow)
    }

    tracer.trace(`${NUM_RUNS} queries`)
    const avgTime = times.reduce((sum, t) => sum + t) / NUM_RUNS
    console.info(`ℹ️ Query execution time: ${Math.min(...times)}...${Math.max(...times)}ms; avg=${Math.round(avgTime * 10) / 10}ms`)
  } catch (error) {
    console.error(error)
  } finally {
    shutdown()
  }
})()