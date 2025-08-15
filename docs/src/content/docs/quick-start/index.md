---
title: Quick Start
description: Get Hatchgrid running locally and publish your first content.
---

# 🚀 Quick Start

Welcome to Hatchgrid! This guide will help you set up the platform locally and publish your first piece of content in just a few steps.

---

## 1. 📦 Prerequisites

Before getting started, make sure you have the following installed:

- Node.js (v22+)
- Java 21 (for backend)
- Docker + Docker Compose
- PostgreSQL client (optional but helpful)
- pnpm (recommended for frontend)

---

## 2. 🛠️ Clone and Setup

```bash
git clone https://github.com/dallay/hatchgrid.git
cd hatchgrid
```

Install dependencies:

```bash
# Frontend
pnpm install

# Backend
./gradlew build
```

---

## 3. ⚙️ Environment Setup

Copy and edit the example environment files:

```bash
cp .env.example .env
```

Adjust values such as database credentials, Keycloak settings, and ports.

---

## 4. 🐳 Start the Stack

Run the platform using Docker Compose:

```bash
docker compose up -d
```

This will start:
- PostgreSQL
- Keycloak

To run the backend and frontend, you will need to run them in separate terminals:

```bash
# Run the backend
./gradlew bootRun

# Run the frontend
cd client/apps/web
pnpm dev
```

---

## 5. 👤 Access the App

Visit the frontend at:

```text
docs    -> http://localhost:4321
landing -> http://localhost:4322
web     -> http://localhost:9876
```

The default Keycloak admin panel (for setting up users) is at:

```text
http://localhost:9080
```

Default credentials (change them!):

- Username: `admin`
- Password: `secret`

Backend API is available at:

```text
http://localhost:8080/api
```
---

## 6. ✍️ Create and Publish Content

1. Login with your test user.
2. Create a new workspace.
3. Write a post.
4. Choose publishing options (channels, summary, language).
5. Publish or schedule it.

You’ve just published your first piece with Hatchgrid!

---

## 🧪 Troubleshooting

- Run `pnpm run check`, `pnpm run test`, and `pnpm run build` in `client` to validate frontend.
- Run `./gradlew test` and `./gradlew detektAll` in `server` to check backend.
- Use logs from `docker compose logs -f` to identify issues.

---

## ✅ Next Steps

- Explore [Core Concepts](../core-concepts)
- Learn about [Workspace management](../core-concepts/workspace)
- Customize [Publishing Workflows](../user-guide/publish-channels)
