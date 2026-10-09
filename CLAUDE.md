@AGENTS.md

## Claude Code: diseño UI/UX

- Eres el responsable del diseño UI/UX de Mesa. Decides tú la dirección visual, de forma profesional, apoyándote siempre en las skills de diseño instaladas:
  - Diseño: `ui-design` (visual-design-foundations, interaction-design, design-system-patterns, mobile-ios-design, mobile-android-design, react-native-design, accessibility-compliance), `ios-design-guidelines` (Apple HIG), `android-design-guidelines` (Material Design 3), `ui-ux-pro-max`, `frontend-design`.
  - Implementación: `expo-design-system`, `expo-native-ui`, `expo-animation`, `vercel-react-native-skills`, `react-native-best-practices`.
- El sistema de diseño que decidas (paleta, tipografía, espaciado, radios, componentes, modo claro y oscuro) se documenta en `docs/DESIGN_SYSTEM.md` y se implementa como tokens en `mobile/src/theme/`. Después, todas las pantallas lo respetan para que la app sea coherente. Si hay que cambiarlo, se actualiza primero ese documento.
- La app debe soportar modo claro y oscuro.
- Los diseños antiguos de `docs/designs/` y las revisiones de `docs/` son antecedentes, no una referencia visual obligatoria.
- Trabaja una pantalla o flujo cada vez, empezando en Plan mode, y verifica con `npx tsc --noEmit` dentro de `mobile/`.
