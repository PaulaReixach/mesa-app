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
    fontFamily: "Figtree"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: "36px"
    letterSpacing: "-1px"
  featureTitle:
    fontFamily: "Figtree"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: "42px"
    letterSpacing: "-1.4px"
  emptyTitle:
    fontFamily: "Figtree"
    fontSize: "36px"
    fontWeight: 800
    lineHeight: "39px"
    letterSpacing: "-1.2px"
  sectionTitle:
    fontFamily: "Figtree"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: "28px"
    letterSpacing: "-0.5px"
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

**Display Font:** Figtree 800 (`@expo-google-fonts/figtree`), solo en `screenTitle`, `featureTitle`, `emptyTitle`, `sectionTitle` y monogramas: sus terminales redondeados casan con el logotipo.
**Body Font:** Inter (`@expo-google-fonts/inter`: 400, 500, 600, 700) para todo lo demás.

**Character:** títulos cálidos y con presencia (Figtree); lectura neutra y muy legible (Inter). Aprobado en Inicio v2 (oct. 2026).
El prototipo usa Inter variable; en la app 550 → 500 y 600–650 → 600. El peso se elige
con `fontFamily`, nunca con `fontWeight`. Tokens en `mobile/src/theme/typography.ts`
(tamaños y tracking en el encabezado de este archivo).

### Hierarchy
- **screenTitle** (Figtree 800, 32/36): «Hola, Paula».
- **featureTitle** (Figtree 800, 40/42, máx. 3 líneas) y **emptyTitle** (Figtree 800, 36/39): sitio del día y bienvenida.
- **sectionTitle** (Figtree 800, 22/28) y **cardTitle** (600, 16/22): secciones y nombres de grupo.
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

### Portada (`Cover`) **[Mejora — restaurantes sin foto]**
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

### Lista agrupada (`GroupedList`, `GroupedRow`)
Bloques cortos de ajustes y formularios (no para listas largas). Título opcional encima
(`secondaryStrong`, `textSecondary`), bloque `surface` con borde `border` y radio `lg`,
separador de 1 px `separator` con sangría de 16 y una línea de pie (`caption`). Filas ≥ 52:
- `link`: título, detalle opcional debajo, valor en `textSecondary` y chevron 14 `iconMuted`.
- `field`: etiqueta de 84 dentro de la fila y el campo a su lado; `multiline` (mín. 96) sin
  etiqueta visible. Con error: etiqueta y marcador en `danger` y el mensaje debajo (se anuncia).
- `switch`: `Switch` de `@expo/ui`; el texto que explica un desactivado nunca se atenúa.
- `action`: texto centrado `danger` (o `accent`), en su propio bloque.
Pulsado: ripple en Android y `surfaceSecondary` en iOS.

### Piezas compartidas de pantalla
- **`Cover`**: además de la portada tipográfica, `photoUrl` (foto con velo inferior 0 → 45 %),
  `shape="header"` (encabezado ancho 176, radio 24), `kind="group"` (icono de personas) y un hueco
  abajo a la derecha para «Añadir foto» o «1/N».
- **`ModalSheet`**: cuerpo de una ruta modal. Barra Cancelar (oliva) · título (`cardTitle`) ·
  Guardar (`accent` 600; desactivado en `textSecondary`; spinner al guardar). Con cambios sin
  guardar, Cancelar pregunta «¿Descartar los cambios?».
- **`SegmentedControl`**: pista `surfaceSecondary` radio 12, selección `surface` con sombra
  (oscuro: `separator`), punto `accent` de novedades; `radiogroup`. Se dibuja en React Native y no
  con `@expo/ui` porque el control nativo no admite el punto ni los tonos oscuros.
- **`FilterChips`**: fila deslizable de opción única con número, píldoras `surfaceSecondary`; activa
  `secondary` con texto `background`; fundido en el borde derecho.
- **`SearchField`**: disparador (borde `border`) o editable (borde `borderInput`, botón «Borrar
  búsqueda»).
- **`confirmAlert` / `confirmDiscard`**: alerta nativa Cancelar · acción destructiva.
- **`ToastProvider` / `useToast`**: aviso inferior carbón (oscuro: `surfaceElevated`), `role="status"`,
  anunciado, una acción opcional («Ver», «Deshacer»); 4 s, 6 s con acción.

### Inputs / Fields — buscador (disparador)
Blanco, borde `border`, radio 12, 48 de alto, lupa 18 en oliva, texto `body` en
`textTertiary`. Los campos editables usan `borderInput`.

### Estados de pantalla (`EmptyState`)
Círculo salvia de 72 con icono oliva de 30, título 23/600, texto 14 en `textSecondary`
(máx. 280 de ancho) y acción `primary`. Variante compacta sin círculo para secciones.

### Navigation — barra de pestañas
Fija abajo y a todo el ancho: blanca (`surface`), sin radio, línea superior de 1 px `border`;
nunca flotante. Cinco pestañas iguales (icono 22–24 + etiqueta `tab`): Inicio · Grupos ·
Añadir · Mapa · Perfil. Inactivas en `textSecondary`; la seleccionada en oliva con icono
relleno sobre pastilla salvia 56×32 (radio 16). «Añadir» no sobresale ni cambia de tamaño:
icono de cuadrado redondeado 26 (radio 8,5) relleno de `accent` con el «+» en `onAccent` y
etiqueta en `accent` 600. En oscuro, los mismos roles. Iconos SVG del lienzo en `assets/images/icons` pintados con `expo-image` (`components/ui/MesaIcons`; sin `react-native-svg`, que no está en el build de desarrollo).

### Entrar («Una sola puerta», aprobado en oct. 2026)
- **Idea.** No se elige entre «Crear cuenta» e «Iniciar sesión»: se entra con Apple, Google o
  correo y Mesa decide. Una pregunta por pantalla, el teclado abierto y la acción encima de él.
  Desaparece el error «este correo ya está registrado».
- **Backend.** Hoy existen registro (Nombre ≤100, usuario 3–50 único, correo único, contraseña
  8–72) e inicio de sesión (correo o usuario + contraseña). **Pendiente antes de publicar:** Apple
  y Google (van juntos: la App Store exige Apple si se ofrece Google), comprobar si un correo
  tiene cuenta, comprobar si un usuario está libre, recuperar contraseña y los textos legales.
- **Rutas.** Pila `(auth)`: `onboarding` (bienvenida) → `login` (correo; `GET /auth/lookup`) → `password` (ya tiene cuenta) o `register` (`GET /auth/username-availability`)
  (cuenta nueva); Apple/Google nuevos → `username`. Al terminar, `replace` a «Tu primer grupo»
  (sin vuelta atrás) o a Inicio si ya tenía cuenta.
- **1 · Bienvenida.** Foto propia de una mesa compartida (cenital, sin caras posando; nunca stock)
  en los 476 de arriba, con velo superior para el logo blanco oficial (116) y fundido a
  `background`. Tarjeta de ejemplo decorativa («Cenas de los viernes · Tú, Ana y Lucas · 12
  sitios» con iniciales). «Los buenos sitios se comparten.» (Figtree 800, 36) y «Guarda, decide y
  valora con tu gente.». Tres botones píldora de 50: «Continuar con Apple» (negro; en oscuro,
  blanco), «Continuar con Google» (`surface` con borde y la G oficial) y «Continuar con correo»
  (secundario salvia con sobre). Debajo, «Al continuar aceptas las **Condiciones** y la
  **Privacidad**.» (12, enlaces oliva).
- **Pantallas de paso.** «‹» a la izquierda y el símbolo (24) centrado; título `big` (32) y una
  línea `textSecondary`; campos de 52 con etiqueta visible; botón `accent` anclado encima del
  teclado.
- **2 · Tu correo.** «¿Cuál es tu correo?» / «Si ya tienes cuenta, entrarás. Si no, la creamos en
  un momento.». Un campo con teclado de email y la ayuda «También puedes escribir tu nombre de
  usuario.». «Continuar».
- **3a · Ya tienes cuenta.** Inicial (56, `accentSoft`), «Hola de nuevo, Nombre», el correo con
  «Cambiar», Contraseña (ojo de 44) y «¿Has olvidado tu contraseña?» (texto oliva, 44). «Entrar».
- **3b · Cuenta nueva.** «Crea tu cuenta» / «Es tu primera vez con correo. **Cambiar**». Solo
  Nombre, Nombre de usuario (sugerido a partir del nombre, «@» oliva y «✓ Disponible» al
  comprobarlo; «Con él te encontrará e invitará tu gente.») y Contraseña («Al menos 8
  caracteres» pasa a oliva con check). Pie fijo «Crear cuenta».
- **3c · Con Apple o Google.** Solo «Elige tu nombre de usuario» («Hola, Nombre. Con él te
  encontrará e invitará tu gente.»), sugerido y comprobado; «Puedes cambiarlo cuando quieras desde
  tu perfil.». «Continuar».
