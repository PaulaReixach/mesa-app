# MESA — Sistema visual

Fuente de verdad visual de la app. Se basa en el prototipo de producto "MESA"
(previsualización HTML local, sección **Sistema visual** y pantalla de Inicio), que es
la referencia aprobada. Los tokens viven en `mobile/src/theme/` y los componentes base
en `mobile/src/components/ui/`. Si una regla cambia, se cambia primero aquí.

> Origen: `~/.codex/visualizations/2026/10/01/01a0f70e-…/mesa-final/` (`app.js`,
> `styles.css`, `brand/`). Los valores de este documento son los finales tras la
> cascada de CSS del prototipo; las desviaciones están marcadas como **[Mejora]** con
> su motivo.

---

## 1. Identidad

> **Una identidad tranquila. Un producto claro.** La lista compartida es el centro de
> MESA. La marca aparece en el encuentro alrededor de una mesa; la interfaz deja
> protagonismo a los sitios, las personas y sus opiniones.

| Decisión | Por qué |
|---|---|
| Fondo crema y tarjetas blancas con borde fino | Calidez sin ruido; el contenido (sitios, personas, opiniones) es lo que destaca. |
| **Terracota** solo para acciones principales | "Guardar", "Aceptar", "Ver restaurante", "Crear". Si es terracota, se puede hacer. |
| **Oliva** para contexto, estados y navegación seleccionada | Recuentos, puntuaciones, "por probar", pestaña activa. Informa sin competir con la acción. |
| **Salvia** como superficie suave de la oliva | Botones secundarios, avatares sin foto, iconos de estado, indicador de pestaña. |
| Una sola familia: **Inter** | Legible a tamaños pequeños, cifras claras, neutra para que la marca la ponga el logotipo. |
| Logotipo "mesa" centrado en la cabecera de Inicio | Presencia de marca discreta; los títulos de pantalla no compiten con él (no hay serif). |

Marca (`brand/USO.md` del prototipo): logotipo dibujado en curvas, sin estirar, rotar ni
sombrear; margen libre mínimo de un arco del símbolo; marca completa ≥ 110 px, símbolo
≥ 24 px. En la app se usa el wordmark (`mobile/assets/images/brand/wordmark.svg`)
coloreado con `textPrimary`, así funciona en modo oscuro.

---

## 2. Color

Roles semánticos en `mobile/src/theme/palette.ts`. Ningún componente usa hex directos.

### 2.1 Modo claro (prototipo)

| Rol | Valor | Nombre en el prototipo | Uso |
|---|---|---|---|
| `background` | `#FCFAF7` | `--mesa-bg` | Fondo de pantalla |
| `surface` | `#FFFFFF` | `--mesa-paper` | Tarjetas, buscador, barra de pestañas |
| `surfaceSecondary` | `#F1F2ED` | chip | Chips inactivos, skeleton, fila pulsada |
| `surfaceElevated` | `#FFFFFF` | — | Hojas y menús |
| `textPrimary` | `#272924` | `--mesa-ink` | Texto principal |
| `textSecondary` | `#687064` | `--mesa-muted` | Texto secundario y metadatos |
| `textTertiary` | `#687064` | — | Placeholders, pestañas inactivas **[Mejora]** |
| `iconMuted` | `#87927E` | chevrons | Iconos decorativos (contraste no textual ≥ 3:1) |
| `separator` | `#E2E4DC` | `--mesa-line` | Líneas finas |
| `border` | `#E8E8E0` | borde de tarjeta | Contorno de tarjetas y buscador |
| `borderInput` | `#8C9383` | — | Contorno de campos editables (≥ 3:1) |
| `accent` | `#A6412B` | `--mesa-action` | Acción principal |
| `accentPressed` | `#873421` | `--mesa-action-down` | Acción pulsada |
| `accentSoft` | `#F5E6DD` | `--mesa-soft` | Superficie suave terracota |
| `onAccent` | `#FFFFFF` | — | Texto sobre terracota |
| `onAccentSoft` | `#873421` | — | Texto sobre `accentSoft` |
| `secondary` | `#4C5C3C` | `--mesa-olive` | Oliva: contexto, estados, selección |
| `secondarySoft` | `#E8EDDF` | `--mesa-sage` | Salvia |
| `onSecondarySoft` | `#4C5C3C` | — | Texto sobre salvia (siempre oliva) |
| `tint` | `#F1F4EA` | etiqueta "por probar" | Relleno de etiquetas oliva |
| `rating` | `#4C5C3C` | — | Puntuaciones (estrella y cifra) |
| `danger` / `dangerSoft` | `#AA342A` / `#FCECE6` | `--mesa-error` | Errores y acciones destructivas |
| `overlay` | `rgba(39,41,36,0.40)` | — | Velo de modales |

