---
title: Multilingual Support
description: How Hatchgrid supports creating and delivering content in multiple languages.
---

# 🌐 Multilingual Support

Hatchgrid is built to help creators reach global audiences through seamless multilingual publishing. Authors can create alternate versions of their content in different languages, and readers receive the most relevant version based on preferences or system detection.

---

## 🧠 Concept

Each content item in Hatchgrid is language-specific. Multilingual support is implemented by linking multiple content items under a common logical group or reference.

This allows:
- Independent editing per language
- Language-specific summaries, highlights, and publishing schedules
- Channel-specific control (e.g. only publish the Spanish version via email)

---

## 🧩 Author Workflow

1. Create a content item in your default language (e.g. English).
2. Use the "Add Translation" feature to generate a new content item for another language.
3. Fill in the localized content and metadata.
4. Optionally, schedule or publish each version independently.

Translations are stored as distinct items but are linked to the same logical cluster.

---

## 🌍 Language Detection and Delivery

Hatchgrid determines the most appropriate content version for each reader based on:

- **Explicit preference**: Set by the user at subscription or profile level.
- **Accept-Language headers**: Inferred from the reader's browser or client.
- **Fallback rules**: If no match is found, default to the original language.

This applies to both email delivery and web rendering.

---

## 🛠 Configuration

- Workspaces can define which languages are supported for their content.
- Authors can define a default language for new posts.
- Each version of a content item can be enabled or disabled for specific channels.

---

## 🤖 Future Improvements

- Assisted translation via AI
- Cross-language content quality checks
- Translation memory for reusing phrases across posts
