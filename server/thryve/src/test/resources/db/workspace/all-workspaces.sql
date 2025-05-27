-- Insert the users first to satisfy the foreign key constraint
INSERT INTO users (id, username, email, password_hash, first_name, last_name, activated, created_by, created_at)
VALUES ('efc4b2b8-08be-4020-93d5-f795762bf5c9', 'testuser1', 'test1@example.com', 'password_hash', 'Test', 'User1', true, 'system', '2024-06-02 11:00:08.251');

INSERT INTO users (id, username, email, password_hash, first_name, last_name, activated, created_by, created_at)
VALUES ('b2864d62-003e-4464-a6d7-04d3567fb4ee', 'testuser2', 'test2@example.com', 'password_hash', 'Test', 'User2', true, 'system', '2024-06-03 11:00:08.251');

-- Now insert the workspaces
INSERT INTO workspaces (id, name, description, owner_id, created_by, created_at, updated_by, updated_at)
VALUES ('95ded4bb-2946-4dbe-87df-afb701788eb4', 'Test: My First Workspace', 'Super workspace',
        'efc4b2b8-08be-4020-93d5-f795762bf5c9', 'system', '2024-06-02 11:00:08.251',
        'system', '2024-06-02 11:00:08.281');

INSERT INTO workspaces (id, name, description, owner_id, created_by, created_at, updated_by, updated_at)
VALUES ('894812b3-deb9-469f-b988-d8dfa5a1cf52', 'Test: My Second Workspace', 'Super workspace',
        'efc4b2b8-08be-4020-93d5-f795762bf5c9', 'system', '2024-06-02 12:00:08.251',
        'system', '2024-06-02 12:00:08.281');

INSERT INTO workspaces (id, name, description, owner_id, created_by, created_at, updated_by, updated_at)
VALUES ('949a8d91-1f53-4082-a4a9-7760fed234b0', 'Test: My Third Workspace', 'Super workspace',
        'b2864d62-003e-4464-a6d7-04d3567fb4ee', 'system', '2024-06-03 11:00:08.251',
        'system', '2024-06-03 11:00:08.281');