- **4 · Tu primer grupo.** Sin «‹»; «Ahora no» arriba a la derecha (lleva a Inicio, Primer uso).
  «Hola, Nombre», «Crea tu primer grupo: una lista compartida con tus sitios y los de tu gente.»,
  portada viva que es un botón entero («Añadir foto de portada»; píldora «Añadir foto» o, con
  foto, velo y «Cambiar foto» translúcido), «Nombre del grupo», segmentado `Privado · Público` con candado y globo, «Solo las personas que invites verán el grupo y sus sitios.» y el
  mismo bloque que «Crear un grupo»: Invitar, Ciudad y Descripción («Opcional ›»). Es esa misma
  pantalla a pantalla completa, con «Ahora no» en lugar de «×». «Crear grupo» sigue en «Crear un grupo › Grupo creado».
- **Formularios (accesibilidad).** `autoComplete`/`textContentType`: nombre `name`/`name`;
  usuario `username-new`/`username` (en login, `username`); email `email`/`emailAddress` con
  teclado de email; contraseña `new-password`/`newPassword` con `passwordRules="minlength: 8;
  maxlength: 72;"` en registro y `password`/`password` en login. Sin autocorrección ni
  mayúsculas automáticas en usuario, email y contraseña. `returnKeyType` «siguiente» entre campos
  y «hecho»/enviar en el último. Cada campo lleva `accessibilityLabel` igual a su etiqueta; los
  errores se anuncian (`accessibilityLiveRegion`/anuncio) y el foco va al primer campo con error.
  Las etiquetas y textos usan los estilos de texto que escalan; nada se corta.
- **Casos difíciles.** Contraseña incorrecta: error en el propio campo («La contraseña no es
  correcta. Vuelve a intentarlo.»), que se vacía y conserva el foco. Usuario en uso: «@nombre ya está
  en uso. Prueba con uno de estos:» y tres chips libres. Contraseña débil: «Necesita al menos 8
  caracteres. Llevas N.» al salir del campo o al enviar. Sin conexión: aviso `dangerSoft` sobre el
  botón, el correo se conserva y el botón pasa a «Reintentar». Foto y nombre largo: velo sobre la foto,
  saludo y portada en dos líneas y el campo crece. Letra grande: todo se recoloca y nada se corta.
- **Oscuro.** Roles oscuros habituales; Apple pasa a blanco, Google a `surface` con su G intacta y
  el correo a salvia oscuro; la foto se funde en `background` `#141612`, el logo sigue
  en blanco, campos sobre `surface` con `borderInput` `#6E7566`, activo con borde `#B4C59D` y
  botón con texto `onAccent`.

### Inicio v2 (aprobado en oct. 2026)
- **Sitio del día** (`featureTitle`): tarjeta de 384 px, radio 30. Foto con desenfoque de 3 px y velo
  carbón de arriba (30 %) a abajo (90 %), texto blanco. Sin foto: fondo `accent` con el símbolo grande
  en un tono apenas más claro. Arriba, chip translúcido «Un sitio para hoy» con el símbolo y el
  `StatusChip`; abajo, barrio/categoría, nombre, avatares de quien quiere ir, «Ver restaurante»
  (`accent`, píldora de 52) y «Otro sitio» (translúcido).
- **Tus grupos**: fila horizontal de círculos de 72 (portada, caras o monograma). Aro `accent` +
  contador = novedades sin ver (`unseenCount` de `GET /groups`): lo que otras personas han hecho desde la
  última vez que abriste el grupo (añadir, valorar o cambiar el estado de un sitio, y que entre alguien);
  no cuentan lo tuyo, las salidas ni las invitaciones. Abrir el grupo lo pone a cero
  (`POST /groups/{id}/seen`); a partir de 10 se muestra «9+». Sin novedades, nombre en `textSecondary`; nombre en 2 líneas como máximo; al final, «Nuevo grupo» con borde
  discontinuo.
- **Valorar después de ir**: tarjeta con miniatura, «¿Qué tal en …?», 5 estrellas de 48 (SVG del lienzo, `StarIcon`) y «Guardar»; una «×» la oculta hasta la próxima vez que se abre la app.
- **Lo último de tu gente**: un solo bloque `surface` (radio 24) con filas: miniatura de 60 del sitio
  con la cara de la persona superpuesta (28), frase «**Persona** acción **Sitio**», grupo y tiempo, y a
  la derecha nota, estado o favorito. Separadores de 1 px con sangría.
- **Sin grupos**: tarjeta `accent` «Monta tu primera mesa» (`emptyTitle`) con «Crear un grupo» y
  «Tengo un enlace de invitación», y debajo «Así funciona Mesa» en 3 pasos.
- **Oscuro**: las tarjetas terracota (Sitio del día, Monta tu primera mesa) usan el terracota profundo
  `#873421` con texto blanco; el `accent` claro del modo oscuro no da contraste con blanco.
- **Pendiente de backend**: foto de los sitios (la tarjeta va siempre en terracota con el símbolo),
  y quién quiere ir (se muestra quién lo guardó).

### Cabecera al deslizar (todas las pestañas)
En reposo, sin línea ni fondo: se funde con `background`. Al deslizar queda fija con fondo
crema translúcido (`background` al 80 %, desenfoque 20 px), línea inferior de 1 px (carbón al
8 %; blanco al 8 % en oscuro) y sombra suave `0 8px 18px -10px` (carbón al 22 %). En Grupos el
título grande pasa a título centrado (Figtree 800, 17). Las pestañas principales no llevan
flecha atrás: la flecha solo aparece al entrar en un detalle.

### Grupos (opción C «Escaparate», aprobada en oct. 2026)
- **Cabecera**: `screenTitle` «Grupos»; a la derecha, campana (44) y «Crear» (píldora `accent` de
  40 con «+»). Debajo, buscador y filtros Todos · Privados · Públicos (chip activo en oliva con
  texto crema; en oscuro, oliva claro con texto oscuro), 25 px por encima de los filtros.
- **Con novedades**: carrusel horizontal de tarjetas de 300×236 (radio 28) con la misma foto
  desenfocada y velo que el sitio del día, chip translúcido «N novedades», nombre (Figtree 800,
  28, máx. 2 líneas), caras y «X sitios, Y por probar». Sin foto: fondo `accent` con el símbolo.
  Solo aparece si algún grupo tiene novedades.
- **Todos tus grupos**: un bloque `surface` (radio 24) con filas de portada 48 (radio 14), nombre
  (máx. 2 líneas), «Privado/Pública, N personas» y chevron; separadores con sangría.
- **Siguiendo**: círculos de 64 con nombre debajo y «Descubrir» con borde discontinuo; sin listas
  seguidas, una fila suave que invita a explorar.
- **Sin grupos**: tarjeta `accent` «Los buenos planes empiezan en grupo» (caras + «+»), «Crear
  un grupo» y «Tengo un enlace de invitación»; debajo, «Para inspirarte» con listas públicas.

### Detalle de grupo (opción A «Portada», aprobada en oct. 2026)
- **Portada** de 360: foto del grupo **nítida** (sin desenfoque) con el velo carbón de arriba (38 %)
  a abajo (90 %). Encima, botones translúcidos de 44 (atrás; compartir y el engranaje de «Ajustes
  del grupo», que sustituye al «…»). Abajo, chip
  translúcido «Privado»/«Pública» y, si hay novedades, «N novedades» (abre Actividad); nombre
  (Figtree 800, 34/37, máx. 3 líneas), caras (26, «+N») y «N miembros · N sitios» (tocar las caras
  abre Miembros). Sin foto: fondo `accent` con el símbolo grande en un tono apenas más claro.
- **Hoja** crema que monta 28 sobre la portada (radio 28): «Añadir sitio» (píldora `accent` de 50,
  ancho flexible), «Invitar» (secundaria de 50) y mapa (círculo de 50).
- **Pestañas**: control segmentado nativo (`SegmentedControl` de `@expo/ui`) Sitios · Actividad ·
  Miembros, 20 px bajo las acciones. Punto `accent` en Actividad si hay novedades (si el control
  nativo no lo admite, basta el chip de la portada).
- **Sitios**: buscador «Busca en N sitios» a todo el ancho (busca nombre, cocina y barrio); chips de
  estado en una fila deslizable con su número (Todos · Queremos ir · Favoritos · Visitados ·
  Repetir · Archivados); debajo, «N sitios» y a la derecha «Recientes ⌄», un `Menu` nativo con
  Recientes · Mejor valorados · Más cerca de mí · Nombre (A–Z). Un control por tarea: nada de
  botón de filtros ni hoja de filtros. Lista en un bloque `surface` (radio 24): portada 68
  (radio 16), nombre (máx. 2 líneas), «Cocina · Barrio» (sin categoría, solo el barrio; entrada
  manual sin dirección: «Añadido a mano, sin dirección») y `StatusChip` + nota o «Sin valorar» /
  quién quiere ir.
- **Actividad**: patrón de avisos. Bloques `surface` por «Nuevo» y «Esta semana»; fila con la cara
  de quien actúa (44, redonda), frase «**Persona** acción **Sitio**», debajo `StatusChip` o nota +
  hora, y a la derecha la miniatura del sitio (48, radio 12); sin sitio (se une, invita) no hay
  miniatura. Solo los tipos del backend: añadir, valorar, cambiar estado, unirse, invitar.
