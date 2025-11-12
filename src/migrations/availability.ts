import { MAX_DATE, MIN_DATE, NUM_INTERVALS_IN_HOUR, NUM_WORKING_HOURS } from "../constants.ts"
import { random, withChances } from "../data-utils/random-utils.ts"
import { Tracer } from "../data-utils/time-utils.ts"
import { query } from "../pg-utils/index.ts"


export async function up() {
  const tracer = new Tracer("Availability")

  await query(`
    CREATE TABLE IF NOT EXISTS Availability (
      tid INT NOT NULL,
      interval VARCHAR(16) NOT NULL,    -- '2025/01/01 09:00'
      bid INT NULL,
      CONSTRAINT fk_availability_table
        FOREIGN KEY (tid)
        REFERENCES Tables (id)
        ON DELETE CASCADE,
      CONSTRAINT unique_avaiability_table_interval UNIQUE (tid, interval)
    );
  `)
  await query(`ALTER SEQUENCE IF EXISTS availability_id_seq RESTART WITH 1;`)
  await query(`CREATE INDEX IF NOT EXISTS idx_avaiability_tid ON Availability (tid);`)
  await query(`CREATE INDEX IF NOT EXISTS idx_avaiability_interval ON Availability (interval);`)

  tracer.step("create table")


  const { rows } = await query<{ min: number, max: number }>(`SELECT min(id) AS min, max(id) AS max FROM Tables`)
  const { min, max } = rows[0]

  let clauses: string[] = []
  const endDate = new Date(MAX_DATE)
  const tblChunkSize = 100

  for (let tid = min; tid <= max; tid++) {
    for (let date = new Date(MIN_DATE); date < endDate; date.setTime(date.getTime() + 24 * 3600 * 1000)) {
      date.setHours(23 - NUM_WORKING_HOURS, 0, 0, 0) // Reset hours on each new day

      // Generate the daily intervals
      for (let int = 0; int < NUM_WORKING_HOURS * NUM_INTERVALS_IN_HOUR; int ++) {
        const interval = date.toJSON().substring(0, 16).replace("T", " ")
        const clause = `(${tid}, '${interval}', ${withChances(25) ? "NULL" : random(1, 1e4)})`
        clauses.push(clause)
        date.setTime(date.getTime() + (3600 / NUM_INTERVALS_IN_HOUR) * 1000)
      }
    }

    if (tid % tblChunkSize === 0) {
      tracer.step(`created yearly caluses for tables ${tid - tblChunkSize}...${tid} / ${max}`)
      await query(`INSERT INTO Availability (tid, interval, bid) VALUES ${clauses.join(", ")};`)
      tracer.step(`inserted ${clauses.length} rows`)
      clauses = []
    }
  }

  tracer.end()
}


export async function down() {
  await query("DROP TABLE Availability;")
}
