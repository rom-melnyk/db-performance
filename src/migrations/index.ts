import { connect, query, shutdown, testConnection } from "../pg-utils/index.ts"
import * as resto from "./restaurants.ts"
import * as tables from "./tables.ts"
import * as avail from "./availability.ts"

;(async () => {
  await connect()
  await testConnection()

  const upDownFn = process.argv[2] === "down" ? "down" : "up"
  console.info(`ℹ️ Going to perform ${upDownFn}() on the DB`)

  try {
    const sequence = [resto, tables, avail]
    for (let i = 0; i < sequence.length; i++) {
      await sequence[i][upDownFn]()
    }
  } catch (error) {
    console.error(error)
  } finally {
    shutdown()
  }
})()