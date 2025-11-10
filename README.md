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

$ node --loader ts-node/esm --no-warnings ./src/<filename>
```
