---
name: Mesa
description: Tus sitios, con los tuyos.
colors:
  crema: "#FCFAF7"
  papel: "#FFFFFF"
  chip: "#F1F2ED"
  carbon: "#272924"
  gris-texto: "#687064"
  gris-icono: "#87927E"
  linea: "#E2E4DC"
  borde: "#E8E8E0"
  borde-campo: "#8C9383"
  terracota: "#A6412B"
  terracota-pulsada: "#873421"
  terracota-suave: "#F5E6DD"
  oliva: "#4C5C3C"
  salvia: "#E8EDDF"
  tinte-oliva: "#F1F4EA"
  error: "#AA342A"
  error-suave: "#FCECE6"
  desactivado: "#E5E5DF"
typography:
  screenTitle:
    fontFamily: "Inter"
    fontSize: "27px"
    fontWeight: 600
    lineHeight: "33px"
    letterSpacing: "-0.9px"
  featureTitle:
    fontFamily: "Inter"
    fontSize: "23px"
    fontWeight: 600
    lineHeight: "29px"
    letterSpacing: "-0.65px"
  emptyTitle:
    fontFamily: "Inter"
    fontSize: "25px"
    fontWeight: 600
    lineHeight: "30px"
    letterSpacing: "-0.8px"
  sectionTitle:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "-0.35px"
  cardTitle:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "22px"
    letterSpacing: "-0.1px"
  body:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "21px"
  bodyStrong:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "21px"
  button:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
  buttonSmall:
    fontFamily: "Inter"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: "18px"
  secondary:
    fontFamily: "Inter"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "20px"
  secondaryStrong:
    fontFamily: "Inter"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "20px"
  caption:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "18px"
  label:
    fontFamily: "Inter"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
  tab:
    fontFamily: "Inter"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "14px"
  monogram:
    fontFamily: "Inter"
    fontSize: "56px"
    fontWeight: 600
    lineHeight: "60px"
    letterSpacing: "-1.5px"
  score:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "21px"
rounded:
  xs: "6px"
  sm: "10px"
  md: "12px"
  lg: "15px"
  xl: "18px"
  full: "999px"
spacing:
  s1: "4px"
  s2: "8px"
  s3: "12px"
  s4: "16px"
  s5: "20px"
  s6: "24px"
  s8: "32px"
  gutter: "22px"
components:
  button-primary:
    backgroundColor: "{colors.terracota}"
    textColor: "{colors.papel}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    height: "48px"
  button-primary-pressed:
    backgroundColor: "{colors.terracota-pulsada}"
  button-primary-disabled:
    backgroundColor: "{colors.desactivado}"
    textColor: "{colors.gris-texto}"
  button-secondary:
    backgroundColor: "{colors.salvia}"
    textColor: "{colors.oliva}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
  button-danger:
    backgroundColor: "{colors.error-suave}"
    textColor: "{colors.error}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.papel}"
    rounded: "{rounded.lg}"
    padding: "13px 15px"
  card-featured:
    backgroundColor: "{colors.papel}"
    rounded: "{rounded.xl}"
    padding: "18px"
  status-chip:
    rounded: "{rounded.xs}"
    padding: "4px 7px"
    typography: "{typography.label}"
  search-trigger:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.gris-texto}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "48px"
  tab-selected:
    backgroundColor: "{colors.salvia}"
    textColor: "{colors.oliva}"
    typography: "{typography.tab}"
    rounded: "{rounded.sm}"
---

# Design System: Mesa

Fuente única de verdad visual de la app. Los tokens viven en `mobile/src/theme/` y los
componentes base en `mobile/src/components/ui/`. Si una regla cambia, se cambia primero
aquí y después en el código. Referencia aprobada: el prototipo de
`docs/designs/prototipo/` (`node server.cjs` → http://127.0.0.1:8770; identidad en
`brand.html` y `brand/USO.md`). Las desviaciones respecto al prototipo van marcadas
**[Mejora]** con su motivo.

## Overview

**Creative North Star: «Un lugar para encontrarnos»**

Una identidad tranquila y un producto claro. La lista compartida es el centro de Mesa.
La marca aparece en el encuentro alrededor de una mesa; la interfaz deja el protagonismo
a los sitios, las personas y sus opiniones. Es una app de uso (modo *Operate*): las
convenciones nativas de iOS y Android mandan en estructura, navegación e interacción, y
la marca se expresa en color, tipografía, logotipo y detalle.

