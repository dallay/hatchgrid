# 🛡️ Hatchgrid Authentication Architecture

## Overview

Hatchgrid uses a secure, cookie-based authentication strategy powered by **Keycloak** (OIDC provider), **Spring WebFlux**, and a **CQRS** pattern with custom controller logic. The frontend (Vue.js) interacts with backend endpoints via `HttpOnly` cookies.

This document outlines:

- Auth flow overview (login / logout / refresh / session)
- Backend controllers and CQRS handlers
- Cookie and token strategy
- Security configuration
- Frontend integration guidelines
- How to extend the system

## 1. 🔐 Authentication Flow Diagram (Mermaid)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Keycloak

    User->>Frontend: Visit protected route (/dashboard)
    Frontend->>Backend: GET /api/session (with HttpOnly cookies)
    Backend->>Backend: Validate ACCESS_TOKEN via JwtDecoder
    alt Token valid
        Backend-->>Frontend: 200 OK (session info)
        Frontend-->>User: Render dashboard
    else Token expired or missing
        Frontend->>Backend: POST /api/refresh-token
        alt Refresh token valid
            Backend-->>Frontend: Set new ACCESS_TOKEN + REFRESH_TOKEN cookies
            Frontend->>Backend: Retry GET /api/session
            Backend-->>Frontend: 200 OK
            Frontend-->>User: Render dashboard
        else Refresh token invalid
            Frontend->>User: Redirect to /login
    end

    User->>Frontend: Enter credentials
    Frontend->>Backend: POST /api/login {username, password}
    Backend->>Keycloak: Authenticate user
    Keycloak-->>Backend: Access token, refresh token
    Backend->>Frontend: Set ACCESS_TOKEN + REFRESH_TOKEN (HttpOnly)
    Frontend-->>User: Redirect to /dashboard
