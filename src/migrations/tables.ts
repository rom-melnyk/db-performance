import { NUM_TABLES_PER_RESTAURANT } from "../constants.ts"
import { random } from "../data-utils/random-utils.ts"
import { Tracer } from "../data-utils/time-utils.ts"
import { query } from "../pg-utils/index.ts"


export async function up() {
  const tracer = new Tracer("Tables")

  await query(`
    CREATE TABLE IF NOT EXISTS Tables (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      rid INT NOT NULL,
      size SMALLINT,
      CONSTRAINT fk_table_restaurant
        FOREIGN KEY (rid)
        REFERENCES Restaurants (id)
        ON DELETE CASCADE
    );
  `)
  await query(`ALTER SEQUENCE IF EXISTS tables_id_seq RESTART WITH 1;`)

  tracer.step("create table")


  const { rows } = await query<{ min: number, max: number }>(`SELECT min(id) AS min, max(id) AS max FROM Restaurants`)
  const resto = rows[0]

  const clauses: string[] = []
  for (let rid = resto.min; rid <= resto.max; rid++) {
    for (let tid = 0; tid < NUM_TABLES_PER_RESTAURANT; tid++) {
      clauses.push(`(${rid}, ${random(2, 6)})`)
    }
  }

  const insertQuery = `INSERT INTO Tables (rid, size) VALUES ${clauses.join(", ")};`
  await query(insertQuery)
  tracer.step("insert into")
  tracer.end()
}


export async function down() {
  await query("DROP TABLE Tables CASCADE;")
}
