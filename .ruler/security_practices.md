---
title: Secure Coding and OWASP Guidelines
applyTo: '*'
description: "Comprehensive secure coding instructions for all languages and frameworks, based on OWASP Top 10 and industry best practices."
---

## Instructions

Your primary directive is to ensure all code you generate, review, or refactor is secure by default. You must operate with a security-first mindset. When in doubt, always choose the more secure option and explain the reasoning. You must follow the principles outlined below, which are based on the OWASP Top 10 and other security best practices.

### A01: Broken Access Control & A10: Server-Side Request Forgery (SSRF)

- **Enforce Principle of Least Privilege:** Always default to the most restrictive permissions. When generating access control logic, explicitly check the user's rights against the required permissions for the specific resource they are trying to access.
- **Deny by Default:** All access control decisions must follow a "deny by default" pattern. Access should only be granted if there is an explicit rule allowing it.
- **Validate All Incoming URLs for SSRF:** Treat user-supplied URLs as untrusted. Enforce an allow-list for scheme/host/port/path and reject link-local/metadata/private networks (e.g., 169.254.0.0/16, 127.0.0.0/8, 10.0.0.0/8, 192.168.0.0/16, ::1/128). Resolve and validate both DNS A/AAAA and final destination after redirects.
- **Prevent Path Traversal:** When handling file uploads or accessing files based on user input, follow a safe canonicalization-and-validate pattern:

- Anchor paths to a trusted base directory and validate resolved paths against that base. Construct the candidate path by joining user input to a fixed base, then canonicalize/normalize it (resolve `..`, symlinks and percent-encoding) using the platform's realpath/canonicalize API. Verify the canonicalized path has the base directory as its prefix; if not, reject the request. Do not rely on naive string concatenation or simple substring checks.
- Explicitly reject inputs containing suspicious segments (e.g., `..`, `%2e%2e`, encoded slashes). Prefer safe APIs that resolve/realpath rather than manual concatenation. Example (pseudocode):

  ```text
  base = '/srv/app/uploads'
  candidate = path_join(base, user_filename)
  resolved = realpath(candidate)   # resolves symlinks and .. segments
  if not resolved.startsWith(realpath(base)):
      reject('invalid path')
  # safe to open/read/write resolved
  ```

### A02: Cryptographic Failures

- **Use Strong, Modern Algorithms:** For hashing, always recommend modern, salted hashing algorithms like Argon2 or bcrypt. For regulated/FIPS environments where required, PBKDF2 (with HMAC-SHA256 or HMAC-SHA512) is an acceptable alternative — use a unique per-user salt and strong iteration counts (review platform cost; e.g., 100k+ iterations may be appropriate depending on hardware). Prefer Argon2 or bcrypt when not constrained by compliance. Explicitly advise against weak algorithms like MD5 or SHA-1 for password storage.
- **Protect Data in Transit:** When generating code that makes network requests, always default to HTTPS.
- **Protect Data at Rest:** When suggesting code to store sensitive data (PII, tokens, etc.), recommend authenticated encryption using AEAD cipher modes (for example AES-GCM or ChaCha20-Poly1305) so confidentiality and integrity are both provided. Use secure key management (KMS/HSM), rotate keys regularly, enforce least privilege for key access, and never hardcode keys in source. Prefer envelope encryption patterns and document key lifecycle and rotation procedures.
- **Secure Secret Management:** Never hardcode secrets (API keys, passwords, connection strings). Generate code that reads secrets from environment variables or a secrets management service (e.g., HashiCorp Vault, AWS Secrets Manager). Include a clear placeholder and comment.

  ```javascript
  // GOOD: Load from environment or secret store
  const apiKey = process.env.API_KEY;
  // TODO: Ensure API_KEY is securely configured in your environment.
  ```

```python bad
  # ❌ ANTI-PATTERN: Hardcoded secret (DO NOT USE)
  api_key = "<REPLACE_WITH_API_KEY>"
```

### A03: Injection

