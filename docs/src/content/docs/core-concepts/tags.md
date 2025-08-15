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
- `color`: Hexadecimal color code in #RRGGBB format.

## 🛠 Creating a Tag

To create a new tag, the client issues a `PUT` request to the `/api/workspace/{workspaceId}/tag/{tagId}` endpoint.

The `workspaceId` must be provided in the URL path, and clients should not include it in the request body. The server validates the `workspaceId` from the path against the user's authenticated session and will reject requests that do not match.

```http
PUT /api/workspace/c15b9d43-8f47-4f4f-b8e9-9e9b8b8d4a5b/tag/f2c29da7-9c6c-4a6b-9a0e-8d7f6e5e4d3c
Content-Type: application/json

{
  "name": "My First Tag",
  "color": "#FF0000"
}
```

## 📄 Listing Tags

To retrieve all tags for a workspace, the client issues a `GET` request to the `/api/workspace/{workspaceId}/tag` endpoint.

```http
GET /api/workspace/c15b9d43-8f47-4f4f-b8e9-9e9b8b8d4a5b/tag
Accept: application/json
```

## 🔗 Assigning Tags to Subscribers

To assign a tag to one or more subscribers, you can update the tag and include the `subscribers` property with a list of subscriber emails.

```http
PUT /api/workspace/{workspaceId}/tag/{tagId}/update
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
