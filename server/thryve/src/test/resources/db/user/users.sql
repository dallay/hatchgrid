-- file: users.sql
-- USERS
INSERT INTO users (id, email, full_name, created_at)
VALUES
  ('efc4b2b8-08be-4020-93d5-f795762bf5c9', 'test1@example.com', 'Test User1', now()),
  ('b2864d62-003e-4464-a6d7-04d3567fb4ee', 'test2@example.com', 'Test User2', now());
