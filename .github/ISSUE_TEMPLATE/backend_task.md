## 🎯 Backend Task

### 🧩 Goal

Describe what this backend task should accomplish (e.g., create endpoint, add validation, apply business rule).

---

### 📂 Location

Check the following directories:
- [ ] `authentication/http`
- [ ] `users/http`
- [ ] `...` (custom if needed)

---

### 🚀 Required

- [ ] Define DTOs, Commands/Queries, and Handlers.
- [ ] Use `ApiController` + Swagger documentation.
- [ ] Apply RLS if needed (PostgreSQL).
- [ ] Write Unit & Integration tests.

---

### 🔐 Notes

- Keycloak integration is via BFF — never expose direct Keycloak calls.
- Validate UUIDs and headers (`application/vnd.api.v1+json`).
- Respect RESTful versioning strategy.

---

### 🧪 Testing

- [ ] Unit tests.
- [ ] Integration tests.
