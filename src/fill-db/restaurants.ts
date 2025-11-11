import { generateRestaurantNames } from "../data-utils/restaurant-names.ts"
import { Tracer } from "../data-utils/time-utils.ts"
import { query } from "../pg-utils/index.ts"


export async function up() {
  const tracer = new Tracer("Restaurant")

  await query(`
    CREATE TABLE IF NOT EXISTS Restaurants (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name VARCHAR(30) NOT NULL
    );
  `)
  await query(`ALTER SEQUENCE IF EXISTS restaurants_id_seq RESTART WITH 1;`)
  tracer.trace("create table")


  const names = generateRestaurantNames()
  const insertQuery = `
    INSERT INTO restaurants (name)
    VALUES
    ${names.map(n => `('${n}')`).join(", ")};
  `
  await query(insertQuery)
  tracer.trace("insert into")
}


export async function down() {
  await query("DROP TABLE Restaurants CASCADE;")
}
