---
title: RLS
description: Row-Level Security.
---

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
-- Optional: enforce RLS for table owner/superuser (except BYPASSRLS)
ALTER TABLE project FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON project
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);
```

Notes:

- `current_setting(..., true)` returns NULL instead of throwing an error when not set. The application must set the session variable after authenticating the user.
- Scope natural keys by tenant to prevent cross-tenant uniqueness collisions (for example, `UNIQUE (tenant_id, name)` instead of `UNIQUE (name)`).

## Example: owner-based policy

```sql
-- RLS is already enabled above; creating policies does not require re-enabling the table.
-- Prefer combining tenant and owner predicates so both tenant_id AND owner_id must match.
CREATE POLICY tenant_owner_isolation ON project
  USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND owner_id IS NOT NULL
    AND owner_id = current_setting('app.current_user_id', true)::uuid
  )
  WITH CHECK (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND owner_id IS NOT NULL
    AND owner_id = current_setting('app.current_user_id', true)::uuid
  );
```

Alternate (Postgres 15+): keep separate policies but mark them `AS RESTRICTIVE` so PostgreSQL combines them with AND semantics instead of OR. If you run older Postgres versions, multiple policies are combined permissively (OR), which can allow cross-tenant access if predicates are split.

```sql
-- Postgres 15+ example using AS RESTRICTIVE
CREATE POLICY tenant_isolation ON project AS RESTRICTIVE
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY owner_only ON project AS RESTRICTIVE
  USING (owner_id IS NOT NULL AND owner_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (owner_id IS NOT NULL AND owner_id = current_setting('app.current_user_id', true)::uuid);
```

> Note: RLS was enabled in the tenant-based example above. You do not need to run `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` again before creating additional policies for the same table.

## Integration guidance

- Set session variables from the application immediately after opening a DB connection or via a connection pool hook. SET LOCAL only takes effect inside a transaction. Example in pseudocode:
  - Acquire connection
  - `BEGIN`
  - `SET LOCAL app.current_tenant = '<tenant-uuid>'`
  - `SET LOCAL app.current_user_id = '<user-uuid>'`
  - -- ... execute application queries ...
  - `COMMIT`

  - WARNING: SECURITY DEFINER functions and RLS

    - `SECURITY DEFINER` functions execute with the function owner's privileges. If the function owner has `BYPASSRLS` or is the table owner, the function can bypass RLS policies. This can lead to accidental privilege escalation or data leakage.
    - Mitigations:
      - Prefer `SECURITY INVOKER` for functions that access tenant-scoped data when possible.
      - Create dedicated function owners that do not have `BYPASSRLS` and do not own the target tables.
      - On Postgres 15+, consider enabling `FORCE ROW LEVEL SECURITY` on sensitive tables so even table owners are subject to RLS.
      - Document any exceptions clearly (who the function owner is, why elevated rights are needed, and additional compensating controls such as audit triggers).

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
- For Postgres 15+, consider `AS RESTRICTIVE` policies where appropriate. Rollout strategy: create and test policies with RLS disabled in a staging environment; schedule enabling RLS in production during a maintenance window after validation.

## References

- Postgres docs: [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