- **Miembros**: «N miembros» con filas de cara 48, nombre («Tú» en chip salvia), «Creó el grupo»
  para el propietario y «N sitios, N valoraciones»; solo la propietaria ve «Invitaciones
  pendientes», con «Retirar» (botón fantasma de 36; el backend no reenvía), y nota final sobre la
  privacidad. Sin fila de invitar: ya está arriba. Gestionar personas se hace en «Ajustes del grupo».
- **Al deslizar**: cabecera fija según «Cabecera al deslizar» con atrás, nombre centrado (Figtree
  800, 17, una línea) y el engranaje; el control segmentado queda fijo dentro de la cabecera.
- **Casos difíciles**: grupo recién creado (sin foto, «Solo tú, de momento», sin buscador ni chips
  y tarjeta «La mesa está vacía»); búsqueda sin resultados («No está en este grupo» + «Añadir
  «texto»», botón de contorno `accent`); persona que ya no está: «un antiguo miembro».
- **Oscuro**: mismos roles que Grupos oscuro; hoja y fondo `#141612`, bloques `#1D201B`, chip activo
  oliva claro con texto oscuro, segmentado `#23261F` con selección `#383C33`, «Añadir sitio»
  `#E27A5F` con texto `#1E0F0A`. La portada no cambia.

### Restaurante (opción D «Foto corta», aprobada en oct. 2026)
- **Cabecera**: foto a sangre de 250, **sin texto encima** (a diferencia de Detalle de grupo), con
  un velo carbón suave arriba (35 % → 0) para los botones translúcidos de 44 (atrás; favorito y
  «…»). Si hay más de una foto, chip translúcido «1/N» abajo a la derecha que abre la galería. Sin
  foto: `RestaurantCover` a 250 (tono, inicial grande e icono del tipo) con el símbolo oficial de Mesa
  grande (≈330, cortado a la derecha) en la tinta del tono al 10 % detrás de la inicial, y botones
  `surface` sólidos.
- **Título** sobre `background`: chip salvia con el grupo (vuelve al grupo), nombre (Figtree 800,
  32/36, `text-wrap: balance`, sin límite de líneas) y «Cocina · Barrio» (si falta uno, solo el
  otro; si faltan los dos, no hay línea).
- **Acciones** (fila de 50): botón principal según el estado, nunca más de uno:
  «Queremos ir» → «Ya fuimos» (`accent`; pasa a Visitado y propone valorar); visitado sin tu nota →
  «Valorar» (`accent`); ya valorado → «Tu nota · N» (secundario, abre la edición). A su lado, el
  estado como píldora con los colores de «Estados del restaurante» y ⌄ (`Menu` nativo).
- **Orden**: Nota del grupo → Valoraciones → Opiniones → Dónde está. Sin pie de «quién lo guardó».
- **Nota del grupo**: apunte práctico compartido (una por grupo y sitio), bloque `surface` con
  autor y fecha y «Editar». Sin nota: fila «Añade una nota para el grupo».
- **Valoraciones**: media (Figtree 800, 52) + estrellas + «N de M han valorado»; debajo, la fila de
  la mesa: hasta 6 caras (42) con su nombre y la nota en chip salvia, o «–» atenuado si no han
  valorado. Tu cara lleva aro `accent` y «Valorar», y se puede tocar. Sin valoraciones: «Aún sin
  valoraciones» y «Lo propuso Persona el fecha».
- **Opiniones** **[Requiere backend]**: cada valoración admite texto y fotos opcionales (hoy solo
  existe `score`: hace falta migración y almacenamiento de imágenes con la privacidad de grupos
  privados resuelta). Se muestran las 2 más recientes (cara 36, nombre, fecha, estrellas, texto y
  miniaturas de 84, radio 14) y «Ver las N opiniones».
- **Dónde está**: mapa de OpenStreetMap (150 de alto, pin `accent`, atribución visible) y dirección
  con «Copiar». Sin dirección: fila «Sin dirección» con «Añadir». Nada de rutas ni horarios.
- **Hoja Valorar** (`BottomSheet` de `@expo/ui`, cubre la barra de pestañas): «Cancelar» y «Tu
  valoración»; «¿Qué tal en Nombre?» (Figtree 800, 24) con el chip del grupo; 5 estrellas de 40 en
  áreas de 52 (radiogroup) con la etiqueta debajo (Mal · Regular · Bien · Muy bien · Repetiríamos);
  «Cuéntaselo al grupo (opcional)» con campo de texto multilínea; miniaturas de 72 (quitar con ×) y
  botón «Fotos» de contorno discontinuo; aviso «Solo lo verán los miembros de este grupo»;
  «Guardar valoración» (`accent`, ancho completo). Editar abre la misma hoja con los datos.
- **Al deslizar**: cabecera fija según «Cabecera al deslizar» con atrás, nombre centrado (Figtree
  800, 17, una línea), favorito y «…».
- **Oscuro**: roles oscuros habituales; fondo `#141612`, bloques `#1D201B`, botón principal
  `#E27A5F` con texto `#1E0F0A`, chips salvia `#2B3424` con texto `#B4C59D`, mapa `#23261F` con
  calles `#34382F`. La foto no cambia.

### Mapa (esqueleto A1 «Hoja-lista» + tarjeta de A2, aprobado en oct. 2026)
Pestaña Mapa. Sirve sobre todo para decidir *qué tenemos cerca* y, después, para ver dónde quedan
los sitios de un grupo. `react-native-maps` (Apple Maps en iOS, Google en Android) a pantalla
completa bajo la barra de pestañas; los datos vienen de `GET /restaurants/map`.
- **Arriba, solo el grupo**: píldora `background` de 44 con avatar(es), «N grupos · N sitios» (12,
  `text-secondary`) y el nombre (15/600, una línea con «…»), ⌄. Por defecto «Todos tus grupos». A
  la derecha, botón redondo de 44 «Buscar en tus sitios», que abre la hoja del todo con el foco y el
  teclado en el buscador. Nada más encima del mapa.
- **Cambiar de grupo**: `BottomSheet` de `@expo/ui` «Ver en el mapa» con un `radiogroup`: «Todos tus
  grupos» (icono de mapa en salvia) y cada grupo (avatar 40, nombre, «N sitios · ciudad» o «Aún sin
  sitios»), ✓ oliva en el elegido. Al elegir, la cámara **encuadra los sitios del grupo**
  (`fitToCoordinates`, con margen para la hoja), estés donde estés.
- **Hoja de lista** (`BottomSheet` de `@expo/ui` no modal, con interacción con el mapa detrás;
  detents ≈ 45 % y completo): «Cerca de ti» (Figtree 800, 24) y «N a menos de 1 km»; chips de estado
  (Todo · Queremos ir · Favoritos · Visitados · Repetir, con recuento; `tablist`; fila desplazable con
  fundido a `background` en el último 20 % para que se note que sigue; el elegido siempre a la
  vista); filas con monograma
  48, nombre, «Cocina · Barrio», chip de estado y grupo (solo con «Todos»), y a la derecha minutos a
  pie y metros. Abierta del todo: nombre del grupo, «N sitios», «Más cerca ⌄», buscador y chips. **Es
  la alternativa accesible al mapa** y la vista por defecto con VoiceOver/TalkBack.
- **Filtrar**: los pines que no encajan desaparecen (no se atenúan) y lista y recuento cambian a la
  vez. Archivados y «No repetir» no se muestran en «Todo».
- **Pines** (30, áreas táctiles de 44): «Queremos ir» terracota con icono blanco; el resto en
  `surface` con icono en el color del estado (Visitado y Repetir oliva, Favorito corazón terracota) y
  borde de 1,5 px para ≥ 3:1 sobre el mapa. Etiqueta accesible: «Nombre, estado, a N m».
  Seleccionado: 44 **con punta** (la punta marca el punto exacto) y el nombre en una etiqueta debajo;
  el resto al 38 %. **Nombres por zoom**: a nivel de calle, cada pin lleva su nombre debajo (12/600
  con halo `background`, decorativo para lectores de pantalla); al alejar se quitan antes de que se
  pisen. **Muchos juntos**: se
  agrupan en un círculo oliva con el número (40–52 según cantidad; «N sitios juntos. Acercar»); al
  tocar, se acerca, y si siguen en el mismo punto se abre la lista. Tu ubicación es el punto nativo.
- **Pin seleccionado → tarjeta flotante** (de A2): la hoja baja y una tarjeta `background` (radio 24,
  12 de margen, sobre la barra) muestra monograma, nombre (17/600, hasta 2 líneas), «Cocina · Barrio»,
  estado + grupo («Las amigas · +1 grupo» si está en más de uno), «≈ N min a pie · N m» y dos
  acciones: **«Cómo llegar»** (`accent`, abre Apple Maps/Google Maps con las coordenadas) y «Ver
  ficha» (secundario; si el sitio está en varios grupos, `Menu` nativo para elegir en cuál; abre
  `groups/[groupId]/restaurants/…`). ✕ o tocar el mapa la cierra y vuelve la hoja. Con un grupo
  elegido, la tarjeta no repite el grupo. La cámara se desplaza lo justo para que el pin quede por
  encima de la tarjeta. «Cómo llegar»: en iOS, si hay Google Maps instalado, `ActionSheet` nativo
  para elegir app; en Android, intent `geo:` del sistema.