### 2.2 Modo oscuro **[Mejora — el prototipo no lo tiene]**

Negros con un leve matiz oliva para que la identidad se reconozca también de noche.
Los acentos se aclaran (no se invierten) y el texto sobre terracota pasa a casi negro.

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

En oscuro las tarjetas no llevan sombra: se separan por superficie y borde.

### 2.3 Estados del restaurante

Siempre icono **y** texto (el color nunca va solo). Texto / fondo:

| Estado | Icono | Claro | Oscuro |
|---|---|---|---|
| Queremos ir | cubiertos | `#8D553A` / `#F4E8DE` | `#E8B79A` / `#3A2A20` |
| Visitado | check | `#4E633D` / `#E8EDDF` | `#B4C99D` / `#263021` |
| Favorito | corazón | `#A6412B` / `#F5E6DD` | `#F0A99A` / `#3B221D` |
| Queremos repetir | repetir | `#4E633D` / `#E8EDDF` | `#B4C99D` / `#263021` |
| No repetir | cruz | `#A23D32` / `#FAE7E2` | `#F0A99A` / `#3B1E1A` |
| Archivado | archivo | `#5E655A` / `#EAEBE6` **[Mejora]** | `#B9BDB1` / `#2A2D27` |

El prototipo no tiene "Favorito" como estado (usa un corazón aparte); en la app sí
existe y toma el par terracota suave.

### 2.4 Contraste (WCAG 2.2 AA, verificado)

- Todos los textos sobre `background`, `surface`, `surfaceSecondary` y
  `surfaceElevated` ≥ 4,5:1 en ambos modos.
- Texto sobre acento, salvia, `tint` y todos los pares de estado ≥ 4,5:1.
- Iconos decorativos (`iconMuted`) y `borderInput` ≥ 3:1.
- **Regla**: sobre salvia (`secondarySoft`) el texto va en oliva, nunca en gris
  (`textSecondary` sobre salvia da 4,31:1).

**[Mejora]** El prototipo usaba cuatro grises por debajo de 4,5:1 para texto: el texto
de ayuda del buscador `#74796E` (4,47), las pestañas inactivas `#737B69` (4,41), el
texto de Archivado `#687064` sobre `#EAEBE6` (4,28) y el texto del Inicio vacío
`#77756E` (4,43). Se unifican en `textSecondary #687064` (5,13) y Archivado pasa a
`#5E655A`. La diferencia visual es mínima y el texto cumple AA.

---

## 3. Tipografía

**Inter** (`@expo-google-fonts/inter`: 400, 500, 600, 700). El prototipo usa Inter
variable con pesos intermedios; en la app: 550 → 500 (Medium), 600–650 → 600 (SemiBold).
El peso se elige con `fontFamily`, nunca con `fontWeight`.

| Token | Tamaño / interlineado | Peso | Tracking | Uso en el prototipo |
|---|---|---|---|---|
| `screenTitle` | 27 / 33 | 600 | −0,9 | "Hola, Paula" |
| `featureTitle` | 23 / 29 | 600 | −0,65 | Nombre en la tarjeta destacada |
| `emptyTitle` | 25 / 30 | 600 | −0,8 | "Un grupo para tu gente." |
| `sectionTitle` | 18 / 24 | 600 | −0,35 | "Tus grupos" |
| `cardTitle` | 16 / 22 | 600 | −0,1 | Nombre de grupo |
| `bodyStrong` | 14 / 21 | 600 | — | Nombres dentro de frases |
| `body` | 14 / 21 | 400 | — | Texto de lectura, actividad |
| `button` | 14 / 20 | 600 | — | Botones |
| `buttonSmall` | 13 / 18 | 600 | — | Botones compactos, enlaces de texto |
| `secondary` | 13 / 20 | 400 | — | Subtítulos, metadatos de tarjeta |
| `secondaryStrong` | 13 / 20 | 500 | — | Enlaces de texto, selector de ciudad |
| `caption` | 12 / 18 | 400 | — | Pies, fuentes, horas |
| `label` | 12 / 16 | 500 | — | Estados, etiquetas, pasos **[Mejora: 11 → 12]** |
| `tab` | 11 / 14 | 500 | — | Etiquetas de pestaña **[Mejora: 10 → 11]** |
| `monogram` | 56 / 60 | 600 | −1,5 | Inicial de la portada tipográfica |
| `score` | 14 / 21 | 600 | cifras tabulares | Puntuaciones |

**Por qué [Mejora] en los mínimos**: 11 px en estados y 10 px en pestañas se leen mal
en Android (Material pide 12 sp en etiquetas). Se sube a 12 en contenido y a 11 en
pestañas, que mantiene la densidad del prototipo.

