# Mesa — Repository Instructions

Mesa is a collaborative mobile app for saving, organizing and rating restaurants within
private or public groups. Product context: `PRODUCT.md`. Visual system: `DESIGN.md`.

## Where things are

Before exploring code, read `docs/CODEMAP.md` (routes → screens, theme migration status,
large files, controllers). Keep it current when you move or migrate screens.

- `backend/`: Java 21, Spring Boot 4, Maven, PostgreSQL, Flyway. Modular monolith under
  `com.pauluna.mesa`: `auth`, `user`, `group`, `restaurant`, `notification`, `support`,
  `shared`, each split into `api`, `application`, `domain`, `infrastructure`. No global
  `controller/service/repository` folders. Migrations in
  `src/main/resources/db/migration` (`V<n>__*.sql`; check the highest number first:
  they sort numerically, not alphabetically).
- `mobile/src/` (Expo + React Native + TypeScript):
  - `app/`: Expo Router routes. `(auth)/` login, register, onboarding. `(app)/` tabs
    `home`, `groups/`, `add`, `map`, `profile` plus settings screens. Group detail and
    restaurants live under `groups/[groupId]/…`; public groups under `groups/public/`.
  - `screens/`: large screens used by routes (`HomeScreen`, `MapScreen`,
    `PrivateGroupDetailScreen`, `PublicGroupDetailScreen`…).
  - `components/ui/`: design-system base components. `components/`: feature components
    (`Home*`, `Group*`, `Restaurant*`…).
  - `theme/`: tokens and `useTheme()` (`colors.ts`, `layout.ts` are deprecated).
  - `services/*-service.ts`: one API client per domain, on top of `lib/api.ts`.
    `types/`: API types. `contexts/`: auth and notifications. `lib/`: helpers.
- `docs/designs/prototipo/`: approved HTML prototype and brand (`node server.cjs`,
  http://127.0.0.1:8770; identity in `brand.html`, logos in `brand/`).
- `docs/archive/`: superseded reviews, the dropped «Sobremesa» direction and the old
  project context. History only: do not read or follow it unless asked.

## Domain rules

- A restaurant can belong to many groups; its status, notes and reviews depend on the
  group. Removing it from a group never deletes it globally.
- Duplicates are avoided with the provider's external id. Manual entry is the fallback
  when search finds nothing. Show OpenStreetMap attribution.
- One review per user, restaurant and group; only its author can edit it. The group
  average counts only existing reviews («sin valorar» is not a low score).
- Only members see a private group and add restaurants to it.
- A restaurant may have no photo. Never copy photos from Google, Instagram or Tripadvisor.

## General rules

- Work only on the requested scope; inspect existing code before adding abstractions.
- Do not rewrite unrelated files. Preserve local uncommitted changes.
- Do not create branches, commits, pushes or pull requests.
- Never modify or commit `.env` files, keystores or service-account files; never
  include real credentials or secrets.
- Prefer maintainable, explicit code; preserve naming and package conventions.

## Backend rules

- Database changes use new Flyway migrations; never edit one that may have run.
- Hibernate uses `ddl-auto: validate`. Do not expose password hashes.
- Get the current user from the authenticated JWT.
- Add or update tests for business logic; run Maven compile or tests after changes.

## Mobile rules

- TypeScript without `any`. Expo Router for navigation. `react-native-safe-area-context`.
- Reuse the auth context, API client, theme and `components/ui`. Follow `DESIGN.md`;
  `theme/colors.ts` and `theme/layout.ts` are deprecated.
- Handle loading, empty, success and error states.
- Never hardcode the backend IP; use `EXPO_PUBLIC_API_URL`.
- Run `npx tsc --noEmit` in `mobile/` after changes.

## Completion

1. Review the changed files.
2. Run the relevant compile, tests or type checks and fix what the task broke.
3. Summarize changed files and commands, give manual test steps, and report anything
   that could not be verified.