- **Minutos a pie**: estimación honesta en línea recta (distancia × 1,3 a 80 m/min), siempre con
  «≈»; nunca rutas, horarios ni tráfico.
- **Atribución** «© OpenStreetMap» (10,5, sobre `background` al 86 %) siempre visible abajo a la
  izquierda, encima de la hoja o la tarjeta. Botón «Centrar en tu ubicación» (44) a la derecha.
- **Movimiento**: la tarjeta entra con opacidad y 12 px de desplazamiento en 200 ms `ease-out`
  (Reanimated); al cambiar de pin solo cambia el contenido. Encuadres con la animación nativa del
  mapa. Con «Reducir movimiento», solo fundidos y cámara sin animar. Sin háptica salvo al tocar un
  pin (`selectionAsync`).
- **Casos difíciles**: *sin ubicación* (aún sin permiso) → «Tus sitios», orden reciente y bloque
  salvia «Mira qué tenéis cerca» con «Usar mi ubicación»; *permiso denegado* → mismo bloque con
  «Abrir Ajustes» (el mapa funciona igual); *sitios sin coordenadas* → fila discontinua al final de
  la lista «N sitios sin ubicación · añade su dirección desde la ficha» **[Requiere backend: hoy el
  endpoint los descarta sin contarlos]**; *grupo sin sitios* → centrado en ti y vacío «Este grupo aún
  no tiene sitios» con «Añadir sitio» (`accent`, abre Añadir con el grupo elegido); *filtro sin
  resultados cerca* → bloque salvia «Ningún sitio para repetir cerca · Los N … están a más de 1 km» con
  «Ver los N en el mapa» (aleja la cámara hasta encuadrarlos); *cargando* → mapa sin pines, filas de
  esqueleto en la hoja (`aria-busy`) y los pines aparecen todos a la vez (fundido de 150 ms);
  *error del servidor* → mismo aviso que sin conexión con «Reintentar»; *sin conexión* →
  aviso carbón «Sin conexión · tus sitios de hace N h» (datos en caché; el mapa base puede faltar);
  *nombres largos* → el grupo con «…» en la píldora, el sitio en 2 líneas en la tarjeta y la etiqueta
  del pin cortada a 180.
- **Oscuro**: mapa derivado de la marca (suelo `#1B1E19`, calles `#2A2E27`, parques `#243020`,
  agua `#1C2A2E`, rótulos `#7E8576`); píldoras, hoja y tarjeta `#141612`; pines `#1D201B` con anillo
  oscuro y «Queremos ir» `#E27A5F` con icono `#1E0F0A`; agrupaciones `#B4C59D` con número `#141612`.
  En Android, `customMapStyle` con estos colores; en iOS, `userInterfaceStyle` oscuro.

### Editar un sitio (edición nativa en bloques, aprobada en oct. 2026)
- **Backend.** `PUT /groups/{groupId}/restaurants/{id}`: nombre ≤150, dirección ≤300, ciudad, país y
  cocina ≤100, nota del grupo ≤1000. Editar un sitio de OpenStreetMap crea una copia propia en ese
  grupo con las mismas coordenadas; la ubicación no se edita. **Pendiente de backend**: foto del sitio
  y quitar un sitio del grupo.
- **Entrada.** «Editar» en el menú de la ficha → `groups/[groupId]/restaurants/edit` como hoja modal
  (Cancelar · Editar sitio · Guardar).
- **Encabezado.** La foto es un encabezado ancho (176, radio 24), como en la ficha, nunca un avatar.
  Sin foto: tono de la portada tipográfica con el icono del tipo y «Añadir foto» (píldora blanca,
  `#873421`); con foto: la foto con velo inferior y «Cambiar foto» translúcido. Ambos abren `Menu`:
  Hacer una foto · Elegir de la galería.
- **Bloques** (`List` agrupada, filas de 52, etiqueta de 84 en `text-secondary` dentro de la fila y el
  valor editable a su lado): Nombre y «Cocina ›»; «Dirección» con Calle, Ciudad y País; «Nota del
  grupo» en un bloque multilínea con «La ven las N personas de Grupo.». Al final, «Quitar de este
  grupo» (`danger`, centrado) y una sola línea: «Los cambios solo se aplican en este grupo · Datos de
  © OpenStreetMap» (sin atribución en sitios añadidos a mano). Nada de avisos técnicos ni etiquetas
  de «pendiente» dentro de la pantalla.
- **Cocina** (se empuja en la hoja). Buscador con el valor actual, «Más usadas en tus grupos» y
  «Otras» como lista de opción única con check oliva; lo escrito vale como cocina nueva.
- **Casos difíciles**: añadido a mano (huecos «Elegir» y «Añadir calle y número»); sin nombre (la
  etiqueta en `danger`, «Obligatorio», «El sitio necesita un nombre.» y Guardar desactivado).
- **Oscuro**: bloques `#1D201B`, separadores `#2E3229`, Quitar `#FFAA9E`, check `#B4C59D`.

### Descubrir listas públicas (opción D, aprobada en oct. 2026)
- **Rutas.** `groups/explore` (pila de Grupos, «‹ Grupos», título grande «Descubrir») y
  `groups/public/[groupId]` para la lista de otra persona. Backend: búsqueda por texto y ciudad, sin
  orden ni paginación; cada lista trae foto, ciudad, dueña, sitios, colaboradores, seguidores y si la
  sigues; el detalle añade sus sitios y el estado de colaboración.
- **Arriba.** Buscador «Busca listas por nombre» y chips: «Cerca de ti» (chincheta, primero y por
  defecto) y ciudades (`aria-pressed`).
- **Cerca de ti.** Con permiso, `expo-location` da la zona («Lavapiés, Madrid») y se filtra por esa
  ciudad (ya posible). Tarjetas que se deslizan (236, radio 22; foto o portada tipográfica de 118) con
  nombre, cara y nombre de la dueña y «A 6 min a pie · 31 sitios»; debajo, «Todas cerca de ti» en
  filas (portada 64, nombre, dueña, «A 18 min a pie · 40 la siguen», Seguir). Los minutos son
  estimados a pie hasta su sitio más cercano, como en el Mapa: **pendiente de backend** (distancia por
  lista).
- **Sin ubicación.** Aviso `surface` con tesela salvia: «Ver listas cerca de ti», «Mesa usa tu
  ubicación solo para ordenar por cercanía; no se guarda ni se comparte.» y «Usar mi ubicación». Una
  cruz (44, «Ocultar este aviso») lo oculta hasta la próxima apertura de la app; no es permanente ni
  vuelve en cada visita. Mientras, la ciudad elegida con «Las más seguidas» (por seguidores reales) y
  «Todas». Solo los avisos informativos llevan cruz; las filas con una acción, no.
- **Seguir.** Botón de 36 con borde oliva 1,5 y «+ Seguir»; seguido, salvia con «✓ Siguiendo».
  `aria-label` con el nombre de la lista.
- **Lista de otra persona.** Portada del detalle sin engranaje ni novedades, «31 sitios · 128 la
  siguen»; acciones «+ Seguir» (`accent`), «Copiar sitios» (secundaria) y compartir; «Lista de Ana Ruiz ·
  Madrid · actualizada hace 2 días»; si acepta colaboradores, fila «Ana acepta colaboradores · Podrás
  proponerle sitios; ella decide cuáles entran.» con «Pedir colaborar»; con solicitud enviada,
  «Solicitud enviada · Ana decidirá y te avisaremos» con «Retirar». Debajo, buscador y sitios.
- **Casos difíciles**: sin resultados («Ninguna lista con «…»», otra ciudad o «Crear una lista
  pública»); ciudad sin listas («Aún no hay listas públicas en Teruel», otras ciudades o «Crear la
  primera»); solicitud pendiente.
- **Oscuro**: roles oscuros habituales; la portada conserva su velo, texto e iconos blancos.

### Copiar sitios de una lista pública (opción D, aprobada en oct. 2026)
- **Backend.** `GET copy-destinations` (tus grupos posibles) y `POST copy` con destino y 1–100 sitios;
  entran como «Quiero ir», los que ya están en el destino se saltan y responde copiados y saltados.
- **Entrada.** «Copiar sitios» en la lista de otra persona → `groups/public/[groupId]/copy` como
  hoja (`BottomSheet`) sobre la lista.
