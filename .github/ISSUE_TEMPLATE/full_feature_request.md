## 🧩 Feature Description

Briefly describe the goal of the feature, its purpose, and how it improves the user experience.

---

## ✅ Scope of the Task

- [ ] Check if the backend logic already exists:
  - [ ] Look into `authentication/http` or `users/http` directories.
  - [ ] If not implemented, create a subtask to:
    - [ ] Define DTOs, Commands/Queries, and Handlers.
    - [ ] Expose via a REST controller (following `CreateFormController` pattern).
    - [ ] Document with Swagger.
    - [ ] Add unit and integration tests.

---

## 💻 Frontend

- [ ] Check for existing reusable UI components in `components/ui`.
- [ ] Use available components from `shadcn-vue`.
- [ ] Implement the new view or section as required.
- [ ] Integrate with the backend endpoint (if available).

---

## 🧪 Testing

- **Frontend**
  - [ ] Unit tests using Vitest.
- **Backend** (if involved)
  - [ ] Unit tests.
  - [ ] Integration tests.

---

## ⚠️ Additional Notes

- Authentication and authorization are managed via a BFF connected to Keycloak. **Vue must not call Keycloak directly.**
- Maintain visual and interaction consistency by reusing existing `shadcn` components.
- Raise questions if logic or flows are unclear before implementation.
- Prefer small, well-scoped pull requests.

---

## 📎 Resources

- UI components directory: `components/ui`
- Backend endpoints: `authentication/http`, `users/http`
- Internal documentation: [DeepWiki](https://...)

---

## 🧵 Related Subtasks

- [ ] `BACKEND`: Implement endpoint for [...]
- [ ] `FRONTEND`: Build view for [...]
- [ ] `TEST`: Add coverage for implemented logic
