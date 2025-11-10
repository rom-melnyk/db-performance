import { connect, query, shutdown, testConnection } from "../pg-utils/index.ts"
import { createRestaurantsTable } from "./restaurants.ts"
import { createTablesTable } from "./tables.ts"

async function existsTable(tableName: string) {
  const { rows } = await query<{exists: boolean}>(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = '${tableName}'
    ) AS exists;`)

  return rows[0].exists
}

;(async () => {
  await connect()
  await testConnection()

  try {
    const existRestaurants = await existsTable("Restaurants")
    console.info(`ℹ️ The "Restaurants" table ${existRestaurants ? "exists" : "does not exist"}`)
    if (!existRestaurants) await createRestaurantsTable()

      const existTables = await existsTable("Tables")
    console.info(`ℹ️ The "Tables" table ${existTables ? "exists" : "does not exist"}`)
    if (!existTables) await createTablesTable()


  } catch (error) {
    console.error(error)
  } finally {
    shutdown()
  }
})()