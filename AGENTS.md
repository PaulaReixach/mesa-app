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
- Keep the UI mobile-first and consistent with the current Mesa design.
- Handle loading, empty, success and error states.
- Do not hardcode the backend IP.
- Use `EXPO_PUBLIC_API_URL`.
- Run TypeScript checks after mobile changes.

## Completion requirements

Before finishing:

1. Check the changed files.
2. Run the relevant compilation, tests or type checks.
3. Fix errors caused by the task.
4. Summarize changed files and commands.
5. Provide manual testing instructions.
6. Report anything that could not be verified.