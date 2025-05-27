# Database Schema Documentation

This document provides an overview of the database schema used in the Hatchgrid application.

## Tables

### Users

The `users` table stores information about application users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, NOT NULL | Unique identifier for the user |
| username | varchar(50) | UNIQUE, NOT NULL | User's username |
| email | varchar(100) | UNIQUE, NOT NULL | User's email address |
| password_hash | varchar(255) | NOT NULL | Hashed password |
| first_name | varchar(50) | | User's first name |
| last_name | varchar(50) | | User's last name |
| activated | boolean | NOT NULL, DEFAULT false | Whether the user account is activated |
| activation_key | varchar(20) | | Key for account activation |
| reset_key | varchar(20) | | Key for password reset |
| reset_date | timestamp | | Date of the last password reset |
| created_by | varchar(50) | NOT NULL | User who created this record |
| created_at | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date when the record was created |
| updated_by | varchar(50) | | User who last modified this record |
| updated_at | timestamp | | Date when the record was last modified |

**Indexes:**

- `idx_users_username` on `username`
- `idx_users_email` on `email`

### Roles

The `roles` table stores information about user roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, NOT NULL | Unique identifier for the role |
| name | varchar(50) | UNIQUE, NOT NULL | Role name |
| description | varchar(255) | | Role description |
| created_by | varchar(50) | NOT NULL | User who created this record |
| created_at | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date when the record was created |
| updated_by | varchar(50) | | User who last modified this record |
| updated_at | timestamp | | Date when the record was last modified |

**Indexes:**

- `idx_roles_name` on `name`

**Default Roles:**

- `ROLE_ADMIN`: Administrator role
- `ROLE_USER`: Regular user role

### User Roles

The `user_roles` table is a junction table that establishes a many-to-many relationship between users and roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | uuid | PK, FK, NOT NULL | Reference to the users table |
| role_id | uuid | PK, FK, NOT NULL | Reference to the roles table |

**Foreign Keys:**

- `fk_user_roles_user_id`: References `users(id)` with CASCADE on delete
- `fk_user_roles_role_id`: References `roles(id)` with CASCADE on delete

### Refresh Tokens

The `refresh_tokens` table stores refresh tokens for authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, NOT NULL | Unique identifier for the refresh token |
| user_id | uuid | FK, NOT NULL | Reference to the users table |
| token | varchar(255) | UNIQUE, NOT NULL | The refresh token |
| expires_at | timestamp | NOT NULL | Expiration date of the token |
| revoked | boolean | NOT NULL, DEFAULT false | Whether the token has been revoked |
| created_by | varchar(50) | NOT NULL | User who created this record |
| created_at | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date when the record was created |
| updated_by | varchar(50) | | User who last modified this record |
| updated_at | timestamp | | Date when the record was last modified |

**Indexes:**

- `idx_refresh_tokens_user_id` on `user_id`
- `idx_refresh_tokens_token` on `token`
- `idx_refresh_tokens_expires_at` on `expires_at`

**Foreign Keys:**

- `fk_refresh_tokens_user_id`: References `users(id)` with CASCADE on delete

### User Preferences

The `user_preferences` table stores user preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, NOT NULL | Unique identifier for the preference |
| user_id | uuid | FK, UNIQUE, NOT NULL | Reference to the users table |
| theme | varchar(20) | NOT NULL, DEFAULT 'light' | User's theme preference |
| language | varchar(10) | NOT NULL, DEFAULT 'en' | User's language preference |
| notifications_enabled | boolean | NOT NULL, DEFAULT true | Whether notifications are enabled |
| created_by | varchar(50) | NOT NULL | User who created this record |
| created_at | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date when the record was created |
| updated_by | varchar(50) | | User who last modified this record |
| updated_at | timestamp | | Date when the record was last modified |

**Foreign Keys:**

- `fk_user_preferences_user_id`: References `users(id)` with CASCADE on delete

### Database Version

The `database_version` table tracks database schema versions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | int | PK, NOT NULL, AUTO_INCREMENT | Unique identifier for the version record |
| version | varchar(50) | UNIQUE, NOT NULL | Version number |
| description | varchar(255) | | Version description |
| installed_by | varchar(50) | NOT NULL | User who installed this version |
| installed_on | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date when the version was installed |
| success | boolean | NOT NULL, DEFAULT true | Whether the installation was successful |

## Entity Relationship Diagram

```text
+----------------+       +----------------+       +----------------+
|     users      |       |   user_roles   |       |     roles      |
+----------------+       +----------------+       +----------------+
| id (PK)        |<----->| user_id (PK,FK)|<----->| id (PK)        |
| username       |       | role_id (PK,FK)|       | name           |
| email          |       +----------------+       | description    |
| password_hash  |                                | created_by     |
| first_name     |                                | created_at     |
| last_name      |                                | updated_at     |
| activated      |                                | updated_at     |
| activation_key |                                +----------------+
| reset_key      |
| reset_date     |
| created_by     |
| created_at     |
| updated_by     |
| updated_at     |
+----------------+
        ^
        |
        |
+----------------+       +----------------+
| refresh_tokens |       |user_preferences|
+----------------+       +----------------+
| id (PK)        |       | id (PK)        |
| user_id (FK)   |       | user_id (FK)   |
| token          |       | theme          |
| expires_at     |       | language       |
| revoked        |       | notifications_enabled|
| created_by     |       | created_by     |
| created_at     |       | created_at     |
| updated_by     |       | updated_by     |
| updated_at     |       | updated_at     |
+----------------+       +----------------+
```

## Indexing Strategy

The database schema includes indexes on frequently queried columns to improve query performance:

1. **Primary Keys**: All tables have primary keys for fast record lookup.
2. **Foreign Keys**: All foreign key columns are indexed to speed up join operations.
3. **Unique Constraints**: Columns with unique constraints are automatically indexed.
4. **Search Columns**: Columns frequently used in WHERE clauses (username, email, token) are indexed.
5. **Sort Columns**: Columns frequently used in ORDER BY clauses (expires_at) are indexed.

## Rollback Procedures

The database schema includes rollback procedures to revert changes if needed:

1. Each migration file includes explicit rollback instructions.
2. The `rollback_to_version` function logs rollback attempts in the `database_version` table.
3. To rollback to a specific version, use the Liquibase rollback command with the appropriate tag.

## Versioning

The database schema uses semantic versioning (MAJOR.MINOR.PATCH):

- MAJOR: Incompatible changes that require data migration
- MINOR: Backward-compatible schema additions
- PATCH: Backward-compatible bug fixes

The current version is tracked in the `database_version` table.
