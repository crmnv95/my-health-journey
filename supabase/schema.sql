-- ============================================================
-- My Health Journey – Supabase Schema
-- Run this in your Supabase project's SQL Editor
-- ============================================================

-- Cycle start date (single row, id is always 1)
create table if not exists cycle_config (
  id integer primary key default 1,
  cycle_start_date text not null,
  constraint single_row check (id = 1)
);

-- One row per cycle day (1-21); meals stored as JSONB array
create table if not exists meal_plans (
  day integer primary key check (day between 1 and 21),
  meals jsonb not null default '[]'::jsonb
);

-- One row per cycle day (1-21); groups stored as JSONB array
create table if not exists workouts (
  day integer primary key check (day between 1 and 21),
  groups jsonb not null default '[]'::jsonb
);

-- One row per body measurement entry
create table if not exists body_measurements (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  weight numeric,
  waist numeric,
  hip numeric,
  neck numeric,
  chest numeric,
  created_at timestamptz default now()
);

-- Food list categories (single row, id is always 1)
create table if not exists food_list (
  id integer primary key default 1,
  proteins jsonb not null default '[]'::jsonb,
  carbohydrates jsonb not null default '[]'::jsonb,
  vegetables jsonb not null default '[]'::jsonb,
  constraint single_row check (id = 1)
);

-- ============================================================
-- Disable Row Level Security (no auth needed for personal use)
-- ============================================================
alter table cycle_config disable row level security;
alter table meal_plans disable row level security;
alter table workouts disable row level security;
alter table body_measurements disable row level security;
alter table food_list disable row level security;
