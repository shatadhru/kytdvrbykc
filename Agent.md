# Agent Guidelines - Learning Management System (LMS)

This repository is a full-featured **Learning Management System (LMS)** built with Next.js, Payload CMS 3.0, Shadcn UI, Tailwind CSS, and Better Auth.

---

## 1. UI & Design Rules
- **No Sparkles Icon:** `Sparkles` icon from `lucide-react` (or any other icon library) is **strictly prohibited**. Never import or render `Sparkles`. Always use clear, contextual educational icons instead (e.g., `GraduationCap`, `BookOpen`, `Lightbulb`, `Users`, `CheckCircle2`, `Award`, `ShieldCheck`).
- **Must Use Shadcn UI:** Do NOT build custom reinvented UI primitives (e.g., custom dropdowns, custom modals, custom tooltips, custom buttons). Always use official Shadcn UI components located in `@/components/ui/` (managed via Shadcn MCP / CLI).
- **Tailwind CSS:** Freely utilize Tailwind CSS utility classes for styling, responsive layouts, typography, and spacing.

---

## 2. Code Quality & Minimalism (Ponytail Philosophy)
- **Simple & Minimal Code:** Keep code straightforward, readable, and clean. Avoid unnecessary abstraction layers, over-engineering, or over-complicated design patterns.
- **The Ponytail Philosophy:** "The best code is the code you never wrote." Reuse existing project utilities and native platform features rather than writing redundant boilerplate.
- **Basic Language Constructs:** Rely on fundamental JavaScript/TypeScript features — clear functions, well-structured objects, arrays, and standard classes.

---

## 3. Performance & Time Complexity (Big-O)
- **Optimal Operations:** Always consider Big-O time and space complexity in data handling:
  - Use `Map` or `Set` for $O(1)$ lookups instead of nested array searches ($O(N^2)$).
  - Ensure loops, filters, and transforms are linear and efficient ($O(N)$).
  - Keep sorting operations bounded ($O(N \log N)$) and leverage database-level indexing wherever possible.
  - Implement pagination with explicit limits on queries to avoid unbounded memory consumption.

---

## 4. Security & Attack Prevention (Critical)

### 4.1. Brute Force Attack Mitigation
- Implement and enforce strict rate limiting on all sensitive endpoints (login, register, password reset, checkout, OTP verification).
- Track requests by IP address and user identifier.
- Implement exponential backoff or temporary account lockout after multiple consecutive failed attempts.
- Use constant-time comparisons for sensitive token/hash checks.
- Ensure strong password hashing (bcrypt / argon2) via Better Auth.

### 4.2. Cross-Site Scripting (XSS) & CSRF Mitigation
- **XSS Prevention:**
  - Never use `dangerouslySetInnerHTML` unless explicitly sanitized using an established sanitizer (e.g., DOMPurify).
  - Validate and sanitize all user input before storing or rendering.
  - Enforce strict Content Security Policy (CSP) headers and `X-Content-Type-Options: nosniff`.
- **CSRF Protection:**
  - Enforce `trustedOrigins` in Better Auth and Payload CMS for all state-changing requests (POST, PUT, PATCH, DELETE).
  - Ensure cookies use `SameSite=Lax` or `SameSite=Strict` and `HttpOnly; Secure` in production.

### 4.3. DDoS & Privilege Escalation Mitigation
- **DDoS Mitigation:**
  - Enforce request payload size limits on API routes.
  - Apply pagination limits (e.g., max 50–100 items per query) to prevent memory exhaustion and heavy DB scans.
  - Cache high-traffic static/semi-static data (e.g., course catalogs, banners) using Next.js ISR.
- **Privilege Escalation Prevention:**
  - Never trust client-supplied user roles, user IDs, or permissions.
  - Always verify session authenticity and user roles on the server (`req.user.role === 'admin'`).
  - Restrict administrative collections and fields via Payload CMS collection-level and field-level access control (`adminOnlyFieldAccess`).

### 4.4. Safe & Proper bKash Payment Integration
- **Server-Side Only Execution:** Never expose bKash credentials (`BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_PASSWORD`, `BKASH_USERNAME`) to the client. All token grants, payment creation, and execution must run server-side using `'server-only'`.
- **Token Verification:** Ensure the bKash `id_token` is retrieved server-to-server and never transmitted to the browser.
- **Idempotency & Replay Attack Defense:**
  - Prevent duplicate execution: Verify that an order's `paymentID` / `trxID` has not already been used or fulfilled in the database before completing an order.
  - Once processed, mark the order status atomically to prevent race conditions.
- **Amount Verification:** Before confirming an order, verify that the executed payment amount returned by bKash matches the calculated order total in the database.

---

## 5. Communication
- **Always reply in English:** All user-facing explanations, status updates, and communications must be in clear and concise English.