```

## 2. 📡 API Endpoints

### `POST /api/login`
- Validates username/password.
- Calls Keycloak to issue tokens.
- Returns tokens via `HttpOnly` cookies: `ACCESS_TOKEN`, `REFRESH_TOKEN`.

### `POST /api/refresh-token`
- Reads `REFRESH_TOKEN` from cookies.
- Requests new `ACCESS_TOKEN`.
- Returns updated tokens via cookies.

### `POST /api/logout`
- Reads `REFRESH_TOKEN`.
- Invalidates session (via command).
- Clears all cookies.

### `GET /api/session`
- Reads `ACCESS_TOKEN`.
- Decodes it using `ReactiveJwtDecoder`.
- Returns session info (`userId`, `email`, `roles`).

## 3. 🍪 Cookie Strategy

| Cookie         | HttpOnly | Secure | Max-Age    | Path | Description               |
|----------------|----------|--------|------------|------|---------------------------|
| ACCESS_TOKEN   | ✅       | ✅     | short TTL  | `/`  | JWT access token          |
| REFRESH_TOKEN  | ✅       | ✅     | longer TTL | `/`  | Refresh token             |
| SESSION        | ✅       | ✅     | session    | `/`  | Optional, used if needed  |


## 4. 🛡️ Security Configuration

- Uses `ServerHttpSecurity` with:
  - `CookieServerCsrfTokenRepository`
  - CORS via `CorsConfigurationSource`
  - OAuth2 resource server JWT validation
  - Method-level security enabled
- Routes like `/api/session`, `/api/logout`, `/api/refresh-token`, `/api/login` are publicly accessible.
- All other `/api/**` endpoints are authenticated.

## 4.1 👤 Account Endpoint

### `GET /api/account`

- Retrieves the full authenticated user profile.
- Reads the `ACCESS_TOKEN` from cookies (automatically included via browser).
- Responds with:
  - `userId`
  - `login`
  - `email`
  - `authorities` (e.g., `ROLE_USER`, `ROLE_ADMIN`)
  - `langKey`
- This is the canonical way for the frontend to determine:
  - Whether the user is logged in
  - Which roles/permissions they have
  - Their preferred language and profile data

#### 🧠 Integration

This endpoint is called during app initialization via:

```ts
accountService.update() → retrieveProfiles() + retrieveAccount()
```

The result is stored in the `authStore.userIdentity` object, used across the frontend for permissions, language and user display.

> 📌 Use `hasAuthority` and `hasAnyAuthority` to protect route access and conditionally show content.

## 5. 🧠 CQRS Pattern

Each action uses a clear command/query split:

| Action           | Type    | Class                          |
|------------------|---------|--------------------------------|
| Login            | Query   | `AuthenticateUserQueryHandler` |
| Refresh token    | Query   | `RefreshTokenQueryHandler`     |
| Logout           | Command | `UserLogoutCommand`            |
| Get session info | Query   | `GetUserSessionQueryHandler`   |

## 6. 💻 Frontend Integration Notes

- Tokens are never handled in JS (no access to `document.cookie`).
- Axios or `fetch` must include credentials (`withCredentials: true` or `credentials: 'include'`).
- On app load:
  - Call `/api/session`
  - If 401, call `/api/refresh-token`
  - If still 401, redirect to `/login`
- After login:
  - Redirect to original path or default `/dashboard`
- After logout:
  - Clear state and redirect to `/login`

## 6.1. 🤝 Coexisting Authentication Methods (HttpOnly Cookies & Bearer Tokens)

Hatchgrid's backend supports two primary authentication mechanisms to cater to different client needs while maintaining security:

1.  **HttpOnly Cookies (Primary for Web Frontend):**
    *   **Mechanism:** Access tokens and refresh tokens are stored in `HttpOnly` and `Secure` cookies. This prevents client-side JavaScript from accessing them, significantly mitigating XSS risks.
    *   **Use Case:** Ideal for web browser-based Single Page Applications (SPAs) like the Vue.js frontend, where the browser automatically sends these cookies with every request to the same domain.
    *   **Backend Handling:** The backend is configured to read these cookies directly from incoming requests.

2.  **Bearer Tokens (Secondary for APIs, Mobile, CLI, etc.):**
    *   **Mechanism:** Access tokens are sent in the `Authorization` header as `Bearer <token>`.
    *   **Use Case:** Necessary for non-browser clients such as mobile applications, command-line interfaces (CLIs), Postman/Insomnia for API testing, or public APIs consumed by other services. These clients cannot typically manage `HttpOnly` cookies.
    *   **Backend Handling:** Standard Spring Security OAuth2 Resource Server configuration handles this.

### 🔄 How They Coexist: The `JwtCookieOrHeaderFilter`

To ensure seamless authentication regardless of the client, a custom `WebFilter`, `JwtCookieOrHeaderFilter`, is implemented in the backend. This filter operates early in the Spring Security filter chain:

-   **Prioritization:** It first checks if an `Authorization: Bearer` header is already present in the incoming request. If it is, the filter does nothing, allowing Spring Security's default JWT processing to take over.
-   **Cookie Injection:** If no `Authorization: Bearer` header is found, but an `ACCESS_TOKEN` cookie (which is `HttpOnly`) is present, the filter reads the token from this cookie and *injects* it into a new `Authorization: Bearer` header for the request.
-   **Security Benefit:** This approach allows the frontend to leverage the security benefits of `HttpOnly` cookies (protection against XSS) while still enabling other clients to authenticate using standard Bearer tokens. The backend's core JWT validation logic remains unified.

This ensures that:
-   The web frontend (Vue.js) can securely authenticate without JavaScript ever touching the sensitive tokens.
-   Other clients (mobile, CLI, etc.) can authenticate using the widely accepted Bearer token standard.
-   The backend consistently receives a `Bearer` token in the `Authorization` header for JWT validation, simplifying the security configuration downstream.

## 7. 🧩 Extensibility Guidelines

When adding new features:

- Use **CQRS** for separation of concerns.
- Return all tokens through `buildCookies()` utility.
- Use `@PostMapping` for token-modifying operations.
- Use `@GetMapping` for read-only session access.
- Maintain cookie security: `HttpOnly`, `Secure`, proper `maxAge`.
- Add proper Swagger annotations (`@Operation`, `@ApiResponses`) for API docs.
- Add test coverage and ensure no tests are broken.
- Follow code conventions:
  - **Backend**: `detekt`
  - **Frontend**: `biome`

## 8. 🧪 Testing Notes

- Ensure backend tests validate:
  - Login and cookie set logic
  - Token refresh flow
  - Session extraction
  - Invalid/missing cookie handling
- Add E2E tests in frontend to test:
  - Login / logout flow
  - Authenticated route guards
  - Auto-refresh on expired token
