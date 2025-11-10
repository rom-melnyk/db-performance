import {
  type PoolConfig,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
  Pool
} from "pg"


let pool: Pool


export async function connect() {
  const poolConfig: PoolConfig = {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "pg",
    database: "postgres",
    max: 10,
  }

  pool = new Pool(poolConfig)
  await pool.connect()

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}


export async function testConnection() {
  try {
    const res = await query<{ version: string }>("SELECT version() AS version")
    console.log(`ℹ️ Running ${res.rows[0].version}`)
  } catch (error) {
    console.error("❌ DB connection error", error)
  }
}


export async function shutdown() {
  if (!pool) {
    console.info("⚠️ No connection pool was created; exiting.")
    process.exit(0)
    return
  }

  console.info("ℹ️ Shutting down DB pool...")
  try {
    await pool.end()
    console.info("ℹ️ Pool has ended. Exiting.")
    process.exit(0)
  } catch (err) {
    console.error("❌ Error while shutting down pool", err)
    process.exit(1)
  }
}


export async function query<T extends QueryResultRow = any>(queryText: string, params: any[] = []): Promise<QueryResult<T>> {
  try {
    return await pool.query(queryText, params)
  } catch (err) {
    console.error(`❌ Failed running query`, { query: queryText, params, error: err })
    throw err
  }
}


export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await fn(client)
    await client.query("COMMIT")
    return result
  } catch (err) {
    try {
      await client.query("ROLLBACK")
    } catch (rollbackErr) {
      // If rollback fails, log it — at least we tried.
      console.error("❌ Failed to rollback transaction", rollbackErr)
    }
    throw err
  } finally {
    client.release()
  }
}