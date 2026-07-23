# INFNOVA Applicants Dashboard

🔗 **Live demo:** https://infnova-dashboard-iota.vercel.app

An internship-applicant management dashboard built for the INFNOVA Technologies
Frontend Internship practical challenge.

## Setup instructions

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

The app expects the API base URL configured in `src/services/api.ts`:

```ts
const api = axios.create({
  baseURL: 'https://infnova-intern.vercel.app/api',
});
```

**Login credentials** (provided by INFNOVA ):
- Email: `admin@infnova.tech`
- Password: `InternChallenge2026!`



## Technologies used

- **React + TypeScript** — required by the brief.
- **react-router-dom** — client-side routing between `/` (login) and `/dashboard`.
- **axios** — HTTP client, chosen over `fetch` for its interceptor API, which
  made it straightforward to attach the bearer token to every request and
  centrally handle expired-session (401) responses in one place rather than
  repeating that logic in every call site.
- **Inline styles + a small shared `theme.ts` token file**, instead of a CSS
  framework. For a project this size, a lightweight token object (colors,
  radius, shadows, fonts) gave enough consistency without adding a build-time
  dependency like Tailwind. CSS Modules are used only where inline styles
  can't do the job — specifically the responsive table-to-card layout, which
  needs media queries.
- **No state-management library.** The data-fetching and mutation logic is
  isolated in custom hooks (`useApplicants`, `useDashboardSummary`,
  `useApplicationStatuses`); local UI state (search text, selected page,
  sort column, open modal) lives in `useState` inside `Dashboard.tsx`. At
  this scale, introducing Redux/Zustand would add ceremony without solving
  a real problem.
- **No UI component library.** All components (StatCard, SearchBar,
  Pagination, ApplicantTable, StatusBadge, ApplicantDetailsModal) are
  hand-built, including a small set of inline SVG icons, to avoid pulling in
  a dependency for what amounted to under a dozen small components.

## Architecture

```
src/
├── theme.ts                     # shared design tokens
├── types/applicant.ts           # shared TypeScript types
├── services/api.ts              # axios instance, auth interceptors, logout/me helpers
├── hooks/
│   ├── useApplicants.ts         # list fetching, pagination, search, sort, status updates
│   ├── useDashboardSummary.ts   # GET /dashboard/summary
│   └── useApplicationStatuses.ts# GET /application-statuses
├── components/                  # presentational building blocks
│   ├── StatCard.tsx
│   ├── SearchBar.tsx
│   ├── Pagination.tsx
│   ├── ApplicantTable.tsx (+ .module.css for the mobile layout)
│   ├── StatusBadge.tsx
│   ├── ApplicantDetailsModal.tsx
│   └── icons.tsx
└── pages/
    ├── Login.tsx
    └── Dashboard.tsx            # composes the hook + components; owns page-level state
```

The guiding principle was separating **data concerns** (the hooks) from
**presentation** (the components), with `Dashboard.tsx` acting as a thin
composition layer that wires the two together and owns only the UI state
that genuinely belongs at the page level (which page, what's typed in
search, which column is sorted, which applicant's modal is open).

### Search and sort

The applicant-list endpoint's exact `search`/`sort` query-parameter behavior
wasn't fully confirmed from the available API docs, and in testing the
`search` parameter did not appear to match against the `country` field.
Rather than depend on undocumented backend behavior, `useApplicants` fetches
the full applicant list once (all pages, cached in a ref), then performs
search (across name, email, country, track) and sorting client-side, before
paginating the filtered/sorted result for display. This trades a few extra
initial network requests for search behavior that's guaranteed correct
regardless of what the backend actually implements. At this dataset size
(~50 applicants) the tradeoff is invisible to the user; it would need
revisiting if the applicant pool grew into the thousands (see "What I'd
improve" below).

### Expired sessions

`services/api.ts` registers a response interceptor that watches for 401
responses (which the API returns as `{ statusCode, error, message }` for a
missing, invalid, or expired token). On a 401, the stored token is cleared
and the user is redirected to `/?sessionExpired=1`, which `Login.tsx` reads
to show an explanatory message instead of leaving the user wondering why
they were signed out. `Dashboard.tsx` additionally calls `GET /auth/me` on
mount to confirm the stored token is still valid before rendering, rather
than only checking that a token string exists in `localStorage`.

## Assumptions made

- The list endpoint returns items matching `ApplicantSummary`, while
  `GET /applicants/{id}` returns the fuller `Applicant` shape (per the
  distinct schemas shown in the API docs) — the details modal fetches the
  full record on open rather than trusting the summary row alone.
- The default page size is 10 (inferred from the "This page" stat observed
  during testing); this is used as the client-side page size when search/sort
  fall back to local pagination.
- `PATCH /applicants/{id}/status` accepts a raw `{ status: string }` body.
- `PATCH /applicants/{id}/notes` accepts `{ notes: string | null }`, capped
  at 1000 characters per the docs.
- The exact shape of `GET /dashboard/summary` wasn't confirmed from the docs
  screenshots, so it's typed loosely and the UI falls back to the list
  endpoint's own `meta.total` if a field is missing.
- `GET /application-statuses` returns either a plain string array or an
  array of objects with a `value`/`name` field; the app handles both and
  falls back to a hardcoded `[pending, reviewing, accepted, rejected]` list
  if the request fails.

## What I'd improve with more time

- **Move search/sort server-side** once the exact query-parameter contract
  is confirmed, to avoid fetching the full dataset — this matters once the
  applicant list grows large.
- **Debounce and cancel in-flight requests** more aggressively using
  `AbortController`, rather than only guarding against stale responses with
  a request-id ref.
- **Add automated tests** (component tests for the table/modal, and a couple
  of integration tests around the search/sort/pagination interaction) —
  everything here was verified manually and via `tsc --noEmit`, but there's
  no test suite yet.
- **Persist filters/sort in the URL** (query params) so a refreshed or
  shared link preserves the current view.
- **Accessibility pass** — keyboard navigation for the sortable headers and
  modal, and focus-trapping inside the details modal, weren't fully
  addressed.
- **Toast notifications** instead of inline error text for actions like
  failed status updates, so errors are noticeable without stealing layout
  space.
