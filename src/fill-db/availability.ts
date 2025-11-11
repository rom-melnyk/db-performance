import { NUM_INTERVALS_IN_HOUR, NUM_WORKING_HOURS } from "../constants.ts"
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

  tracer.trace("create table")


  const { rows } = await query<{ min: number, max: number }>(`SELECT min(id) AS min, max(id) AS max FROM Tables`)
  const { min, max } = rows[0]

  const clauses: string[] = []
  const endDate = new Date("2025/02/01")
  for (let tid = min; tid <= max; tid++) {
    for (let date = new Date("2025/01/01"); date < endDate; date.setTime(date.getTime() + 24 * 3600 * 1000)) {
      date.setHours(23 - NUM_WORKING_HOURS, 0, 0, 0)
      for (let int = 0; int < NUM_WORKING_HOURS * NUM_INTERVALS_IN_HOUR; int ++) {
        const interval = date.toJSON().substring(0, 16).replace("T", " ")
        const clause = `(${tid}, '${interval}', ${withChances(25) ? "NULL" : random(1, 1e4)})`
        clauses.push(clause)
        date.setTime(date.getTime() + (3600 / NUM_INTERVALS_IN_HOUR) * 1000)
      }
    }
    if (tid % 1000 === 0) tracer.trace(`creating yearly caluses for table ${tid}/${max}`)
  }

  const insertQueries: string[] = []
  let insertQuery = ""
  clauses.forEach((clause, idx) => {
    if (idx % 1e4 === 0) {
      if (insertQuery) insertQueries.push(insertQuery + ";")
        insertQuery = `INSERT INTO Availability (tid, interval, bid) VALUES ${clause}`
    }
    else insertQuery += `, ${clause}`
  })
  if (insertQuery) insertQueries.push(insertQuery + ";")

  tracer.trace(`prepare ${insertQueries.length} queries`)

  for (let i = 0; i < insertQueries.length; i++) {
    await query(insertQueries[i])
    if (i % 10 === 0) tracer.trace(`inserted ${i} 10k chunks`)
  }
  tracer.trace("insert into")
}


export async function down() {
  await query("DROP TABLE Availability;")
}
