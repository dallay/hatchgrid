-- Clean All Data After run tests
DELETE FROM tags WHERE name LIKE 'Test: %';
DELETE FROM subscribers
WHERE email LIKE '%@test.com';
DELETE FROM workspaces WHERE name LIKE 'Test: %';
