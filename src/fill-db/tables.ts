import { random } from "../data-utils/random-utils.ts"
import { Tracer } from "../data-utils/time-utils.ts"
import { query } from "../pg-utils/index.ts"


export async function createTablesTable() {
  const tracer = new Tracer("Tables")

  await query(`
    CREATE TABLE IF NOT EXISTS Tables (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      rid INT NOT NULL,
      size SMALLINT,
      CONSTRAINT fk_restaurant
        FOREIGN KEY (rid)
        REFERENCES restaurants (id)
        ON DELETE CASCADE
    );
  `)
  tracer.trace("create table")

  // await query(`ALTER SEQUENCE IF EXISTS tables_id_seq RESTART WITH 1;`)

  const { rows } = await query<{ min: number, max: number }>(`SELECT min(id) AS min, max(id) AS max FROM Restaurants`)
  const { min, max } = rows[0]

  const clauses: string[] = []
  for (let rid = min; rid <= max; rid++) {
    for (let tid = 0; tid < 20; tid++) {
      clauses.push(`(${rid}, ${random(2, 6)})`)
    }
  }

  const insertQuery = `
    INSERT INTO Tables (rid, size)
    VALUES
    ${clauses.join(", ")};
  `
  await query(insertQuery)
  tracer.trace("insert into")
}


export async function dropTablesTable() {
  await query("DROP TABLE Tables")
}