- **1 · Copiar a…** Título «Copiar sitios a…», «De «Lista». Entran como «Quiero ir» en tu grupo.»,
  buscador «Busca entre tus grupos» (44), «Recientes» y filas de 60 (portada 44, nombre, «N sitios»,
  radio oliva). Resumen en tinte oliva con lo que pasará: «**29 de 31 sitios**. 2 ya están en Paula
  y Angel y se saltan.» (se calcula comparando con los sitios del destino). «Copiar N sitios»
  (`accent`) y «Elegir cuáles».
- **2 · Elegir cuáles** (se empuja en la hoja). Buscador «Busca en N sitios», fila «Seleccionar
  todos» con casilla de tres estados (todos, ninguno, mixto «–») y «27 de 29», y filas con casilla
  oliva, portada tipográfica 44, nombre y «Cocina · Barrio»; lo que ya está, «Ya está» y casilla
  bloqueada (`aria-disabled`). Pie: «Entrarán como «Quiero ir».» y «Copiar N sitios».
- **3 · Hecho.** Tesela salvia con check, «N sitios copiados», «Ya están en Grupo como «Quiero ir».
  N ya estaban y se han quedado como estaban.», «Seguir aquí» e «Ir a Grupo».
- **Casos difíciles**: sin grupos («Aún no tienes dónde copiarlos» → «Crear un grupo»); búsqueda sin
  grupos (botón «Elige un grupo» desactivado); todo repetido (aviso arena y «Nada que copiar»); más de
  100 («hasta 100 a la vez», «Copiar 100 más recientes» o «Elegir cuáles»).
- **Oscuro**: hoja `#141612`, resumen `#232920`, aviso `#3B271F`, casillas oliva claro y bloqueadas
  con borde tenue.

### Botón «+» y Añadir un restaurante (aprobado en oct. 2026)
- **Una sola capa.** El «+» de la barra abre siempre lo mismo, desde cualquier pantalla: una hoja
  (`formSheet`, altura ajustada al contenido) con su propia pila. Elegir una opción la lleva a altura
  completa y avanza dentro de ella; nunca se abre una hoja sobre otra. Arriba: «‹» atrás y «×»
  cerrar (32–36, `surfaceSecondary`).
- **1 · ¿Qué quieres guardar?** Título (Figtree 800, 32) y «Una nueva idea para vuestra lista.».
  «Un restaurante»: tarjeta grande (236, radio 28) con foto del último sitio guardado y velo
  inferior, título blanco (Figtree 800, 26) y píldora `accent` «Buscar un sitio». Sin foto: tono
  terracota suave con el símbolo. Debajo, dos tarjetas (176, radio 24) en salvia y arena con icono,
  título, descripción y el símbolo al 10 %: «Un grupo» y «Una propuesta pública».
- **2 · Un restaurante.** Arriba, el destino «Guardar en» (foto 44, nombre completo y «Cambiar ⇅»);
  por defecto, el grupo actual o el último usado. Buscador (búsqueda explícita en OpenStreetMap, ≤10
  resultados, lista virtualizada) con filas de icono 46 por tipo, nombre, dirección y «Ya está en
  este grupo» (chip salvia, no seleccionable); la fila elegida lleva fondo `tint` y radio activo.
  Al final, «¿No aparece? Añádelo a mano» y la atribución. Pie fijo translúcido: control segmentado
  «Queremos ir · Ya hemos ido» y «Guardar Nombre» (`accent`); sin selección, el botón desactivado.
- **3 · Guardar en** (se empuja en la pila): título grande, buscador «Busca entre tus N grupos»,
  «Crear un grupo nuevo», «Recientes» (2–3) y «Todos los grupos» (A–Z), filas con foto o inicial 44,
  «N miembros · N sitios» y check en el elegido.
- **Casos difíciles**: sin resultados («No encontramos «texto»» + «Añadirlo a mano», contorno
  `accent`); sin conexión («Sin conexión» + «Reintentar»; no se promete guardar sin conexión);
  a mano (Nombre obligatorio y prellenado con la búsqueda; Cocina y Dirección opcionales, «Con
  dirección aparecerá en el mapa del grupo»); sin grupos (tarjeta terracota suave con el símbolo,
  «Aún no tienes grupos» y «Crear mi primer grupo»; después se sigue guardando el sitio); grupo no
  encontrado («Crear «texto»»).
- **Oscuro**: roles oscuros habituales; pie `#141612` al 92 %, segmentado `#23261F` con selección
  `#383C33`, fila elegida `#262A23`, teselas de icono en sus tonos oscuros.

### Crear un grupo (opción A «Portada viva», aprobada en oct. 2026)
- **Entrada.** Desde la hoja del «+» («Un grupo») avanza en la misma pila, con «‹» y «×». Desde
  Grupos («Crear») abre la misma hoja directamente en este paso, solo con «×». Nunca hojas apiladas.
- **1 · Un grupo.** Portada viva (172, radio 28, terracota suave con el símbolo al 12 %) que repite
  el nombre según se escribe (Figtree 800, 28, máx. 2 líneas) y una línea con caras y
  «Privado · Solo tú, de momento»; arriba a la derecha, «Añadir foto» (píldora `surface`). Sin
  nombre muestra «Tu grupo» en `#8D553A`. Con foto: la foto con el velo del sitio del día, texto
  blanco y «Cambiar foto» translúcido. Debajo: **Nombre** (campo `borderInput` 52, activo con borde
  oliva 1,5 y halo; obligatorio, ≤100, crece en líneas y muestra «N/100» al pasar de 80),
  **¿Quién lo verá?** (segmentado nativo `Privado · Público` de 44, con candado y globo) y un bloque
  `surface` de filas de 56 con tesela `tint`: «Invitar», «Ciudad» y «Descripción», cada una con
  «Opcional ›» o su valor en oliva. Pie fijo translúcido con «Crear grupo» (`accent`); sin nombre,
  desactivado (`accentDisabled`).
- **Privado / Público.** Privado: «Solo las personas que invites verán el grupo y sus sitios.».
  Público: la línea pasa a «Público · Cualquiera podrá seguirlo» y aparece «Aceptar propuestas»
  (Switch de `@expo/ui`, activado por defecto): «Quien lo siga podrá proponerte sitios. Tú decides
  cuáles entran.».
- **2 · Invitar** (se empuja en la pila). Título «¿Quién se sienta a la mesa?» y «Escribe su nombre
  de usuario. Les llegará la invitación al crear el grupo.». Campo con «@» oliva y «Añadir» (salvia)
  dentro; «Invitados · N» en un bloque con foto o inicial 40, nombre, «@usuario» y quitar (44); al
  pie, «Listo». Al volver, la fila dice «Ana y Lucas» y la portada muestra sus caras con «Tú, Ana y
  Lucas». Las invitaciones se envían al crear el grupo; la comprobación de usuario (no existe, no
  acepta invitaciones) llegará con el backend y se mostrará en el momento de añadirlo.
- **3 · Grupo creado** (sustituye a los pasos anteriores; solo «×»). Portada con el nombre y
  «Privado · Tú y N invitaciones» (los invitados no cuentan como miembros hasta aceptar), «Ya tenéis
  mesa» (solo: «Tu mesa está lista») y las invitaciones con chip «Pendiente» (reloj, par Queremos
  ir). Pie: «Guardar el primer sitio» (`accent`, sigue en la pila hacia «Un restaurante» con el
  grupo nuevo como destino) e «Ir al grupo» (secundario con borde).
- **Casos difíciles**: sin nombre (botón desactivado); nombre largo (portada a 2 líneas con puntos
  suspensivos, campo en varias líneas y contador); sin conexión al crear (aviso `dangerSoft` en el
  pie, «Sin conexión. No hemos podido crear el grupo.», y el botón pasa a «Reintentar»; los datos
  se conservan). El formulario se desplaza bajo el pie translúcido cuando no cabe.
- **Oscuro**: roles oscuros habituales; portada `accentSoft` `#3B271F` con texto `onAccentSoft`,
  «Añadir foto» sobre `surfaceElevated`, segmentado `#23261F` con selección `#383C33`, pie `#141612`
  al 92 % y botón con texto `onAccent`.

### Ajustes del grupo (propuesta A + C, aprobada en oct. 2026)
- **Entrada.** El engranaje de la portada del grupo (botón translúcido de 44, «Ajustes del grupo»)
  empuja `groups/[groupId]/settings` (ruta nueva) en la pila, sin barra de pestañas. Es la misma
  pantalla para todas las personas: cambia lo que muestra según el rol. Nada de menú «…» con una
  sola opción ni de acciones destructivas a un toque desde la portada.
- **Quién es el grupo** (centrado): portada 104 (radio 28, contorno 1 px al 10 %, sombra con
  desplazamiento), nombre Figtree 800 26/30 equilibrado, «Privado · Ciudad · N sitios» con candado
  o globo, la descripción en `text-secondary` y, solo para la propietaria, «Editar» (secundaria de
  40) que abre `groups/[groupId]/edit`.
