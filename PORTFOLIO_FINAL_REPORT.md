# Portfolio Demo Final Report

Review date: 2026-07-29

Project: Medical Device Lifecycle Manager

Mode: **Portfolio Demo - Fictional Data**

## Release status

The repository is configured as a fully self-contained portfolio demo. The UI
does not require or attempt a connection to a database, private environment,
or production system.

## Files changed

### Added

- `src/data/demoAccounts.ts` — five intentionally public demo users.
- `src/utils/demoApi.ts` — browser-local mock API and reset behavior.
- `src/assets/fonts/Sarabun-Regular.ttf` and `Sarabun-Bold.ttf` — local fonts.
- `src/assets/fonts/LICENSE.txt` — SIL Open Font License.

### Modified

- `server.ts` — mock-only Express API with ephemeral in-memory data.
- `src/utils/api.ts` — browser API calls bypass the network.
- `src/App.tsx` — restores only valid demo sessions.
- `src/components/LoginScreen.tsx` — one-click demo accounts and reset control.
- `src/components/Header.tsx`, `Sidebar.tsx`, and `index.html` — prominent
  **Portfolio Demo - Fictional Data** labeling.
- `src/components/UserManagement.tsx` and `UserProfileModal.tsx` — simulated
  browser-only changes; no password capture or password changes.
- `src/components/ReportingWorkflow.tsx` — local JSON snapshot instead of an
  external spreadsheet write.
- `src/components/AssetRegistry.tsx` and `src/index.css` — bundled PDF.js and
  locally hosted fonts instead of runtime CDN requests.
- `src/components/SearchWorkflow.tsx`, `IPMWorkflow.tsx`, and `src/types.ts` —
  demo-specific wording and fictional examples.
- `package.json` and `package-lock.json` — removed database, Firebase, and
  production-auth dependencies; added bundled PDF.js.
- `.env.example` — zero-configuration documentation only.
- `vercel.json` and `vite.config.ts` — Vite SPA and mock API routing.
- `README.md` and `MANUAL.md` — demo architecture and zero-env instructions.

### Removed

- `src/lib/firebase-auth.ts`
- `src/lib/google-sheets.ts`
- `src/assets/images/system-architecture.jpg`

## Demo data behavior

- Default device data is bundled in `src/data/mockData.ts`.
- Browser actions persist under versioned `portfolio_demo_*` localStorage keys.
- Refresh restores temporary changes in the same browser.
- **Reset demo** clears temporary data and restores defaults.
- Browsers that block storage use a per-tab memory fallback.
- Direct Vercel API requests use mock data in ephemeral function memory.

## Demo credentials

All accounts use `Demo123!`.

- `demo_admin`
- `demo_registration`
- `demo_ipm`
- `demo_repair`
- `demo_reporting`

These credentials are intentionally public and have no external use.

## Environment variables

**Required: none.**

No database URL, API key, signing secret, provider configuration, or
production credential is used.

## Security findings

- Current tree: no `.env` file other than `.env.example`.
- Current tree: no database connection string, Supabase/Firebase key, JWT
  secret, access token, private URL, or production credential found.
- Git history: three commits inspected; the historical `.env.example` values
  are placeholders/defaults, not high-entropy credentials.
- Demo authentication is intentionally public and protects fictional data
  only. It must not be reused as a production authentication design.
- Browser data is user-editable by design because it is stored in
  `localStorage`; it is not a security boundary.
- Production dependency audit: **0 known vulnerabilities**.

## Deployment verification

| Check | Result |
| --- | --- |
| `npm install` | Passed |
| `npm run lint` (`tsc --noEmit`) | Passed |
| `npm run build` (Vite production) | Passed |
| `npm run build:server` | Passed |
| Browser demo API smoke test | Passed |
| Direct mock API smoke test | Passed: health 200, bad login 401, demo login 200 |
| Vercel function adapter compilation | Passed |
| `vercel.json` structure and routing review | Passed |
| Production dependency audit | Passed: 0 vulnerabilities |
| Required environment variables | None |

## Remaining non-blocking improvements

- Add sanitized UI screenshots.
- Add a public Vercel URL after manual deployment.
- Add automated browser tests and CI.
- Split the largest workflow components to improve long-term maintainability.
- Compress or replace the two large JPEG assets to improve first-load size.

## Portfolio scores

| Category | Score | Notes |
| --- | ---: | --- |
| GitHub readiness | 96/100 | Safe current tree, strong README, license, zero-env setup |
| Production-demo readiness | 94/100 | Deterministic local demo state and validated builds |
| Security | 96/100 | No private integrations or credentials; demo auth is clearly scoped |
| Maintainability | 86/100 | Clear data boundary; several workflow components remain large |
| Recruiter presentation | 91/100 | Complete workflow and documentation; screenshots/live URL remain |

## Final assessment

- Database independence: complete
- Demo credential clarity: complete
- Predictable refresh behavior: complete
- Vercel zero-environment readiness: complete
- Public GitHub portfolio readiness: complete
