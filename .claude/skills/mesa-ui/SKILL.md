---
name: mesa-ui
description: Sistema de diseño y reglas de UI/UX de Mesa (dirección Sobremesa). Úsala SIEMPRE antes de crear, rediseñar, pulir o revisar cualquier pantalla o componente de mobile/ (React Native + Expo), y cuando la usuaria diga que algo "no se ve profesional".
---

# Mesa UI — dirección Sobremesa

## Por qué existe esta skill

Diagnóstico (octubre 2026): `mobile/src/theme/` ya define colores, espaciado y radios, pero el código los ignora. Había ~197 colores hex distintos escritos a mano, más de 10 tamaños de letra (de 8 a 17 px, muchos ilegibles) y radios de 14, 15, 16, 17, 18, 19, 20, 22... Además, se fueron creando copias de componentes (`*Refined`, `*Polished`, `*Tuned`, `*Enhanced`) en vez de mejorar el original.

Esa deriva es la causa principal de que la app "no parezca profesional": un diseño profesional es, sobre todo, **consistencia**. Regla de oro: **ningún valor visual suelto; todo sale de `src/theme`.**

## Fuentes de verdad

- Tokens: `mobile/src/theme/colors.ts`, `fonts.ts`, `layout.ts` (`spacing`, `radii`, `touchTargets`, `shadows`).
- Referencia visual aprobada: `docs/designs/mesa-sobremesa-preview.png` y los SVG por pantalla en `docs/designs/`.
- Contexto de producto: `PROJECT_CONTEXT_MESA.md` y `docs/MESA_PRODUCT_UX_REVIEW.md`.
- Si hace falta un valor que no existe, se añade al tema con un nombre semántico (`colors.ratingStar`, no `colors.orange2`). Nunca inline.

## Reglas

### Color
- Solo `colors.*`. Prohibido escribir hex, `rgb()` o `rgba()` en componentes, pantallas y `*.styles.ts`.
- Contraste mínimo 4,5:1 para texto normal. El `colors.primary` actual (`#C9684E`) da 3,77:1 con texto blanco; el login ya usa `#A6412B` (6,15:1). Unificar en el tema es una decisión de marca: **pregunta a la usuaria antes de cambiar `primary`**.
- Un único acento fuerte por pantalla (terracota). Oliva para apoyo y estados positivos. Fondos crema; nada de colores saturados nuevos.

### Tipografía (escala cerrada)
| Token | Tamaño / interlineado | Uso |
| --- | --- | --- |
| display | 30 / 36 | Título principal de pantalla (máx. 1 por pantalla) |
| title | 24 / 30 | Nombre de grupo o restaurante en su detalle |
| headline | 20 / 26 | Títulos de sección |
| bodyLarge | 17 / 24 | Nombre en filas de lista |
| body | 16 / 22 | Texto general, inputs, botones |
| secondary | 14 / 20 | Metadatos (ciudad, cocina, contadores) |
| caption | 12 / 16 | Etiquetas, chips, fechas. **Nunca por debajo de 12** |

- Si `src/theme/typography.ts` aún no existe, créalo la primera vez que toques una pantalla y migra a él (con `fonts.*` para los pesos).
- Pesos: 400 cuerpo, 500 metadatos destacados, 600 títulos y botones. 700 solo para cifras (puntuaciones).
- No uses `allowFontScaling={false}`. Diseña para que el texto escale: `numberOfLines` donde tenga sentido, filas que crecen en alto, nada de alturas fijas en contenedores de texto.

### Espaciado, forma y profundidad
- Solo `spacing.*` (4, 8, 12, 16, 20, 24, 32, 40). Margen lateral de pantalla: `spacing.lg` (20). Separación entre secciones: `spacing.xxl` (32).
- Solo `radii.*`: chips y avatares `round`; botones e inputs `sm`; tarjetas `md`; hojas modales y banners `xl`.
- Sombras: solo `shadows.card` y `shadows.floating`. En listas, mejor separadores o borde `colors.border` que sombras.
- Zonas táctiles ≥ `touchTargets.minimum` (44). Usa `hitSlop` si el elemento visual es más pequeño.

### Componentes y estructura
- Reutiliza antes de crear: `PrimaryButton`, `FormField`, `GroupDetailPrimitives`, `GroupsPrimitives`, etc. Busca con grep antes de escribir un componente nuevo.
- **Prohibido crear variantes con sufijo `Refined`, `Polished`, `Tuned`, `Enhanced`, `V2`, `New`.** Se mejora el componente existente. Si ya hay dos versiones, consolida en una, actualiza los imports y deja la vieja sin uso (borrar solo con permiso de la usuaria).
- Una acción principal por pantalla (botón terracota). El resto, secundarias (borde o texto).
- Cada pantalla con datos tiene sus 4 estados: carga (skeleton con la forma del contenido, no un spinner a pantalla completa), vacío (explica y ofrece la acción), error (mensaje humano + "Reintentar"), contenido.
- Sin fotos genéricas que parezcan del local: monograma o ilustración de marca.
- Textos en español natural, tuteando, sin jerga técnica. Botones con verbo: "Añadir restaurante", no "Aceptar".

### Sensación nativa
- Safe areas con `react-native-safe-area-context`; respeta la barra de gestos.
- Iconos coherentes de una sola familia; en iOS se pueden usar SF Symbols con `expo-symbols`.
- Feedback al pulsar (opacidad en iOS, ripple en Android) y háptica ligera solo en acciones que confirman algo (guardar, valorar, favorito).
- Animaciones cortas (150–250 ms) con Reanimated; nunca bloquean la interacción.
- Para detalles de implementación consulta las skills `expo-native-ui`, `expo-design-system`, `expo-animation` (plugin Expo) y `vercel-react-native-skills`.

## Flujo de trabajo (una pantalla o flujo cada vez)

1. Auditoría: `node .claude/skills/mesa-ui/scripts/audit.mjs mobile/src/<ruta>` para ver valores sueltos.
2. Lee la pantalla y sus componentes; compárala con la referencia visual. Si puedes, pide a la usuaria una captura del estado actual en el móvil.
3. Si el cambio es grande, presenta un plan breve (qué cambia y por qué) antes de editar.
4. Migra a tokens y aplica las reglas. No toques lógica, rutas ni llamadas a la API salvo que sea necesario.
5. `npx tsc --noEmit` dentro de `mobile/`.
6. Repite la auditoría: los archivos tocados deben quedar en 0 avisos.
7. Termina con instrucciones de prueba manual en iOS y Android: texto grande del sistema, nombres largos, sin conexión, lista vacía.