- **Editar** (hoja modal, el mismo lenguaje que «Crear un grupo»): barra «Cancelar» (oliva) ·
  «Editar grupo» · «Guardar» (`accent` 600; desactivado en `text-secondary` hasta que algo cambie o
  si falta el nombre). Portada viva de 172 (radio 28) con la foto y su velo, el nombre en Figtree 800
  28 (máx. 2 líneas; vacío, «Tu grupo») y «Privado · N personas» con caras; arriba a la derecha
  «Cambiar foto» translúcido → `Menu` de `@expo/ui`: Hacer una foto · Elegir de la galería · Quitar
  foto (destructivo). Campos con etiqueta encima (13/600 `text-secondary`; «· opcional» en 400):
  Nombre, Descripción (multilínea, mín. 96) y Ciudad, todos `borderInput` 52 radio 14, activos con
  borde oliva 1,5 y halo, error con borde `danger` y el motivo debajo («El grupo necesita un
  nombre.»); el contador aparece al acercarse al límite (≤100 / ≤500). Nota final: «La privacidad
  y las personas se cambian en Ajustes del grupo.». La privacidad no está en la hoja.
- **Gestión** (propietaria): «Traspasar la propiedad · Elige quién lo gestiona» y, en el mismo
  bloque, la consecuencia: «Si borras tu cuenta sin traspasarlo, el grupo y sus N sitios se borran
  para todos.». **Pendiente de backend** (no existe el endpoint).
- **Personas · N**: «Invitar» (texto `accent` con icono, 44) en la cabecera de la sección → 
  `members/add`. Bloque `surface` de filas de 56: cara o inicial 40, nombre, «Tú» en chip salvia y
  una línea («Propietaria · creó el grupo en marzo», «Desde abril», «Colabora · desde mayo» en
  públicos). Cada persona lleva «…» (44, `aria-label` con su nombre) → `Menu` de `@expo/ui` con su
  nombre y @usuario, «Hacer propietaria» (pendiente de backend) y «Quitar del grupo» (destructivo,
  con alerta). Las invitaciones pendientes van al final de la lista: «Invitada hace 2 días» y
  «Retirar».
- **Privacidad**: «Quién puede verlo» con «Solo miembros» / «Cualquiera» y ⌃⌄ (`Picker` o `Menu`
  nativo) y una nota que explica qué cambia. En públicos, además, «Aceptar propuestas» (`Switch` de
  `@expo/ui`) y la fila «Propuestas · N nuevas» hacia la gestión de propuestas.
- **Al final**, en su propio bloque: «Salir del grupo» y «Borrar el grupo» en `danger` con tesela
  `dangerSoft`. La propietaria, al salir, recibe la hoja «¿Quién se queda la mesa?» (`BottomSheet`):
  lista de personas con radio, «Traspasar a Ana y salir» (`accent`) y «Solo traspasar, sin
  salir»; pendiente de backend.
- **Miembro**: misma pantalla sin Editar, Gestión, Invitar ni menús; nota «Paula gestiona el grupo:
  puede editarlo e invitar a más personas», privacidad como texto y solo «Salir del grupo» («Si
  sales, podrás volver cuando te inviten de nuevo.»).
- **Alertas** (nativas, Cancelar · acción destructiva): borrar dice qué se pierde y para quién
  («Se borrarán sus 31 sitios, notas y valoraciones para las 6 personas. No se puede deshacer.»);
  quitar: «Dejará de ver el grupo. Puedes volver a invitarle cuando quieras.».
- **Casos difíciles**: solo tú, sin foto y nombre largo (inicial en su tono en la portada, nombre
  en 3 líneas, traspasar desactivado con su motivo sin atenuar, «Por ahora solo estás tú…» y solo
  «Borrar el grupo»); grupo público (colaboradores, Aceptar propuestas, Propuestas); editar sin
  nombre (Guardar desactivado y «El grupo necesita un nombre.» junto al campo, en `danger`).
- **Oscuro**: roles oscuros habituales; destructivo en `danger` `#FFAA9E` sobre `dangerSoft`
  `#3D1814`, campos con `borderInput` `#6E7566`, alertas sobre superficie elevada `#262A23`.
- **Backend pendiente**: traspasar la propiedad (y que borrar la cuenta lo ofrezca antes de borrar
  los grupos propios). Hoy, editar, invitar, retirar invitaciones, quitar personas y borrar son solo
  de la propietaria, y la propietaria no puede salir.

### Una propuesta pública (opción A, aprobada en oct. 2026)
- **Quién puede.** Solo quien colabora en un grupo público (no su propietario); seguirlo no basta.
  La interfaz ofrece lo que permite el backend: sitio (OpenStreetMap o a mano: Nombre obligatorio
  ≤150, Cocina y Dirección opcionales) y un mensaje opcional ≤500. No se pueden editar: se retiran
  y se vuelven a proponer.
- **Entrada.** Desde la hoja del «+» («Una propuesta pública»), en la misma pila, con «‹» y «×» y
  la cabecera «Una propuesta pública».
- **1 · Buscar.** Mismo esqueleto que «Un restaurante»: arriba «Proponer a» (foto 44, nombre,
  «Lista de Ana · N sitios», «Cambiar ⇅»; por defecto la última lista usada), buscador y
  resultados. «Ya está en la lista» (chip salvia) y «Ya la propusiste» (chip arena, reloj) no se
  pueden elegir. Al final, «¿No aparece? Proponlo a mano» y la atribución. Pie: «Ana decide qué
  entra en su lista.» y «Proponer Nombre» (`accent`).
- **2 · Proponer a** (se empuja). Como «Guardar en»: título 30, «Listas públicas en las que
  colaboras.», «Colaboras» (filas 44 con check) y «Solo las sigues» (no seleccionables: «Pedir» o
  «No acepta colaboraciones»).
- **3 · Unas palabras para Ana** (se empuja). Patrón de redacción: grupo de filas «Para» (lista)
  y «Sitio» (nombre y dirección), etiqueta «Mensaje · opcional» y campo multilínea propio (no de
  `@expo/ui`) en estado activo (borde oliva 1,5 y halo, ≥150) con «Cuéntale por qué encaja en su
  lista». El teclado se abre al entrar; «Enviar propuesta» queda fijo encima y funciona sin
  mensaje. Contador solo cerca del límite.
- **4 · Propuesta enviada** (sustituye a la pila; solo «×»). Portada tipográfica de 132 (sin foto:
  las propuestas no tienen) con chip «Pendiente», «Propuesta enviada», qué pasa ahora («Ana decidirá
  si entra y te avisaremos»), «Tu mensaje» con la cara y una fila «Tus propuestas a esta lista ›».
  Pie: «Ver la lista» (secundario) y «Proponer otro sitio» (`accent`).
- **5 · Tus propuestas.** Pantalla de la pila de la lista (título grande, «‹»), no una hoja.
  «Pendientes · N» (portada tipográfica 52, fecha, una línea del mensaje, chip «Pendiente» y
  «Retirar») y «Respondidas» («Entró en la lista» con «›» al restaurante, «No entró», «Ya estaba en
  la lista»). Las retiradas no se muestran. Retirar: botón, deslizar o menú contextual, siempre
  con la alerta del sistema «¿Retirar la propuesta?» y «Retirar» en `danger`.
- **Casos difíciles**: no colaboras en ninguna lista (símbolo en tesela arena, «Aún no colaboras en
  ninguna lista», «Listas que sigues» con «Pedir»/«Solicitado» y «Descubrir listas públicas»); a mano
  (Nombre prellenado, Cocina y Dirección opcionales, «Con dirección, Ana podrá verlo en el mapa de la
  lista», «Seguir» al mensaje); sin conexión al enviar (aviso `dangerSoft` en el pie, el mensaje se
  conserva, «Reintentar»; un 409 muestra «Este sitio ya está en la lista» o «Ya tienes una propuesta
  pendiente para este sitio»); cerrar con mensaje escrito (hoja de acciones: «Descartar propuesta»
  en `danger` / «Seguir escribiendo»); nombres largos (título y filas en varias líneas, sin cortar).
- **Oscuro**: roles oscuros habituales; fila elegida `#262A23`, chips y portadas en sus tonos
  oscuros, campo activo con borde `#B4C59D`, pie `#141612` al 92 % y teclado del sistema oscuro.

### Gestionar propuestas (bandeja A + ficha de B, aprobada en oct. 2026)
- **Quién.** Solo la propietaria de una lista pública. El backend permite: listar propuestas,
  contar las pendientes, añadir o rechazar (sin motivo); aceptar o rechazar solicitudes para
  colaborar (rechazar impide volver a pedirlo durante 30 días); listar colaboradores (solo la fecha
  de alta) y quitarlos. Las propuestas no tienen foto: siempre portada tipográfica.
- **Entrada.** En la lista pública, encima de las pestañas, una fila `surface` (radio 20) solo para
  la propietaria: tres portadas tipográficas de 36 apiladas, «N propuestas nuevas» y «y N personas
  quieren colaborar», con «›». También desde Ajustes del grupo («Propuestas · N nuevas»). Ruta:
  `groups/[groupId]/restaurant-proposals` (pila, título grande, «‹ Lista»).
