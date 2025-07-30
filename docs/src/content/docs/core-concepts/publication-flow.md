---
title: Publication Flow
description: Understand how content moves from draft to published in Hatchgrid.
---

# 🚦 Publication Flow

The publication flow in Hatchgrid defines how content moves through its lifecycle—from draft to published and distributed across multiple channels. This workflow supports scheduled publishing, previews, and channel-specific control.

---

## 🧭 Lifecycle States

Each content item can exist in one of the following states:

- **Draft**: The default state upon creation. Editable and not visible to readers.
- **Scheduled**: Content that has a future `publishedAt` timestamp. It will be published automatically at that time.
- **Published**: Finalized and distributed. Cannot be edited; must be versioned to change.

---

## ⏰ Scheduling Content

Users can schedule content to be published at a specific time. This enables:

- Planning editorial calendars
- Coordinating releases with marketing events
- Aligning across time zones

Scheduling is handled via the `publishedAt` field. When the backend clock reaches that time, the item transitions to `Published`.

---

## 🧪 Previews

Before publishing, users can preview content in multiple formats:

- Email layout
- Web version
- RSS preview

This ensures content appears correctly across different channels before going live.

---

## 📢 Channel Distribution

Upon publishing, content is distributed to the selected channels:

- **Email**: Sent to subscribers of the workspace.
- **Web Feed**: Added to the public listing on the frontend.
- **RSS**: Appears in the generated feed.
- **Custom Channels**: Future support for Slack, Telegram, etc.

Each content item can target multiple channels, and workspaces can configure default behavior.

---

## 🔁 Versioning and Revisions

Once content is published, it becomes immutable. To make changes:

1. Duplicate the original item.
2. Apply updates.
3. Publish as a new version (optionally linking to the original).

This allows for audit trails and consistency across distributed copies.

---

## 🔐 Access and Permissions

Only users with `Editor` or `Owner` roles in the workspace can publish or schedule content. All operations are validated both at the API and RLS level.
