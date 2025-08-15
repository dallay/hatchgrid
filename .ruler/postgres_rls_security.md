---
title: RLS
description: Row-Level Security.
---

## RLS

This document explains Row-Level Security and recommended patterns for Hatchgrid.

## Purpose

Row-Level Security (RLS) is a PostgreSQL feature that lets the database enforce row-level access control policies. Use RLS to push multi-tenant or per-user authorization into the database so that queries automatically filter out rows the current role is not allowed to see.

This file documents recommended patterns, SQL examples, testing tips, and common pitfalls for Hatchgrid.

## When to use RLS

- Multi-tenant datasets where isolation must be enforced at the data layer (defense-in-depth).
- When you want database-enforced guarantees even if application code has bugs.
- For least-privilege service accounts that rely on session authenticated roles.

## Patterns

### 1) Tenant column pattern

- Add a `tenant_id UUID NOT NULL` column to tenant-scoped tables. Use policies referencing `current_setting('app.current_tenant', true)` or session-local settings.

### 2) Row owner / user_id pattern

- Add an `owner_id UUID` column for per-user ownership policies.

### 3) Trusted service accounts

- Use a separate role (e.g., `app_admin`) with `BYPASSRLS` only when strictly necessary (backups, migrations). Prefer using explicit migration scripts run with elevated rights.

## Example: tenant-based RLS

Create table and enable RLS:

```sql
CREATE TABLE project (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  owner_id uuid,
  name text NOT NULL,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE project ENABLE ROW LEVEL SECURITY;

-- Helper: set the tenant in the session (from the application after auth)
-- SELECT set_config('app.current_tenant', 'uuid-of-tenant', true);

CREATE POLICY tenant_isolation ON project
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
```

Notes:

- `current_setting(..., true)` returns NULL instead of throwing an error when not set. The application must set the session variable after authenticating the user.

## Example: owner-based policy

```sql
-- RLS is already enabled above; creating policies does not require re-enabling the table.
CREATE POLICY owner_only ON project
  USING (owner_id IS NOT NULL AND owner_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (owner_id IS NOT NULL AND owner_id = current_setting('app.current_user_id', true)::uuid);
```

> Note: RLS was enabled in the tenant-based example above. You do not need to run `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` again before creating additional policies for the same table.

## Integration guidance

- Set session variables from the application immediately after opening a DB connection or via a connection pool hook. Example in pseudocode:

  - Acquire connection
  - `SET LOCAL app.current_tenant = '<tenant-uuid>'`
  - `SET LOCAL app.current_user_id = '<user-uuid>'`

- Prefer configuring connection-pool reset hooks to ensure session state is cleared between checkouts (for example, pgBouncer's `server_reset_query` or your pool's `on-checkout`/`on-checkin` reset hooks). This prevents leftover session variables from leaking between client checkouts. As a defense-in-depth best practice, also use `SET LOCAL` inside each transaction so the variable only lives for the transaction's duration.

## Testing and validation

- Manual: connect as the application role and `SELECT set_config('app.current_tenant', '<id>', true);` then run queries to verify only allowed rows return.
- Automated: include integration tests that spawn a fresh DB, set the session variables, and assert expected rows are visible/non-visible.

## Pitfalls & security notes

- `BYPASSRLS`: only grant to roles that truly need it; it bypasses all policies.
- Be explicit in policies: prefer `WITH CHECK` to prevent unauthorized inserts/updates.
- Watch connection pooling: session settings can leak; use `SET LOCAL` per transaction or reset settings on checkout.
- Performance: policies are expressions evaluated at runtime — index columns referenced by policies (tenant_id, owner_id) help query plans.

- Performance: policies are expressions evaluated at runtime. To avoid planner regressions, create indexes on any columns referenced by RLS predicates (for example, `tenant_id` and `owner_id` on the `project` table). Add corresponding `CREATE INDEX IF NOT EXISTS` statements to your DB migration or schema management scripts so they are applied reliably in all environments.

  Example (add to your Liquibase/SQL migration):

  ```sql
  -- Indexes to support RLS predicates and improve planner choices
  CREATE INDEX IF NOT EXISTS idx_project_tenant_id ON project (tenant_id);
  CREATE INDEX IF NOT EXISTS idx_project_owner_id ON project (owner_id);
  ```

## Migration strategy

- Add `tenant_id`/`owner_id` column with NOT NULL default or backfill in a safe migration.
- Deploy policy in `RESTRICTIVE` mode by creating the policy but keeping RLS disabled, then enable RLS in a maintenance window after tests.

## References

- Postgres docs: [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
