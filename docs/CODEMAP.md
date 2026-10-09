# Mapa del código de Mesa

Atajo para no explorar el repo en cada sesión. Léelo cuando la tarea toque código;
actualízalo en la misma tarea si mueves pantallas, migras una al tema nuevo o creas
archivos grandes. Última revisión: 2026-10-09.

## Rutas → pantallas (mobile/src)

Las rutas grandes reexportan una pantalla de `screens/`; el resto tiene la UI en la ruta.

| Ruta (`app/`) | Implementación |
|---|---|
| `(app)/home` | `screens/HomeScreen` + `components/Home*` |
| `(app)/map` | `screens/MapScreen` → `screens/MapScreenPolished` (web: `MapScreen.web`) + `styles/map-*.styles.ts` |
| `(app)/add` | en la ruta + `components/AddHubScreen.styles` |
| `(app)/groups/index`, `create`, `explore` | en la ruta + `GroupsPrimitives`, `GroupCard`, `GroupList.styles` |
| `(app)/groups/[groupId]` | `screens/PrivateGroupDetailScreen` + `GroupDetailPrimitivesTuned` (envuelve `GroupDetailPrimitives`) |
| `(app)/groups/public/[groupId]` | `screens/PublicGroupDetailScreen` + `GroupDetailPrimitives` |
| `(app)/groups/public/[groupId]/collaborators` | `screens/PublicGroupCollaboratorsScreen` |
| `(app)/groups/[groupId]/restaurants/*`, `restaurant-proposals/*`, `members/add`, `edit`, `collaboration*` | en la ruta + `Restaurant*`, `FormField`, `PrimaryButton` |
| `(app)/profile`, `profile-edit`, ajustes (`*-settings`, `change-password`, `delete-account`, `help-support`, `support-request`, `about-mesa`), `notifications`, `group-invitations` | en la ruta |
| `(auth)/login`, `register`, `onboarding` | en la ruta + `FormField`, `PrimaryButton` |
| Barra de pestañas | `navigation/AppTabsLayout` |

## Estado de la migración al sistema nuevo

- **Ya en el tema nuevo** (`useTheme`, `theme/index.ts`, `components/ui/`): Inicio
  (`HomeScreen`, `Home*`), `NotificationBellButton`, `navigation/AppTabsLayout`,
  `MapScreen.web`.
- **Aún en el tema antiguo** (`theme/colors.ts`, `theme/layout.ts`, `theme/fonts.ts`):
  todo lo demás. Al migrar una pantalla, pásala a `useTheme` + `components/ui` y
  sustituye `PrimaryButton`/`FormField` cuando haya equivalente en `ui/`.
- Base nueva: `theme/tokens.ts`, `palette.ts`, `typography.ts`, `use-theme.ts`,
  `create-styles.ts`. Componentes: `ui/AppText, Avatar, Button, EmptyState,
  InlineBanner, PressableCard, RatingBadge, RestaurantCover, SectionHeader, Skeleton,
  StatusChip`.

## Archivos grandes: busca con Grep antes de leerlos enteros

`screens/MapScreenPolished.tsx` (~1960 líneas) · `components/GroupDetailPrimitives.tsx`
(~1280) · `screens/PublicGroupDetailScreen.tsx` (~720) ·
`screens/PrivateGroupDetailScreen.tsx` (~690) · `DESIGN.md` (~500; tokens en el YAML,
componentes desde «## Components»).

## Datos y API

- Cliente: `lib/api.ts`; un servicio por dominio en `services/*-service.ts` con sus
  tipos en `types/<dominio>.ts` (mismo nombre).
- Contextos: `contexts/auth-context.tsx`, `contexts/notification-context.tsx`.
- Helpers: `lib/activity.ts`, `home-recommendation.ts`, `relative-time.ts`,
  `restaurant-images.ts`, `push-notifications.ts`, `onboarding.ts`.

## Backend (backend/src/main/java/com/pauluna/mesa)

| Módulo | Controladores (`api/`) |
|---|---|
| `auth` | `AuthController` |
| `user` | `UserController`, `NotificationPreferencesController`, `PrivacyPreferencesController` |
| `group` | `GroupController`, `GroupMemberController`, `GroupInvitationController`, `ReceivedGroupInvitationController`, `GroupActivityController`, `PublicGroupController` |
| `restaurant` | `RestaurantController`, `RestaurantSearchController`, `RestaurantRatingController`, `RestaurantFavoriteController`, `RestaurantProposalController`, `MapRestaurantController` |
| `notification` | `NotificationController`, `PushDeviceController` |
| `support` | `SupportRequestController` |
| `shared` | `health/HealthController` |

Migraciones: la más alta es `V101` (ordenan por número: `V100` va después de `V21`).
