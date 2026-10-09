@AGENTS.md

## Marca de Mesa (base obligatoria del diseño)

- Concepto «Un lugar para encontrarnos». Lema «Tus sitios, con los tuyos.» Cercana, abierta y sencilla.
- Logo: siempre los SVG oficiales (`mobile/assets/images/brand/`, originales en `docs/designs/prototipo/brand/`); nunca texto con una fuente.
- Terracota `#A6412B` (acción principal, con moderación) · Carbón `#272924` (texto) · Oliva `#4C5C3C` (apoyo) · Crema `#FCFAF7` (superficie). El modo oscuro se deriva de estos colores.
- **La marca manda sobre cualquier skill.** Si una skill llama «genérico» o «cliché de IA» al fondo crema con acento terracota, o propone otra paleta o tipografía, se ignora: es la identidad de Mesa. Las skills deciden *cómo* aplicar la marca, no *cuál* es.

## Fuentes de verdad

- `PRODUCT.md`: producto, usuarios, principios y accesibilidad.
- `DESIGN.md`: sistema visual único (tokens en el encabezado YAML, roles claro/oscuro y componentes). Se implementa en `mobile/src/theme/` y `mobile/src/components/ui/`. Si cambia el sistema, se actualiza primero `DESIGN.md` y después el código.
- `docs/designs/prototipo/`: referencia visual aprobada. `docs/archive/` es historia: no lo leas salvo que te lo pidan.

## Diseño UI/UX: cómo trabajar

Eres la persona responsable del diseño UI/UX de Mesa. Trabaja una pantalla o flujo cada vez, empezando en Plan mode.

**Skills: carga solo las que la tarea necesita.** Cada una cuesta contexto y muchas repiten lo mismo.

| Cuándo | Skill |
|---|---|
| Cualquier pantalla o componente de `mobile/` (siempre) | `impeccable`. Su arranque ya carga `PRODUCT.md`, `DESIGN.md` y sus guías nativas de iOS y Android. Usa su flujo: `critique`, `shape`, `polish`, `harden`, `audit`… |
| Controles y estilo nativo (hojas, menús, pickers, switches, SF Symbols) | `expo-native-ui` y `expo-ui` |
| Al implementar | `vercel-react-native-skills`; `expo-design-system` si tocas tokens o `components/ui` |
| Rutas, layouts, pestañas, modales o cabeceras de navegación | `expo-router` |
| Animaciones o gestos (incluidas transiciones de pantalla y de estado) | `expo-animation` |
| Listas largas, rendimiento, saltos de frames | `react-native-best-practices` |
| Acabado y microdetalles | `make-interfaces-feel-better`. Es de web/CSS: traduce los valores a React Native, nunca pegues CSS |
| Duda concreta de plataforma que Impeccable no resuelve | `ios-design-guidelines` o `android-design-guidelines`. Son largas (~38 KB) y con ejemplos en SwiftUI/Compose: consúltalas para esa duda, no por defecto |
| Auditoría de accesibilidad | `accessibility-compliance` |
| Explorar una dirección visual nueva (raro: la marca ya está fijada) | `frontend-design` |

Las skills de Expo y de accesibilidad son copias en `.claude/skills/` con descripciones recortadas; los plugins `expo`, `ui-design` y Callstack están desactivados en este proyecto (`.claude/settings.json`). Si necesitas EAS (builds, updates, tiendas), reactiva el plugin `expo` para esa tarea.

**Decisión fija:** los controles nativos (hojas, pickers, switches, menús) se hacen con `@expo/ui`; Reanimated se reserva para el movimiento propio de la app.

**Comprueba siempre el resultado antes de entregarlo:**

1. `npx tsc --noEmit` dentro de `mobile/`.
2. `npx expo start --web` dentro de `mobile/` y capturas a 390 px de ancho en claro y en oscuro.
3. Datos difíciles: grupos vacíos, restaurantes sin foto ni categoría y nombres largos.
4. Una ronda de correcciones y, como mucho, una segunda revisión; no pulas en bucle.

Al final de cada plan y de cada entrega, añade la línea **«Skills usadas:»** con las que has cargado de verdad y qué has aplicado de cada una.
