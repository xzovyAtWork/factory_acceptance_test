-- 002_units_and_designations.sql

CREATE TABLE IF NOT EXISTS units (
  id              SERIAL PRIMARY KEY,
  unit_number     VARCHAR(50) NOT NULL,
  job_number      VARCHAR(50) NOT NULL,
  UNIQUE (unit_number, job_number)
);

CREATE TABLE IF NOT EXISTS unit_designations (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(5) NOT NULL UNIQUE,
  label           VARCHAR(50) NOT NULL
);