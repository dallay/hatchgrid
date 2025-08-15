---
title: Workspaces
description: A workspace is the core organizational unit in Hatchgrid, grouping users, content, and distribution settings.
---

# 🧩 Workspaces

A **workspace** is the core organizational unit in Hatchgrid. It encapsulates everything a creator or team needs to collaborate, structure, and distribute content in a focused context.

Think of a workspace as a **content environment**: each workspace has its own users, content drafts, publishing rules, and configuration. Users can belong to multiple workspaces, and each workspace can have different roles and permissions.

---

## ✨ Key Properties

- **Isolation**: Each workspace has its own database row-level security (RLS) context. Content and configuration do not leak between workspaces.
- **Membership**: Users are invited to workspaces and assigned roles (e.g. Owner, Editor, Viewer).
- **Scoped Content**: Posts, digests, translations, schedules, and subscribers are always scoped to a workspace.
- **Custom Settings**: Each workspace can define its own publishing channels, default languages, and frequency rules.

---

## 👥 Roles and Permissions

- **Owner**: Full control over the workspace, users, and settings.
- **Member**: Can view and manage content within the workspace.

Roles can be extended in the future with granular permissions (e.g. per-channel publishing rights).

---

## 🛠 Creating a Workspace

To create a new workspace, the client issues a `PUT` request with a client-generated UUID:

```http
PUT /api/v1/workspaces/{workspaceId}
Content-Type: application/json

{
  "name": "My First Workspace"
}
```

This design ensures compatibility with offline-first workflows and deterministic IDs.

---

## 🔄 Switching Between Workspaces

The frontend supports multiple workspaces per user. Users can switch between them via the workspace selector component. All content, UI state, and API requests automatically re-scope to the active workspace context.

---

## 🔐 Security Considerations

Workspaces are enforced at the API and database level:

- API endpoints require workspace ID context and validate ownership/membership.
- PostgreSQL enforces isolation using Row-Level Security (RLS) policies.
- Backend services use authenticated tokens with claims that include workspace membership.