**Tamaño de texto del sistema**: siempre activo. `maxFontSizeMultiplier` 1,3 en
pestañas y etiquetas compactas, 1,6 en títulos, sin límite en texto de lectura. Con
`fontScale > 1,3` las filas se apilan y la portada tipográfica se oculta. Las cifras
usan coma decimal ("4,5").

---

## 4. Espaciado, radios, bordes y sombras

### Espaciado (`space`) — escala del prototipo

`4 · 8 · 12 · 16 · 20 · 24 · 32`. **Margen de pantalla: 22** (`screenGutter`).

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

### Radios (`radius`) — siempre con `borderCurve: 'continuous'`

| Token | Valor | Uso |
|---|---|---|
| `xs` | 6 | Estados y etiquetas |
| `sm` | 10 | Botones, miniaturas, indicador de pestaña |
| `md` | 12 | Buscador, campos, invitación |
| `lg` | 15 | Tarjetas |
| `xl` | 18 | Tarjeta destacada, tarjeta de primer uso |
| `full` | 999 | Avatares, botón Añadir |

### Bordes y sombras

- Tarjetas: borde 1 px `border`, sin sombra.
- Tarjeta destacada: borde + `0 4px 15px rgba(39,41,36,0.03)` (sin sombra en oscuro).
- Listas sobre el fondo (actividad): sin contenedor, separadores de 1 px `separator`.

### Iconos

SF Symbols (iOS) y Material Symbols (Android) con `SymbolView`. Tamaños: 12–13 en
estados, 14–16 en enlaces y chevrons, 18 en el buscador, 22 en pestañas y cabecera,
30 en estados de pantalla. Zona táctil mínima de **44 pt** en todo lo pulsable.

---

## 5. Componentes

Viven en `mobile/src/components/ui/`. Todos aceptan `style` (para el layout, al final),
responden al pulsar y exponen rol y estado de accesibilidad.

### Botones (`Button`)

| Variante | Aspecto | Uso |
|---|---|---|
| `primary` | Terracota, texto blanco, radio 10, 46–52 de alto | Una acción principal por bloque |
| `secondary` | Salvia, texto oliva | Acción alternativa ("Ver mapa") |
| `danger` | `dangerSoft`, texto `danger` | Acciones destructivas |
| `text` (tono `accent`) | Solo texto terracota | Crear o cambiar: "Crear", "Otro sitio", "Aceptar" |
| `text` (tono `secondary`) | Solo texto oliva | Navegar: "Ver todos los grupos", "Ver invitación" |

Estados: pulsado (`accentPressed`, o atenuado), desactivado (`#E5E5DF` / `textSecondary`
en primary; 0,4 de opacidad en el resto), cargando (spinner sin cambiar el ancho).
Los botones de texto mantienen 44 pt de zona táctil con `hitSlop`.

### Respuesta al pulsar **[Mejora]**

El prototipo solo define `:hover`, que no existe en móvil. En la app (`PressableCard`):
onda nativa (`android_ripple`) en Android y atenuado en iOS; las tarjetas grandes se
reducen al 98 %. Es el comportamiento esperado en cada plataforma.

### Tarjeta (`PressableCard`)

`surface`, borde `border`, radio `lg` (15) y padding 13 × 15. La destacada: radio `xl`
(18), sombra suave, padding 18.

### Estado del restaurante (`StatusChip`)

Radio 6, padding 4 × 7, icono 12 + texto `label`, con el par de colores de §2.3.

### Puntuación (`RatingBadge`)

En oliva: estrella rellena + cifra (`score`) y, opcional, "· N valoraciones" en
`textSecondary`. Sin valoraciones: "Aún sin valoraciones" o "Pendiente de probar"
con icono de cubiertos sin relleno.

### Avatares (`Avatar`, `AvatarStack`)

Con foto, o inicial en oliva sobre salvia (nunca "?"). Pila: hasta 3 de 25–28 px
solapados −7 con borde de 2 px del color de la superficie, más "+N". Etiqueta
accesible "N miembros". Persona desconocida: icono del tipo de evento sobre salvia y el
texto "Un miembro".

### Portada tipográfica (`RestaurantCover`) **[Mejora — restaurantes sin foto]**

Los restaurantes no tienen fotografía en los datos de Mesa. En lugar de fotos genéricas
(que simulan una comida que no es la del sitio), una portada de 132 pt:

