import { MAX_DATE, MIN_DATE } from "./constants.ts";
import { round } from "./data-utils/format-utils.ts";
import { random } from "./data-utils/random-utils.ts";
import { Tracer } from "./data-utils/time-utils.ts";
import { connect, query, shutdown, testConnection } from "./pg-utils/index.ts"

;(async () => {
  await connect()
  await testConnection()

  try {
    const minTime = new Date(MIN_DATE).getTime()
    const maxTime = new Date(MAX_DATE).getTime()

    function generateFromToDate(): [string, string] {
      const fromTime = random(minTime, maxTime)
      const fromDate = new Date(fromTime)
      const toDate = new Date(fromDate)
      toDate.setTime(fromTime + 24 * 3600 * 1000)

      return [
        fromDate.toJSON().substring(0, 10),
        toDate.toJSON().substring(0, 10),
      ]
    }

    async function getRunningTime(fn: () => Promise<any>): Promise<number> {
      const timeNow = Date.now()
      await fn()
      return Date.now() - timeNow
    }

    const testCases = [
      {
        name: "Table occupation per day",
        query: `
        SELECT tid, interval, bid
        FROM Availability
        WHERE tid = {{trid}} AND interval >= '{{from}}' AND interval < '{{to}}'
        `,
      },
      {
        name: "Does restaurant have free tables for a day?",
        query: `
          SELECT EXISTS (
            SELECT 1
            FROM Availability AS a
            JOIN Tables AS tbl ON a.tid = tbl.id
            WHERE tbl.rid = {{trid}} AND a.interval >= '{{from}}' AND a.interval < '{{to}}' AND a.bid IS NULL
          )
        `,
      },
    ]

    const NUM_RUNS = 200

    for (const testCase of testCases) {
      const times: number[] = []
      const tracer = new Tracer(testCase.name)

      for (let i = 0; i < NUM_RUNS; i++) {
        const [fromDate, toDate] = generateFromToDate()

        const q = testCase.query
          .replace("{{trid}}", `${random(1, 1000)}`)
          .replace("{{from}}", `${fromDate}`)
          .replace("{{from}}", `${toDate}`)


        times.push(await getRunningTime(() => query(q)))
      }

      tracer.step(`${NUM_RUNS} queries`)

      const avgTime = times.reduce((sum, t) => sum + t) / NUM_RUNS
      console.info(`🕐 ${testCase.name} execution time: ${Math.min(...times)}...${Math.max(...times)}ms; avg=${round(avgTime)}ms`)

      tracer.end()
    }
  } catch (error) {
    console.error(error)
  } finally {
    shutdown()
  }
})()
