# Database Schema Documentation

This document outlines the database schema for the application, derived from the Liquibase changelog files.

## Custom ENUM Types

### `subscriber_status`
Defines the possible statuses for a subscriber.
- `ENABLED`
- `DISABLED`
- `BLOCKLISTED`

### `role_type`
Defines the possible roles a user can have within a team.
- `OWNER`
- `EDITOR`

## Tables

### Table: `organizations`

| Column     | Type                      | Nullable | Primary Key | Foreign Key | Description                     |
|------------|---------------------------|----------|-------------|-------------|---------------------------------|
| id         | uuid                      | No       | Yes         |             | Unique identifier for the organization |
| name       | text                      | No       |             |             | Name of the organization        |
| user_id    | uuid                      | No       |             |             | Owner of the organization       |
| created_at | timestamp with time zone  | Yes (default `now()`) |             |             | Timestamp of creation           |
| updated_at | timestamp with time zone  | Yes (default `now()`) |             |             | Timestamp of last update        |

**Indexes:**
- `organizations_pkey` on `(id)` (Unique, implicit from PRIMARY KEY)
- `idx_organizations_user_id` on `(user_id)`

---

### Table: `teams`

| Column          | Type                      | Nullable | Primary Key | Foreign Key                  | Description                     |
|-----------------|---------------------------|----------|-------------|------------------------------|---------------------------------|
| team_id         | uuid                      | No       | Yes         |                              | Unique identifier for the team    |
| organization_id | uuid                      | No       |             | `organizations(id)` ON DELETE CASCADE | Owning organization             |
| name            | text                      | No       |             |                              | Name of the team                |
| created_at      | timestamp with time zone  | Yes (default `now()`) |             |                              | Timestamp of creation           |
| updated_at      | timestamp with time zone  | Yes (default `now()`) |             |                              | Timestamp of last update        |

**Indexes:**
- `teams_pkey` on `(team_id)` (Unique, implicit from PRIMARY KEY)
- `idx_teams_organization_id` on `(organization_id)`
- `idx_teams_name` on `(name)`

---

### Table: `team_members`

| Column     | Type                      | Nullable | Primary Key      | Foreign Key               | Description                     |
|------------|---------------------------|----------|------------------|---------------------------|---------------------------------|
| team_id    | uuid                      | No       | Yes (composite)  | `teams(team_id)` ON DELETE CASCADE | Team identifier                 |
| user_id    | uuid                      | No       | Yes (composite)  |                           | User identifier                 |
| role       | role_type                 | No       |                  |                           | Role of the user in the team    |
| created_at | timestamp with time zone  | Yes (default `now()`) |                  |                           | Timestamp of creation           |
| updated_at | timestamp with time zone  | Yes (default `now()`) |                  |                           | Timestamp of last update        |

**Indexes:**
- `team_members_pkey` on `(team_id, user_id)` (Unique, implicit from PRIMARY KEY)
- `idx_team_members_user_id` on `(user_id)`

---

### Table: `subscribers`

| Column          | Type                      | Nullable | Primary Key | Foreign Key                  | Description                        |
|-----------------|---------------------------|----------|-------------|------------------------------|------------------------------------|
| id              | uuid                      | No       | Yes         |                              | Unique identifier for the subscriber |
| email           | text                      | No       |             |                              | Email address (must be unique)     |
| firstname       | text                      | No       |             |                              | First name of the subscriber       |
| lastname        | text                      | Yes      |             |                              | Last name of the subscriber        |
| status          | subscriber_status         | No (default `ENABLED`)|             |                              | Status of the subscriber           |
| attributes      | json                      | Yes      |             |                              | Additional attributes for the subscriber |
| organization_id | uuid                      | No       |             | `organizations(id)` ON DELETE CASCADE | Owning organization                |
| created_at      | timestamp with time zone  | Yes (default `now()`) |             |                              | Timestamp of creation              |
| updated_at      | timestamp with time zone  | Yes (default `now()`) |             |                              | Timestamp of last update           |

**Indexes:**
- `subscribers_pkey` on `(id)` (Unique, implicit from PRIMARY KEY)
- `idx_subs_email` on `(lower(email))` (Unique)
- `idx_subs_status` on `(status)`
- `idx_subs_created_at` on `(created_at)`
- `idx_subs_email_organization` on `(lower(email), organization_id)` (Unique)
- `idx_subscribers_organization_id` on `(organization_id)`

---

### Table: `forms`

| Column             | Type                      | Nullable | Primary Key | Foreign Key                  | Description                        |
|--------------------|---------------------------|----------|-------------|------------------------------|------------------------------------|
| id                 | uuid                      | No       | Yes         |                              | Unique identifier for the form     |
| name               | text                      | No       |             |                              | Name of the form                   |
| header             | text                      | Yes      |             |                              | Header text for the form           |
| description        | text                      | Yes      |             |                              | Description text for the form      |
| input_placeholder  | text                      | Yes      |             |                              | Placeholder for input fields       |
| button_text        | text                      | Yes      |             |                              | Text for the form button           |
| button_color       | text                      | Yes      |             |                              | Color for the form button          |
| background_color   | text                      | Yes      |             |                              | Background color for the form      |
| text_color         | text                      | Yes      |             |                              | Text color for the form            |
| button_text_color  | text                      | Yes      |             |                              | Text color for the form button     |
| organization_id    | uuid                      | No       |             | `organizations(id)` ON DELETE CASCADE | Owning organization                |
| created_at         | timestamp with time zone  | Yes (default `now()`) |             |                              | Timestamp of creation              |
| updated_at         | timestamp with time zone  | Yes (default `now()`) |             |                              | Timestamp of last update           |

**Indexes:**
- `forms_pkey` on `(id)` (Unique, implicit from PRIMARY KEY)
- `idx_forms_organization` on `(organization_id)`
- `idx_forms_created_at` on `(created_at)`
- `idx_forms_name` on `(name)`

## Row Level Security (RLS)

- RLS is enabled for the `subscribers` and `forms` tables.
- **`subscriber_policy`**: Allows `SELECT` on `subscribers` if `organization_id` matches `current_setting('hatchgrid.current_organization')::uuid`.
- **`form_policy`**: Allows `SELECT` on `forms` if `organization_id` matches `current_setting('hatchgrid.current_organization')::uuid`.

## Triggers and Functions

### Function: `update_updated_at_column()`
This function is designed to be used by triggers. It updates the `updated_at` column of a row to the current timestamp (`NOW()`) whenever an update operation occurs on that row.

### Triggers
The following triggers execute the `update_updated_at_column()` function before any update on their respective tables:
- `update_organizations_updated_at` on `organizations`
- `update_teams_updated_at` on `teams`
- `update_team_members_updated_at` on `team_members`
- `update_subscribers_updated_at` on `subscribers`
- `update_forms_updated_at` on `forms`

This ensures that the `updated_at` field is automatically maintained for these tables.