- Fondo con uno de cuatro tonos de la marca, elegido de forma estable por el nombre:

  | Tono | Claro (fondo / tinta) | Oscuro (fondo / tinta) |
  |---|---|---|
  | Salvia | `#E8EDDF` / `#4C5C3C` | `#2B3424` / `#B4C59D` |
  | Terracota suave | `#F5E6DD` / `#A6412B` | `#3B271F` / `#E8A48E` |
  | Arena | `#F1ECE3` / `#8D553A` | `#332C24` / `#E2BC97` |
  | Bruma | `#EEF1E8` / `#4C5C3C` | `#242A21` / `#B4C59D` |

- Inicial grande (`monogram`) en la tinta del tono e icono del tipo de local
  (cubiertos, taza o copa según `restaurant.category`) con su etiqueta.
- Con texto muy grande se oculta y la tarjeta queda solo con texto (la variante "sin
  foto" del prototipo).

Cuando un restaurante tenga foto real, la portada se sustituye por ella (164–206 pt).

### Invitación pendiente (`HomeInvitationMessage`)

Variante "mensaje personal" del prototipo: superficie blanca, borde, radio 12, padding
13 × 14. Foto (o inicial) del remitente de 32, "**Carlos** te ha invitado al grupo
**Viaje a San Sebastián**.", estado "✉ Invitación pendiente · N" (`label`, sobre con
icono oliva) y acciones de texto **Aceptar** (terracota) y **Ver invitación** (oliva).

### Cabecera de sección (`SectionHeader`)

Título `sectionTitle`, texto opcional debajo (`secondary`, `textSecondary`) y como
mucho un enlace de texto a la derecha (terracota si crea o cambia, oliva si navega).

### Buscador (disparador)

Blanco, borde `border`, radio 12, 48 de alto, lupa 18 en oliva, texto `body` en
`textTertiary`.

### Estados de pantalla (`EmptyState`)

Círculo salvia de 72 con icono oliva de 30, título 23/600, texto 14 en
`textSecondary` (máx. 280 de ancho) y acción `primary`. Variante compacta (sin
círculo) para secciones vacías dentro de una pantalla.

### Barra de pestañas

Blanca (`surface`), línea superior `separator`. Inactivas en `textTertiary`; la
seleccionada en oliva sobre una pastilla salvia (radio 10) y etiqueta en 600. "Añadir"
es un círculo terracota con el "+" en `onAccent`.

### Reglas de contenido

- **Fechas** relativas en español (`lib/relative-time.ts`): "Hace 2 h", "Ayer",
  "Hace 3 días", "Hace 2 meses". Con mayúscula inicial al empezar un segmento.
- **Metadatos**: segmentos separados por " · ", con espacios duros dentro de cada
  segmento, para que solo se partan entre segmentos.
- **Actividad**: sin duplicados (la última valoración o cambio de estado por persona y
  restaurante, `lib/activity.ts`).
- **Recomendaciones**: nunca "No repetir" ni "Archivado".
- Textos en segunda persona del plural cuando hablan del grupo ("Vuestros
  restaurantes", "Guardad").

---

## 6. Modo claro y oscuro

- `useTheme()` (`mobile/src/theme/use-theme.ts`) devuelve `{ scheme, colors, status,
  elevation, cover }` según `useColorScheme()`.
- Estilos con `createThemedStyles((theme) => ({ … }))`: se calculan una vez por modo.
- La barra de estado sigue al modo.
- **Migración**: `app.json` mantiene `userInterfaceStyle: "light"` hasta que todas las
  pantallas usen estos tokens; después pasará a `"automatic"`. Para revisar una
  pantalla migrada en oscuro: `EXPO_PUBLIC_COLOR_SCHEME=dark npx expo start` (solo en
  desarrollo).

---

## 7. Patrones nativos **[Mejoras]**

- **Hojas**: los selectores (p. ej. la ciudad de Inicio) son hojas inferiores nativas
  (`@expo/ui` BottomSheet), no diálogos web.
- **Lectores de pantalla**: cada tarjeta tiene una etiqueta completa; los cambios de
  contenido provocados por el usuario ("Otro sitio") se anuncian; los decorativos se
  ocultan.
- **Abrir en mapas**: si un restaurante tiene coordenadas, "Ver mapa" abre la app de
  mapas del dispositivo; sin coordenadas se indica "Ubicación pendiente".

---

## 8. Migración

| Pantalla | Estado |
|---|---|
| Inicio | Migrada a MESA |
| Barra de pestañas | Migrada a MESA |
| Resto | Pendiente (usan `theme/colors.ts` y `theme/layout.ts`, obsoletos) |

Pendiente: sustituir las fotos genéricas de la ficha del restaurante
(`getRestaurantFallbackImage`) por la portada tipográfica, y unificar los textos de
estado ("Queremos ir" en la app frente a "Quiero ir" en el documento de producto).
