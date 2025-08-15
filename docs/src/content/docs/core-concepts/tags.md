---
title: Tags
description: How to use Tags in Hatchgrid.
---

# 🏷️ Tags

**Tags** are used in Hatchgrid to categorize and organize content, particularly for newsletter subscribers. Tags allow for flexible segmentation of your audience, enabling targeted communication.

## 🧩 Structure

A tag typically includes:

- `id`: A UUID.
- `workspaceId`: The workspace to which it belongs.
- `name`: Human-readable name (e.g., "VIP", "New Subscribers").
- `color`: A hexadecimal color code for visual identification.

## 🛠 Creating a Tag

To create a new tag, the client issues a `POST` request to the `/api/v1/tags` endpoint:

```http
POST /api/v1/tags
Content-Type: application/json

{
  "name": "My First Tag",
  "color": "#FF0000"
}
```

## 🔗 Assigning Tags to Subscribers

To assign a tag to one or more subscribers, you can update the tag and include the `subscribers` property with a list of subscriber emails.

```http
PUT /api/v1/workspace/{workspaceId}/tag/{tagId}/update
Content-Type: application/json

{
  "name": "Updated Tag Name",
  "color": "#0000FF",
  "subscribers": [
    "subscriber1@example.com",
    "subscriber2@example.com"
  ]
}
```

This will associate the tag with the provided subscribers. If the subscribers do not exist, they will be created.