| Decisión | Por qué |
|---|---|
| Fondo crema y tarjetas blancas con borde fino | Calidez sin ruido; destaca el contenido. |
| **Terracota** solo para acciones principales | «Guardar», «Aceptar», «Crear». Si es terracota, se puede hacer. |
| **Oliva** para contexto, estados y navegación seleccionada | Recuentos, puntuaciones, pestaña activa. Informa sin competir con la acción. |
| **Salvia** como superficie suave de la oliva | Botones secundarios, avatares sin foto, indicador de pestaña. |
| Una sola familia: **Inter** | Legible en tamaños pequeños, cifras claras; la marca la pone el logotipo. |
| Logotipo «mesa» centrado en la cabecera de Inicio | Presencia discreta; los títulos no compiten con él (no hay serif). |

**Key Characteristics:** crema + terracota + oliva de la marca (no son un cliché a
evitar: son la identidad); contenido antes que decoración; un acento por bloque;
modo claro y oscuro; español, segunda persona del plural para el grupo.

**Logotipo:** siempre los SVG oficiales (`mobile/assets/images/brand/`), nunca texto
con una fuente. Sin estirar, rotar ni sombrear; margen libre mínimo de un arco del
símbolo; marca completa ≥ 110 px, símbolo ≥ 24 px. En la app se usa el wordmark
coloreado con `textPrimary`, así funciona en oscuro.

## Colors

Cálida y contenida: crema y carbón para leer, terracota para actuar, oliva para
informar. Roles semánticos en `mobile/src/theme/palette.ts`; ningún componente usa hex
directos.