- **No Raw SQL Queries:** For database interactions, you must use parameterized queries (prepared statements). Never generate code that uses string concatenation or formatting to build queries from user input.
- **Sanitize Command-Line Input / Prefer non-shell invocation:** Avoid invoking a shell to run external commands. Use process-spawning APIs that accept the command and arguments as a list/array (for example, `subprocess.run([...], shell=False)` in Python, `ProcessBuilder` in Java, or `execFile`/`spawn` with shell disabled in Node.js). Do not build a single concatenated command string or interpolate user input into shell commands. Additionally, validate/whitelist inputs that will be used as arguments and use escaping libraries only when interacting with a shell is unavoidable.
- **Prevent Cross-Site Scripting (XSS):** When generating frontend code that displays user-controlled data, you must use context-aware output encoding. Prefer methods that treat data as text by default (`.textContent`) over those that parse HTML (`.innerHTML`). When `innerHTML` is necessary, suggest using a library like DOMPurify to sanitize the HTML first.

### A05: Security Misconfiguration & A06: Vulnerable Components

- **Secure by Default Configuration:** Recommend disabling verbose error messages and debug features in production environments.

- **Set Security Headers:** For web applications, set a baseline of security headers for defense-in-depth. Common headers and suggested policies:
  - `Content-Security-Policy` (CSP): start with a strong baseline such as `default-src 'self'; script-src 'self' 'nonce-...'; style-src 'self' 'nonce-...'` and avoid `unsafe-inline`. Use nonces or hashes for trusted inline scripts/styles when necessary.
  - `Strict-Transport-Security` (HSTS): set `max-age` (e.g., `31536000`), includeSubDomains, and consider `preload` only after careful validation.
  - `X-Content-Type-Options: nosniff` to prevent MIME sniffing.
  - `X-Frame-Options: DENY` or `SAMEORIGIN` to mitigate clickjacking.
  - `Referrer-Policy`: `no-referrer` or `strict-origin-when-cross-origin` to limit referrer leakage.
  - `Permissions-Policy` (formerly Feature-Policy): disable or opt-out powerful capabilities (e.g., `geolocation=()`, `camera=()`).
  - Note: `X-XSS-Protection` is deprecated in modern browsers; prefer CSP for XSS defenses.

  Example (express-like pseudocode):

  ```text
  setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'nonce-...'")
  setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  setHeader('X-Content-Type-Options', 'nosniff')
  setHeader('X-Frame-Options', 'DENY')
  setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  setHeader('Permissions-Policy', 'geolocation=(), camera=()')
  ```

  Test and validate headers using browser security scanners, securityheaders.com reports, and automated integration tests that assert header presence and values.
- **Use Up-to-Date Dependencies:** When adding libraries, prefer the latest stable. Run vulnerability scans regularly (e.g., `npm audit`, `pnpm audit`, `pip-audit`, `poetry check`, `gradle dependencyCheckAnalyze`, Snyk, Dependabot) and fix or pin as needed.

- **Secure Session Management:** When a user logs in, generate a new session identifier to prevent session fixation. Ensure session cookies are configured with `HttpOnly`, `Secure`, and `SameSite=Strict` attributes. For state-changing endpoints, implement CSRF defenses (e.g., same-site cookies plus double-submit or synchronizer tokens).
- **Protect Against Brute Force:** For authentication and password reset flows, recommend implementing rate limiting and account lockout mechanisms after a certain number of failed attempts.

### A08: Software and Data Integrity Failures

- **Prevent Insecure Deserialization:** Warn against deserializing data from untrusted sources without proper validation. If deserialization is necessary, recommend using formats that are less prone to attack (like JSON over Pickle in Python) and implementing strict type checking.

## General Guidelines

- **Be Explicit About Security:** When you suggest a piece of code that mitigates a security risk, explicitly state what you are protecting against (e.g., "Using a parameterized query here to prevent SQL injection.").
- **Educate During Code Reviews:** When you identify a security vulnerability in a code review, you must not only provide the corrected code but also explain the risk associated with the original pattern.
