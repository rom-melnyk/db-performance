# SQL SELECT performance test


## Context

Consider a typical reservation app: Restaurants, Tables, Reservation and Availability.

- 1k restaurants.
- 20 tables per restaurant.
- 8 working hours.
- 30 min reservation intervals (≡ reservation is possible from/to :00 and :30).
- 365 days.

This ends up in ~120M resords of the `Availability` table if it materializes all possible `{restaurnats/tables × intervals}`.


## Data Schema

```
Restaurants {
  rid               # PK
  ...metadata
}

Tables {
  tid               # PK
  rid               # FK ref Restaurants.rid
}


Reservations {
  rsrvid            # PK
  uid               # FK ref Users.uid
  ...
}

Availability {
  tid               # FK ref Tables.tid
  interval
  rsrvid            # nullable; FK Reservations.rsrvid
  ---
  CONSTRAINT unique (tid, interval)          # prevents double reservation
}
```


## Challenge

How will typical availability requests bevave at this scale?

```sql
SELECT FROM Availability WHERE tid = ... AND interval >= ... AND interval <= ...

SELECT FROM Availability
RIGHT JOIN Restaurants
RIGHT JOIN Tables
WHERE WHERE Restaurants.rid = ... AND interval >= ... AND interval <= ...
```


# Setup

**Prerequisites:** Node 18+, Docker.

```shell
$ docker build -t postgres . --no-cache
$ docker run --name postgres -p 5432:5432 -d postgres
$ npm run db:migrate
  ## might be used with "-- down" option to clear the DB

$ node --loader ts-node/esm --no-warnings ./src/test-db-performance.ts
```


# Results

```
ℹ️ Running PostgreSQL 18.0 (Debian 18.0-1.pgdg13+3) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
🕐 "SELECT" started
🕐 "SELECT: 200 queries" lasted 209ms
ℹ️ Query execution time: 0...6ms; avg=1ms
ℹ️ Shutting down DB pool...
```