### Primary
- **Terracota** (#A6412B, pulsada #873421, suave #F5E6DD): acción principal. Con moderación.

### Secondary
- **Oliva** (#4C5C3C) y **Salvia** (#E8EDDF): contexto, estados, puntuaciones, selección.

### Neutral
- **Crema** (#FCFAF7): fondo. **Papel** (#FFFFFF): tarjetas, buscador, barra de pestañas.
- **Carbón** (#272924): texto principal. **Gris texto** (#687064): secundario y placeholders.

### Roles — modo claro

| Rol | Valor | Uso |
|---|---|---|
| `background` | `#FCFAF7` | Fondo de pantalla |
| `surface` | `#FFFFFF` | Tarjetas, buscador, barra de pestañas |
| `surfaceSecondary` | `#F1F2ED` | Chips inactivos, skeleton, fila pulsada |
| `surfaceElevated` | `#FFFFFF` | Hojas y menús |
| `textPrimary` | `#272924` | Texto principal |
| `textSecondary` / `textTertiary` | `#687064` | Secundario, placeholders, pestañas inactivas **[Mejora]** |
| `iconMuted` | `#87927E` | Iconos decorativos (≥ 3:1) |
| `separator` | `#E2E4DC` | Líneas finas |
| `border` | `#E8E8E0` | Contorno de tarjetas y buscador |
| `borderInput` | `#8C9383` | Contorno de campos editables (≥ 3:1) |
| `accent` / `accentPressed` / `accentSoft` | `#A6412B` / `#873421` / `#F5E6DD` | Acción principal |
| `onAccent` / `onAccentSoft` | `#FFFFFF` / `#873421` | Texto sobre terracota / terracota suave |
| `accentDisabled` | `#E5E5DF` | Botón principal desactivado |
| `secondary` / `rating` | `#4C5C3C` | Oliva: contexto, estados, puntuaciones |
| `secondarySoft` / `onSecondarySoft` | `#E8EDDF` / `#4C5C3C` | Salvia y su texto (siempre oliva) |
| `tint` | `#F1F4EA` | Relleno de etiquetas oliva |
| `danger` / `dangerSoft` | `#AA342A` / `#FCECE6` | Errores y acciones destructivas |
| `overlay` | `rgba(39,41,36,0.40)` | Velo de modales |

### Roles — modo oscuro **[Mejora — el prototipo no lo tiene]**

Negros con un leve matiz oliva para reconocer la identidad de noche. Los acentos se
aclaran (no se invierten) y el texto sobre terracota pasa a casi negro.

| Rol | Valor | Rol | Valor |
|---|---|---|---|
| `background` | `#141612` | `accent` | `#E27A5F` |
| `surface` | `#1D201B` | `accentPressed` | `#CC6650` |
| `surfaceSecondary` | `#262A23` | `accentSoft` | `#3B271F` |
| `surfaceElevated` | `#2A2E27` | `onAccent` | `#1E0F0A` |
| `textPrimary` | `#ECEEE6` | `onAccentSoft` | `#F2B7A3` |
| `textSecondary` / `textTertiary` | `#A7AE9E` | `secondary` / `rating` | `#B4C59D` |
| `iconMuted` | `#7E8576` | `secondarySoft` | `#2B3424` |
| `separator` | `#33382F` | `onSecondarySoft` | `#C7D6B2` |
| `border` | `#2E3229` | `tint` | `#232920` |
| `borderInput` | `#6E7566` | `danger` / `dangerSoft` | `#FFAA9E` / `#3D1814` |

### Estados del restaurante

Siempre icono **y** texto. Texto / fondo:

| Estado | Icono | Claro | Oscuro |
|---|---|---|---|
| Queremos ir | cubiertos | `#8D553A` / `#F4E8DE` | `#E8B79A` / `#3A2A20` |
| Visitado | check | `#4E633D` / `#E8EDDF` | `#B4C99D` / `#263021` |
| Favorito | corazón | `#A6412B` / `#F5E6DD` | `#F0A99A` / `#3B221D` |
| Queremos repetir | repetir | `#4E633D` / `#E8EDDF` | `#B4C99D` / `#263021` |
| No repetir | cruz | `#A23D32` / `#FAE7E2` | `#F0A99A` / `#3B1E1A` |
| Archivado | archivo | `#5E655A` / `#EAEBE6` **[Mejora]** | `#B9BDB1` / `#2A2D27` |

El prototipo trata Favorito como un corazón aparte; en la app toma el par terracota suave.

### Contraste (WCAG 2.2 AA, verificado)

- Todo el texto sobre `background`, `surface`, `surfaceSecondary` y `surfaceElevated`
  ≥ 4,5:1 en ambos modos; también sobre acento, salvia, `tint` y los pares de estado.
- `iconMuted` y `borderInput` ≥ 3:1.
- **[Mejora]** Cuatro grises del prototipo bajaban de 4,5:1 (`#74796E`, `#737B69`,
  `#77756E` y Archivado `#687064` sobre `#EAEBE6`). Se unifican en `#687064` (5,13) y
  Archivado pasa a `#5E655A`.

### Named Rules
**The One Action Rule.** Terracota marca la única acción principal de cada bloque. Si
no se puede pulsar, no es terracota.

**The Olive-on-Sage Rule.** Sobre salvia el texto va en oliva, nunca en gris
(`textSecondary` sobre salvia da 4,31:1).

**The Never-Alone Rule.** El color nunca comunica solo: estado = icono + texto.

## Typography

**Body Font:** Inter (`@expo-google-fonts/inter`: 400, 500, 600, 700). Una sola familia.

**Character:** neutra y muy legible; deja la personalidad al logotipo y al color.
El prototipo usa Inter variable; en la app 550 → 500 y 600–650 → 600. El peso se elige
con `fontFamily`, nunca con `fontWeight`. Tokens en `mobile/src/theme/typography.ts`
(tamaños y tracking en el encabezado de este archivo).

### Hierarchy
- **screenTitle** (600, 27/33): «Hola, Paula».
- **emptyTitle** (600, 25/30) y **featureTitle** (600, 23/29): estados vacíos y tarjeta destacada.
- **sectionTitle** (600, 18/24) y **cardTitle** (600, 16/22): secciones y nombres de grupo.
- **body / bodyStrong** (400 / 600, 14/21): lectura, actividad, nombres dentro de frases.
- **button / buttonSmall** (600, 14/20 · 13/18).
- **secondary / secondaryStrong** (400 / 500, 13/20): metadatos, enlaces, selector de ciudad.
- **caption** (400, 12/18), **label** (500, 12/16) y **tab** (500, 11/14) **[Mejora: 11 → 12 y 10 → 11; Material pide 12 sp en etiquetas]**.
- **monogram** (600, 56/60): inicial de la portada tipográfica. **score** (600, 14/21, cifras tabulares).

### Named Rules
**The System Size Rule.** El tamaño de texto del sistema siempre está activo.
`maxFontSizeMultiplier` 1,3 en pestañas y etiquetas compactas, 1,6 en títulos y sin
límite en lectura. Con `fontScale > 1,3` las filas se apilan y la portada tipográfica se
oculta. Las cifras usan coma decimal («4,5»).

## Layout

Una columna, móvil primero. Escala `space` (`mobile/src/theme/tokens.ts`):
`4 · 8 · 12 · 16 · 20 · 24 · 32`. **Margen de pantalla 22** (16 en pantallas
< 340 pt). Zona táctil mínima **44 pt** en todo lo pulsable (`textActionHitSlop` para
enlaces de texto).

Ritmo de Inicio (del prototipo):

| Tramo | Espacio |
|---|---|
| Cabecera → título | 6 |
| Título → línea de ciudad | 6 |
| Línea de ciudad → buscador | 8 |
| Buscador → invitación | 16 |
| Bloque → sección | 28 |
| Título de sección → texto de sección | 4 |
| Texto de sección → contenido | 12 |
| Entre tarjetas de grupo | 8 |

## Elevation & Depth

Plano por defecto: la profundidad viene de superficie + borde fino, no de sombras.

### Shadow Vocabulary
- **Destacada** (`0 4px 15px rgba(39,41,36,0.03)`): solo la tarjeta destacada, en claro.

### Named Rules
**The Flat Night Rule.** En oscuro ninguna tarjeta lleva sombra; se separan por
superficie y borde. Las listas sobre el fondo (actividad) no llevan contenedor: solo
separadores de 1 px `separator`.

## Shapes

Esquinas suaves y continuas: todo radio usa `borderCurve: 'continuous'`.

| Token | Valor | Uso |
|---|---|---|
| `xs` | 6 | Estados y etiquetas |
| `sm` | 10 | Botones, miniaturas, indicador de pestaña |
| `md` | 12 | Buscador, campos, invitación |
| `lg` | 15 | Tarjetas |
| `xl` | 18 | Tarjeta destacada, tarjeta de primer uso |
| `full` | 999 | Avatares, botón Añadir |

Bordes de 1 px `border` en tarjetas y buscador; `borderInput` en campos editables.

**Iconos:** SF Symbols (iOS) y Material Symbols (Android) con `SymbolView`. Tamaños
(`iconSize`): 12 estados, 14–16 enlaces y chevrons, 18 buscador, 22 pestañas y
cabecera, 30 estados de pantalla.

## Components

Viven en `mobile/src/components/ui/`. Todos aceptan `style` (para layout, al final),
responden al pulsar y exponen rol y estado de accesibilidad.

### Buttons (`Button`)
- **Shape:** radio `sm` (10), 46–52 de alto.
- **primary:** terracota, texto blanco. Una por bloque.
- **secondary:** salvia, texto oliva («Ver mapa»).
- **danger:** `dangerSoft`, texto `danger`.
- **text · accent:** solo texto terracota para crear o cambiar («Crear», «Otro sitio», «Aceptar»).
- **text · secondary:** solo texto oliva para navegar («Ver todos los grupos»).
- **Estados:** pulsado `accentPressed` (o atenuado); desactivado `#E5E5DF` / `textSecondary`
  en primary y opacidad 0,4 en el resto; cargando con spinner sin cambiar el ancho.

### Respuesta al pulsar (`PressableCard`) **[Mejora]**
El prototipo solo define `:hover`. En la app: `android_ripple` en Android, atenuado en
iOS y escala al 98 % en tarjetas grandes.

### Cards / Containers (`PressableCard`)
- `surface`, borde `border`, radio `lg` (15), padding 13 × 15.
- Destacada: radio `xl` (18), sombra «Destacada», padding 18.

### Chips — estado del restaurante (`StatusChip`)
- Radio 6, padding 4 × 7, icono 12 + texto `label`, colores de «Estados del restaurante».

### Puntuación (`RatingBadge`)
Oliva: estrella rellena + cifra (`score`) y opcional «· N valoraciones» en
`textSecondary`. Sin valoraciones: «Aún sin valoraciones» o «Pendiente de probar» con
cubiertos sin relleno.

### Avatares (`Avatar`, `AvatarStack`)
Foto, o inicial en oliva sobre salvia (nunca «?»). Pila: hasta 3 de 25–28 px solapados
−7, borde de 2 px del color de la superficie, más «+N»; etiqueta accesible «N miembros».
Persona desconocida: icono del evento sobre salvia y el texto «Un miembro».

### Portada tipográfica (`RestaurantCover`) **[Mejora — restaurantes sin foto]**
Nunca fotos genéricas que simulen la comida del sitio. Portada de 132 pt con uno de
cuatro tonos elegido de forma estable por el nombre, la inicial (`monogram`) en la tinta
del tono y el icono del tipo de local (cubiertos, taza o copa según `category`).

| Tono | Claro (fondo / tinta) | Oscuro (fondo / tinta) |
|---|---|---|
| Salvia | `#E8EDDF` / `#4C5C3C` | `#2B3424` / `#B4C59D` |
| Terracota suave | `#F5E6DD` / `#A6412B` | `#3B271F` / `#E8A48E` |
| Arena | `#F1ECE3` / `#8D553A` | `#332C24` / `#E2BC97` |
| Bruma | `#EEF1E8` / `#4C5C3C` | `#242A21` / `#B4C59D` |

Con texto muy grande se oculta. Con foto real, la foto la sustituye (164–206 pt).

### Invitación pendiente (`HomeInvitationMessage`)
Superficie blanca, borde, radio 12, padding 13 × 14. Foto o inicial del remitente (32),
«**Carlos** te ha invitado al grupo **Viaje a San Sebastián**.», estado
«Invitación pendiente · N» (`label`, sobre en oliva) y acciones de texto **Aceptar**
(terracota) y **Ver invitación** (oliva).

### Cabecera de sección (`SectionHeader`)
`sectionTitle`, texto opcional debajo (`secondary`, `textSecondary`) y como mucho un
enlace a la derecha (terracota si crea o cambia, oliva si navega).

### Inputs / Fields — buscador (disparador)
Blanco, borde `border`, radio 12, 48 de alto, lupa 18 en oliva, texto `body` en
`textTertiary`. Los campos editables usan `borderInput`.

### Estados de pantalla (`EmptyState`)
Círculo salvia de 72 con icono oliva de 30, título 23/600, texto 14 en `textSecondary`
(máx. 280 de ancho) y acción `primary`. Variante compacta sin círculo para secciones.

### Navigation — barra de pestañas
Blanca (`surface`), línea superior `separator`. Inactivas en `textTertiary`; la
seleccionada en oliva sobre pastilla salvia (radio 10) con etiqueta en 600. «Añadir» es
un círculo terracota con el «+» en `onAccent`. Inicio · Grupos · Añadir · Mapa · Perfil.

### Patrones nativos **[Mejora]**
- **Hojas:** los selectores (p. ej. ciudad de Inicio) son hojas nativas de `@expo/ui`
  (BottomSheet), no diálogos web. Para controles nativos (hojas, pickers, switches,
  menús) se usa `@expo/ui`; Reanimated queda para movimiento propio de la app.
- **Lectores de pantalla:** cada tarjeta tiene etiqueta completa; los cambios que
  provoca el usuario («Otro sitio») se anuncian; lo decorativo se oculta.
- **Abrir en mapas:** con coordenadas, «Ver mapa» abre la app de mapas; sin ellas,
  «Ubicación pendiente».

### Modo claro y oscuro
`useTheme()` (`mobile/src/theme/use-theme.ts`) devuelve `{ scheme, colors, status,
elevation, cover }`. Estilos con `createThemedStyles((theme) => ({ … }))`, calculados
una vez por modo. La barra de estado sigue al modo. `app.json` mantiene
`userInterfaceStyle: "light"` hasta que todas las pantallas estén migradas; para revisar
en oscuro: `EXPO_PUBLIC_COLOR_SCHEME=dark npx expo start` (solo desarrollo).

### Reglas de contenido
- **Fechas** relativas en español (`lib/relative-time.ts`): «Hace 2 h», «Ayer», «Hace 3 días».
- **Metadatos** separados por « · », con espacios duros dentro de cada segmento.
- **Actividad** sin duplicados: la última valoración o cambio por persona y restaurante (`lib/activity.ts`).
- **Recomendaciones:** nunca «No repetir» ni «Archivado».
- Segunda persona del plural para el grupo («Vuestros restaurantes», «Guardad»).

## Do's and Don'ts

### Do:
- **Do** usar siempre tokens de `mobile/src/theme/` (`useTheme`, `space`, `radius`, `typography`).
- **Do** diseñar los estados normales de Mesa: sin foto, sin categoría, sin ubicación,
  sin valoraciones, grupo vacío, nombres largos y sin conexión.
- **Do** revisar cada pantalla a 390 pt en claro y en oscuro antes de darla por buena.
- **Do** respetar los patrones nativos de cada plataforma (gesto de volver, hojas, hápticos).

### Don't:
- **Don't** usar hex directos en componentes ni `theme/colors.ts` / `theme/layout.ts` (obsoletos).
- **Don't** usar terracota para algo que no sea una acción, ni dos acciones terracota en un bloque.
- **Don't** escribir el logotipo con una fuente, ni introducir otra familia tipográfica o un serif.
- **Don't** mostrar fotos de stock como si fueran del local, ni inventar cifras, reseñas o «el mejor valorado».
- **Don't** sustituir la paleta de la marca por otra aunque una skill la considere «genérica».

### Migración pendiente

| Pantalla | Estado |
|---|---|
| Inicio | Migrada |
| Barra de pestañas | Migrada |
| Resto | Pendiente (usan `theme/colors.ts` y `theme/layout.ts`) |

Pendiente también: sustituir `getRestaurantFallbackImage` en la ficha del restaurante
por la portada tipográfica y unificar los textos de estado («Queremos ir» en la app
frente a «Quiero ir» en `PRODUCT.md`).
