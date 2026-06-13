-- Runs once on first container boot (Postgres executes every *.sql in
-- /docker-entrypoint-initdb.d when the data volume is empty).
--
-- The dev database is created automatically from POSTGRES_DB. Here we add a
-- second, dedicated database for the test suite so integration tests can
-- truncate and rewrite data freely without ever touching dev data.
CREATE DATABASE urlshortener_test;
