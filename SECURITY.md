# MedTracker Security Hardening Checklist

Immediate actions
- Rotate all secrets now: database credentials, JWT secret, SMTP credentials, and Google OAuth client secret.
- Invalidate any leaked tokens by rotating JWT secrets and forcing re-login.

Transport security
- Use HTTPS in production. Secure cookies require TLS.
- If frontend and backend are on different domains, set `COOKIE_SAMESITE=none` and keep HTTPS enabled.

Monitoring, logs, and alerting
- Set `LOG_FILE` to enable persistent HTTP request logs, or leave empty to log to console.
- Set `ALERT_EMAIL_TO` (and SMTP settings) to receive 5xx error alerts.
- Add external monitoring (uptime checks, APM, centralized logs) for production.

Abuse prevention
- Configure hCaptcha:
  - Backend: set `HCAPTCHA_SECRET`.
  - Frontend: set `VITE_HCAPTCHA_SITE_KEY`.
- Adjust OTP lockout controls using `OTP_MAX_ATTEMPTS` and `OTP_LOCK_MINUTES`.

Network protection
- Restrict inbound ports to 80/443 (and 22/3389 only if needed).
- Place the database in a private network and allow only the app server to reach it.
- Use a WAF or CDN (Cloudflare/AWS WAF) to block common attacks.

Database safety
- Use a least-privileged database user (read/write only on the MedTracker DB).
- Enable automated backups and test restores regularly.

Dependency hygiene
- Run `npm run audit` in `backend/` and `my-app/` regularly.
- Keep Node and packages updated; enable automated PRs (Dependabot or Renovate).

Secrets handling
- Never commit `.env` files.
- Store secrets in a secret manager for production (AWS Secrets Manager, GCP Secret Manager, etc.).