- **Bandeja.** Título «Propuestas», la lista con su foto 22 y su nombre, y un control segmentado
  nativo Sitios · Personas con el número de pendientes (`accent` en la pestaña activa,
  `aria-label` «N pendientes»).
- **Sitios.** Un bloque `surface` (radio 22): portada tipográfica 52 (radio 14, tono estable por el
  nombre), nombre, «Cocina · Barrio», «cara 20 · Nombre · hace 2 h», el mensaje entre comillas y
  «No entra» (fantasma 36) / «✓ Añadir» (oliva 36), con área táctil de 44 y `aria-label` que nombra
  el sitio. Tocar la fila abre la ficha («›» arriba a la derecha). Al final, «Respondidas · N ›».
- **Ficha** (pila, «‹ Propuestas», «1 de 3» y anterior/siguiente con botones de 44, no solo con
  gesto). Tarjeta `surface` (radio 28): portada tipográfica de 150 con el icono del tipo, nombre
  Figtree 800 26, dirección con chincheta y «Abrir en Mapas» (si tiene coordenadas), «Te lo propone
  **Nombre** · hace 2 h» con su cara y el mensaje en un globo `tint`; sin mensaje, «Marta no ha
  dejado mensaje.». Pie fijo translúcido: «Lucas recibirá un aviso con tu respuesta.», «No entra»
  (secundario) y «Añadir a la lista» (`accent`).
- **Después de decidir.** La propuesta sale de la bandeja y aparece un aviso inferior carbón
  (`role="status"`): «Taberna El Sur ya está en la lista. Avisaremos a Lucas.» con «Ver». Si el
  backend la marca como duplicada: «Casa Granada ya estaba en la lista. Se lo diremos a Ana.».
- **Respondidas.** Por meses; portada 44, nombre, «De Ana · 9 oct.» y chip: «Entró» (salvia, con
  «›» a su ficha), «No entró» (neutro), «Ya estaba» (arena). Las retiradas no aparecen.
- **Personas.** «Quieren colaborar»: cara 44, nombre, «@usuario · hace 1 día», mensaje y Rechazar /
  Aceptar; debajo, «Si rechazas a alguien, podrá volver a pedirlo dentro de 30 días.». Tocar abre la
  solicitud (cara 96, mensaje, qué supone aceptar y la misma consecuencia junto a los botones).
  «Colaboran · N»: filas de 56 con «Colabora desde abril» y «…» → `Menu` con «Quitar de la lista»;
  la alerta dice lo que pasa: «Se retirarán sus propuestas pendientes y se borrarán sus
  valoraciones en esta lista; los sitios que ya entraron se quedan.».
- **Casos difíciles**: nada pendiente (tesela salvia, «Nada pendiente» y qué llegará aquí);
  colaboradores nuevos desactivados («No aceptas colaboradores nuevos», qué significa y «Cambiarlo en
  Ajustes»); propuesta a mano sin dirección ni mensaje y con nombre largo (sin «Abrir en Mapas»,
  nombre en varias líneas).
- **Oscuro**: portadas en sus tonos oscuros, Añadir en oliva claro con texto oscuro, aviso inferior
  invertido, círculo del icono de la portada al 28 % de negro y chip de Mapas `#2A2E27` con texto
  `#C7D6B2`.

### Perfil y ajustes (opción A «Tarjeta de mesa» + «Al momento», aprobado en oct. 2026)
- **Para qué se viene.** Verte como te ven tus grupos, pasar tu usuario para que te inviten,
  ajustar algo puntual y salir. Regla de reparto: **Editar perfil es lo que ven tus grupos** (foto,
  nombre, usuario); **Cuenta y seguridad, lo que solo ves tú** (correo, contraseña, eliminar).
- **1 · Perfil** (pestaña). Título «Perfil» (`sectionTitle`). Tarjeta `surface` (radio 28): foto 96
  con anillo `background` e insignia de cámara 32 (`text`; sin foto, `accent`), nombre (Figtree 800,
  28, las líneas que necesite), píldora `chip` «@usuario» (solo texto: copiarlo vive en «Compartir»),
  «En Mesa desde {mes de año}» (`createdAt`), cifras `sitios · grupos · valoraciones`
  (`/users/me/stats`, Figtree 800 24 con números tabulares) y dos secundarios «Editar perfil» y
  «Compartir». Debajo, si las hay, la invitación pendiente (`HomeInvitationMessage`). Después,
  **«Al momento»** (lista agrupada de `@expo/ui`): Apariencia con segmentado nativo
  `Automática · Clara · Oscura` (Picker segmentado; se aplica al instante), Switch «Notificaciones» (general) y
  «Qué te avisamos ›» con «N de 4». Luego **Tu cuenta** (Cuenta y seguridad, Privacidad) y
  **Ayuda** (Ayuda y soporte, Acerca de Mesa «1.0»), «Cerrar sesión» en un bloque `surface` propio y
  al pie el logotipo SVG oficial (26) con «Versión · Tus sitios, con los tuyos.». Filas de 52
  (56 con subtítulo) con tesela `tint` 32 y icono `support`; cabecera compacta al deslizar.
- **2 · Compartir usuario** (BottomSheet de `@expo/ui`). «Que te encuentren», tarjeta con foto y
  «@usuario» grande, «Copiar usuario» (`accent`, la única acción principal) y «Compartir…» (hoja
  del sistema con «Búscame en Mesa: @usuario») y el Switch «Permitir invitaciones».
- **3 · Editar perfil** (hoja de página; «Cancelar» · «Editar perfil» · «Guardar» en `accent`,
  desactivado sin cambios). Foto 104 y «Cambiar foto» abren un Menu nativo (Hacer una foto, Elegir
  de la galería, Quitar foto en `danger`). Campos Nombre (≤100) y Usuario («@» oliva, 3–50, «Con él
  te encuentran e invitan a los grupos.»). **«Así te ven tus grupos»**: fila de miembro en vivo con
  foto, nombre y «@usuario · ha guardado…». Nota final: el correo y la contraseña están en Cuenta y
  seguridad. Guarda con `PUT /users/me` (que también lleva el correo actual).
- **Cerrar sesión**: hoja de acciones nativa, «Tus grupos y sitios seguirán aquí cuando vuelvas.»,
  «Cerrar sesión» en `accent` y «Cancelar».
- **Ajustes** (pantallas empujadas con «‹ Perfil» y título grande; la barra de pestañas se
  mantiene salvo en formularios): **Cuenta y seguridad** (Correo › con el valor, Contraseña ›
  «Cambiar», «Entrar más rápido» con Apple y Google «Vincular», «Eliminar cuenta» aparte con tesela
  `dangerSoft` y texto `danger`, y «En Mesa desde…»); **Tu correo** (un campo, «Con él entras en
  Mesa. Nadie más lo ve.», Guardar desactivado hasta que cambia); **Cambiar contraseña** (actual y
  nueva, la regla «Al menos 8 caracteres» en verde al cumplirse, «¿Has olvidado tu contraseña?» y
  botón fijo); al guardar se vuelve a Cuenta con un aviso breve `text` sobre `background`
  («Contraseña cambiada. Sigues dentro.», se anuncia como estado); **Notificaciones** (Switch general «En este móvil» y los 4 tipos del
  backend: sitios nuevos, cambios de estado, valoraciones, actividad del grupo); **Privacidad**
  (Switch de invitaciones, «Qué ven los demás»: nombre, usuario y foto, actividad solo dentro del
  grupo, el correo nunca; «Descargar una copia» y «Permisos del móvil»); **Ayuda** (preguntas
  desplegables con `Collapsible` y tarjeta «¿Te falta algo?» con «Escribir a soporte», `POST /support`); **Acerca de
  Mesa** (logotipo 44, lema, versión, condiciones, privacidad, «Mapas y atribuciones» con
  OpenStreetMap y «Recomendar Mesa»).
- **Eliminar cuenta**: «Eliminar tu cuenta» con lo que se borra (datos, foto, N valoraciones, sales
  de tus grupos) y lo que se queda (los sitios que guardaste), contraseña para confirmar y botón
  `danger` fijo. Después, BottomSheet «¿Eliminar tu cuenta para siempre?» con «Eliminar para
  siempre» (`danger`) y «Cancelar» del mismo tamaño. Al terminar, «Tu cuenta se ha eliminado» y
  «Volver al inicio» (Bienvenida).
- **Casos difíciles**: sin foto (inicial en `accentSoft` y cámara en `accent`); nombre y usuario
  largos (el nombre ocupa las líneas que necesite; el usuario se corta en la píldora y se lee entero
  en su etiqueta accesible); usuario en uso (error en el campo, tres sugerencias libres en chips
  salvia, Guardar desactivado); contraseña actual incorrecta (error en el campo, la nueva se
  conserva); salir con cambios (hoja «Descartar cambios» / «Seguir editando»); sin conexión (píldora
  «Sin conexión · ves lo último guardado»: la apariencia funciona y los Switch que dependen del
  servidor se desactivan, con el motivo legible en su subtítulo); cifras sin cargar (rayas, nunca
  un 0 falso, y «No hemos podido cargar tus cifras. Reintentar»); avisos bloqueados en el sistema (aviso `dangerSoft` con «Abrir Ajustes
  del móvil» y Switch desactivados); **propietaria de grupos** (antes de la contraseña, «Grupos que
  desaparecerán para todos» con cada grupo, sus personas y «Pasar a otra persona»); letra grande
  (los dos botones de la tarjeta se apilan y todo se recoloca).
