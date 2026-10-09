# Mesa — Repository Instructions

## Project

Mesa is a collaborative mobile application for saving, organizing and
rating restaurants within private or public groups.

Read `PROJECT_CONTEXT_MESA.md` before making architectural or product changes.

## Repository

- `backend/`: Java 21, Spring Boot 4, Maven, PostgreSQL and Flyway.
- `mobile/`: React Native, TypeScript, Expo and Expo Router.

## General rules

- Work only on the requested scope.
- Inspect existing code before creating new abstractions.
- Do not rewrite unrelated files.
- Do not create branches, commits, pushes or pull requests.
- Never modify or commit `.env` files.
- Never include real credentials or secrets.
- Prefer maintainable, explicit code over clever abstractions.
- Preserve existing naming and package conventions.
- Explain all relevant changes after implementation.

## Backend rules

- Use the existing modular organization:
  - api
  - application
  - domain
  - infrastructure
- Database changes must use new Flyway migrations.
- Never edit a migration that may already have been executed.
- Hibernate uses `ddl-auto: validate`.
- Do not expose password hashes.
- Obtain the current user from the authenticated JWT.
- Add or update tests for business logic when appropriate.
- Run Maven compilation or tests after backend changes.

## Mobile rules

- Use TypeScript without `any`.
- Use Expo Router for navigation.
- Use `react-native-safe-area-context`.
- Reuse the existing authentication context, API client, components and theme.
- Keep the UI mobile-first and follow `docs/DESIGN_SYSTEM.md` once it exists.
- Handle loading, empty, success and error states.
- Do not hardcode the backend IP.
- Use `EXPO_PUBLIC_API_URL`.
- Run TypeScript checks after mobile changes.

## Efficient work on the existing application

- Treat Mesa as an existing React Native/Expo application with a Java/Spring backend. Start from its current implementation and requested problem.
- For mobile UI, use the design skills listed in CLAUDE.md. Read only rules relevant to the task; web-specific Next.js, DOM, Tailwind and shadcn guidance does not apply automatically to native screens.
- Reuse the current theme and components. The previous "Sobremesa" visual direction was dropped; the new one will be documented in `docs/DESIGN_SYSTEM.md`. If documentation and current implementation disagree, establish the current behavior before changing it.
- Use targeted searches and diffs. The nested mesa-app-build-88394e folder is a separate copy; use the root mobile/ and backend/ unless the user specifies otherwise.
- Preserve local uncommitted changes. Work on one clearly scoped screen or flow at a time and verify that result before expanding the scope.
- Existing UX reviews and HTML prototypes provide context, but do not prove current native behavior. Validate visual changes in the native app when the environment permits; report the specific limitation when it does not.

## Completion requirements

Before finishing:

1. Check the changed files.
2. Run the relevant compilation, tests or type checks.
3. Fix errors caused by the task.
4. Summarize changed files and commands.
5. Provide manual testing instructions.
6. Report anything that could not be verified.
