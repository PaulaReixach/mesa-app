@AGENTS.md

## Claude Code

- Antes de crear, rediseñar o revisar cualquier pantalla o componente de `mobile/`, carga la skill `mesa-ui`. Sus reglas mandan sobre cualquier otra guía de diseño.
- Las skills de proyecto están en `.claude/skills/`. La carpeta `.agents/skills/` es para otros agentes (Codex): Claude Code no la lee.
- Plugins activos: `expo` (skills expo-* y servidor MCP de Expo) y `frontend-design` (solo dirección estética; sus consejos web/CSS no se aplican tal cual a React Native).
- Rediseños: una pantalla o flujo cada vez, empezando en Plan mode, y verificando con `node .claude/skills/mesa-ui/scripts/audit.mjs` + `npx tsc --noEmit` antes de dar el trabajo por cerrado.
