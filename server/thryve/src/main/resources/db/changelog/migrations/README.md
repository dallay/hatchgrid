# Hatchgrid – Database Schema

This document defines the conventions, practices, and structure of the Hatchgrid project's database.

---

## 🧱 General Architecture

- **PostgreSQL** as the relational database engine.
- **Liquibase** for schema versioning (YAML format).
- **Keycloak** as the external authentication provider.
- Internal `users` table partially synced with Keycloak.
- Multi-tenancy managed through `workspaces`.

---

## 📁 Migration Structure

Migrations are organized in the `/migrations` directory and automatically included via `master.yaml`:

```yaml
databaseChangeLog:
  - includeAll:
      path: migrations
      relativeToChangelogFile: true
```

**File naming conventions:**

- Numeric prefixes for ordering (`001`, `002`, ...).
- Clear domain-based names: `001-initial-schema.yaml`, `002-workspaces.yaml`, `003-subscribers.yaml`, etc.
- Optional subversions: `002a-workspaces-rls.yaml`.

---

## 📐 Base Schema

### `users`
Local table representing users authenticated via Keycloak.

| Field       | Type           | Constraints                     |
|-------------|----------------|----------------------------------|
| id          | uuid           | PK, NOT NULL                    |
| email       | varchar(255)   | UNIQUE, NOT NULL                |
| full_name   | varchar(255)   |                                |
| created_at  | timestamptz    | DEFAULT now(), NOT NULL         |
| updated_at  | timestamptz    |                                |

---

### `workspaces`
Unit of multi-tenant isolation.

| Field       | Type            | Constraints                        |
|-------------|-----------------|------------------------------------|
| id          | uuid            | PK, NOT NULL                       |
| name        | varchar(100)    | NOT NULL                           |
| description | varchar(500)    |                                    |
| owner_id    | uuid            | FK → `users(id)`, NOT NULL         |
| created_by  | varchar(50)     | DEFAULT 'system', NOT NULL         |
| created_at  | timestamp       | DEFAULT now(), NOT NULL            |
| updated_by  | varchar(50)     |                                    |
| updated_at  | timestamp       |                                    |

---

### `workspace_members`
User–workspace relationship with role.

| Field        | Type         | Constraints                             |
|--------------|--------------|-----------------------------------------|
| workspace_id | uuid         | PK, FK → `workspaces(id)`               |
| user_id      | uuid         | PK, FK → `users(id)`                    |
| role         | role_type    | DEFAULT 'EDITOR', NOT NULL              |
| created_at   | timestamptz  | DEFAULT now()                           |
| updated_at   | timestamptz  | DEFAULT now()                           |

---

## 🔁 Enums

```sql
CREATE TYPE role_type AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');
```

---

## ⚙️ Best Practices

- **UUIDs** as primary keys.
- **Triggers** to update `updated_at`.
- **Liquibase in YAML** for clear and auditable schema changes.
- **Decoupling from Keycloak** via internal `users` table.
- **Strict naming conventions** for files and constraints.
- **Multi-tenancy via `workspace_id`**, reinforced with RLS.
- **Row-level security policies (RLS)** controlled by `current_setting('hatchgrid.current_workspace')`.

---

## ✅ Upcoming Migrations

1. `003-subscribers.yaml`: subscribers per workspace.
2. `004-forms.yaml`: embeddable forms.
3. `005-rls.yaml`: entity-level policies.

---

## 🧪 Useful Commands

### Apply all migrations

```bash
liquibase --changelog-file=master.yaml update
```

### Rollback (example)

```bash
liquibase --changelog-file=master.yaml rollbackCount 1
```

---

## 🧭 Versioning

- Semantic versioning: `MAJOR.MINOR.PATCH`.
- Each file defines a `changeSet` with an incremental `id`.
- Versioning is tracked by Liquibase's internal table.

---