- **Accesibilidad**: filas y Switch con etiqueta y estado; foto «Cambiar tu foto»; «Copiar usuario»
  anuncia «Usuario copiado»; áreas ≥ 44 pt; segmentado como `radiogroup`; un Switch desactivado
  nunca atenúa el texto que explica por qué; el Switch apagado lleva borde `borderInput` (3:1 con la
  superficie) en el dibujo, y en la app es el nativo.
- **Implementación**: `List`/`ListItem`, `Switch`, `Picker` (segmentado), `Menu`, `BottomSheet` y
  `Collapsible` de `@expo/ui`; las hojas de acciones (Cerrar sesión, Descartar cambios) con
  `ActionSheetIOS` / `Alert` nativos, porque `@expo/ui` no trae diálogo de confirmación. Editar
  perfil es una ruta modal (`presentation: 'modal'`); el resto de ajustes, pantallas empujadas.
- **Oscuro**: roles oscuros habituales; logotipo en `text` oscuro (`#ECEEE6`), Switch encendido
  `#B4C59D` con pulgar `#141612`, `danger` `#F08A7A` sobre `#3A1F1A` y segmentado con selección
  `#383C33`.
- **Pendiente** (backend): traspasar la propiedad de un grupo (hoy borrar la cuenta **borra los
  grupos propios para todos**), vincular Apple y Google (y cómo confirman el borrado o la contraseña quienes entran sin
  contraseña), confirmar el cambio de correo por enlace, recuperar contraseña, descargar una copia
  de los datos y documentos legales reales. Pendiente en la app: guardar la
  apariencia elegida (hoy solo sigue al sistema).

### Notificaciones e invitaciones (opción B «Dos bandejas», aprobado en oct. 2026)
- **Entrada.** Campana (44, con contador `accent` de no leídas) en la cabecera de Inicio y Grupos →
  pestaña **Actividad**. La invitación de Inicio y la de Perfil abren directamente **Invitaciones**.
  Pantalla empujada: «‹ Inicio», título «Notificaciones» (`screenTitle`), «···» (Menu nativo:
  «Marcar todo como leído», «Ajustes de notificaciones» y «Borrar todas» en `danger`, con
  confirmación) y segmentado nativo `Actividad · Invitaciones N` (el filtro `ACTIVITY` /
  `INVITATIONS` del backend). Cambiar de pestaña no se anima.
- **Actividad.** Bloques `surface` por días («Hoy», «Esta semana», «Antes»). Fila: foto de quien lo
  hizo (44; sin foto, inicial) con insignia de tipo 22 (sitio nuevo `+` terracota suave, valoración
  estrella oliva, estado check salvia, grupo personas `chip`), texto con nombres en 600 («**Ana** ha
  guardado **Trattoria Da Enzo**») y «grupo · hace N». No leído: punto `accent` 9 y «No leído» en la
  etiqueta accesible (nunca solo color). Tocar marca como leído y abre `targetUrl`. Deslizar a la
  izquierda borra (acción `danger` 96 «Borrar»; spring 300 ms con la velocidad del dedo y háptico
  medio al confirmar); la misma acción está en el menú contextual. Paginación al llegar al final.
- **Invitaciones** (estilo «Tipográfica», como una alerta nativa). Tarjeta `surface` (radio 22):
  arriba, la cara de quien invita (24, contorno de imagen 1 px al 10 %) con «**Lucas** te invita · hace
  2 h» y «›»; el nombre del grupo es la portada (Figtree 800 26, `text-wrap: balance`, las líneas que
  necesite), sin miniatura para que todas las tarjetas tengan el mismo ritmo (la foto vive en la
  vista previa); debajo, «Privado ·
  5 personas · 23 sitios» con iconos y números tabulares. Pie de alerta: «Rechazar» (`textSecondary`)
  | «Aceptar» (`accent`, 600), 52 de alto, separados por una línea. La parte de arriba abre la vista
  previa. Con letra grande el pie se apila y «Aceptar» va primero. Pie de pantalla: candado y «Solo
  te encuentran por tu usuario. Privacidad».
- **Ver la invitación** (BottomSheet de `@expo/ui`, alto). Portada de 200: la foto con el velo de
  siempre y el nombre en crema, o, sin foto, el tono del grupo con el símbolo de Mesa al 14 % y el
  nombre en su tinta. Debajo: quien invita, caras de quién está, cifras `personas · sitios · media del
  grupo` y «Lo último que han guardado» (3 filas). Pie fijo translúcido: «Aceptar invitación»
  (`accent`) y «Rechazar». Se decide sabiendo qué hay dentro.
- **Aceptar.** El pie cambia (fundido 200 ms, ease-out) a «✓ Ya estás dentro · Abrir grupo ›» en
  `tint` con texto oliva; háptico de éxito y aviso inferior «Te has unido a
  {grupo}» con «Deshacer» (sale del grupo, `DELETE /groups/{id}/members/me`). El contador baja al
  instante.
- **Rechazar.** Hoja de acciones nativa («Dejarás de ver la invitación de Ana a Brunch de
  domingo.», «Rechazar invitación» en `danger`, «Cancelar»): no se puede deshacer.
- **Casos difíciles**: sin actividad («Todo tranquilo» y qué llegará aquí); sin invitaciones
  («Ninguna invitación» y «Compartir usuario», que abre la hoja de Perfil); invitación ya no
  disponible (contenido al 55 % y pie «El grupo se ha borrado o la invitación se retiró. · Quitar»); sin conexión (píldora «Sin
  conexión · ves lo último guardado»; si aceptar falla, aviso `danger` «No se ha podido aceptar ·
  Reintentar»); nombres largos (portada y filas crecen en líneas; solo el grupo del pie se corta);
  letra grande (los botones se apilan).
- **Movimiento** (expo-animation): segmentado sin animación (uso muy frecuente); aparición de filas
  nuevas sin animación; aviso inferior con entrada ease-out 200 ms; con «Reducir movimiento», solo
  fundidos.
- **Oscuro**: roles oscuros habituales; portadas en sus tonos oscuros, «Aceptar» `#E27A5F` con texto
  `#1E0F0A` y aviso inferior claro (`#ECEEE6`) con «Deshacer» `#3E4C31`.
- **Pendiente** (backend): en la invitación, la foto del grupo, personas (con 3 caras), sitios,
  media y los 3 últimos sitios (una vista previa para quien aún no es miembro); y `groupId` en cada
  aviso (para agrupar o silenciar por grupo).

### Soporte y permisos (aprobado en oct. 2026)
- **Backend.** `POST /support/requests` con categoría (`TECHNICAL_PROBLEM`, `ACCOUNT`, `SUGGESTION`,
  `OTHER`), asunto ≤120 y mensaje de 10 a 1500. Sin historial ni adjuntos: no se dibujan.
- **Ayuda (centro de ayuda).** Pila desde Perfil, «‹ Perfil». Cabecera en terracota suave (radio 26)
  con el logotipo oficial, «¿En qué te echamos una mano?» (Figtree 800 28) y «Escríbenos y te
  contestamos por correo.». Debajo, un bloque `surface` con cuatro caminos de 68 (tesela 42 con su
  par de color, título y explicación, «›»): Informar de un problema (terracota suave), Proponer una
  idea (salvia), Ayuda con mi cuenta (arena), Otra consulta (neutro). Cada camino abre el mensaje con
  su motivo ya elegido; no hay paso de motivo.
- **Escribir.** Pila, «‹ Ayuda», título «Escríbenos», el motivo como etiqueta de su color y una hoja
  `surface` (radio 22): el asunto como título (Figtree 800 20), el mensaje debajo (≥250) y al pie
  «✉ Te contestamos a tu@correo». Pista: «Qué hacías, en qué grupo y desde cuándo: así lo resolvemos
  antes.». Pie translúcido con «Enviar» (`accent`). Nada de chips, campos con borde ni bloques de
  ajustes.
- **Enviado.** Tesela salvia con check, «Mensaje enviado», a qué correo se contesta y «Volver a Ayuda».
- **Cámara sin permiso** (al cambiar la foto de perfil). Hoja con tesela de cámara tachada, «Mesa no
  puede usar la cámara», el motivo y dos salidas: «Abrir Ajustes» (`accent`) y «Elegir de la galería».
- **Casos difíciles**: mensaje corto (la hoja con borde `danger`, «Cuéntanos un poco más: al menos 10
  caracteres.» y Enviar desactivado); sin conexión (aviso `dangerSoft` en el pie, el mensaje se
  conserva y «Reintentar»).
- **Oscuro**: cabecera `#3B271F` con el logotipo en crema; hoja `#1D201B`; Enviar en terracota claro.

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
