# Mesa · Login · Propuesta 01

Fecha: 2026-09-08.
Alcance: propuesta visual de una única pantalla a partir de la captura aportada por Paula. No modifica la aplicación.
Imagen seleccionada: [mesa-login-v1.png](mesa-login-v1.png).
Generación: herramienta integrada image_gen, seguida de un refinamiento de composición.

## Evaluación de la captura original

Se conserva la identidad terracota y crema, el logotipo con serif, la ilustración de una mesa compartida, las etiquetas visibles y el botón principal inequívoco.

Se propone corregir:
- Cabecera muy alta que desplaza el formulario y las acciones inferiores.
- Crear cuenta parcialmente oculto por la navegación del sistema.
- Recordarme y recuperación de contraseña compitiendo en una misma fila.
- Iconos de correo y candado redundantes con las etiquetas; conservar el control de mostrar contraseña.
- Espaciados y tamaños que deben adaptarse mejor a móviles pequeños y al teclado.

## Decisiones visuales

Cabecera compacta de aproximadamente una cuarta parte de la pantalla. Formulario marfil, borde superior moderadamente redondeado. Recuperación junto a la etiqueta Contraseña; Mantener sesión tiene una fila propia. Entrar domina las acciones y Crear cuenta queda visible y separado de los controles de Android.

Orientaciones para implementar, no mediciones certificadas del bitmap: márgenes de 24–28 dp; campos y botón de 56 dp; texto de campos de 16 sp; superficies interactivas de al menos 48 dp; radios de 12 dp en campos y botón; objetivo de color del botón #A6412B. Ajustar con el sistema de diseño existente. La imagen generada puede variar ligeramente en color y proporciones.

## Comportamiento para cerrar esta pantalla antes de publicar

- Usar safe-area-context y permitir desplazamiento con el teclado o el texto ampliado; contraer u ocultar decoración si hace falta.
- Email con teclado apropiado, sin autocapitalización y con autofill; contraseña compatible con gestores.
- Mantener sesión debe conservar el significado y la persistencia ya implementados.
- Mostrar carga durante el acceso y bloquear envíos repetidos.
- Mostrar errores de validación junto al campo, y errores de credenciales o de conexión de forma recuperable sin borrar el email.
- El ojo debe alternar la visibilidad y tener etiqueta accesible.
- Recuperar contraseña debe llevar a un flujo funcional, no a un aviso de próximamente.
- Crear cuenta debe abrir registro; verificar navegación atrás.
- Comprobar lector de pantalla, contraste real, teclado y texto ampliado en dispositivos Android e iOS.

## Verificación y límites

Inspección visual de la imagen: textos principales en español, formulario completo, recuperación, sesión, botón, registro y área inferior visibles. Se ha revisado el diff de los archivos añadidos.
No se ha compilado ni cambiado código móvil/backend: esta entrega contiene una imagen y su documentación. La imagen no acredita accesibilidad, funcionamiento ni aprobación de Play Store; eso requiere implementación y pruebas reales.

## Prompt inicial

Use case: ui-mockup.
Asset type: One polished, high fidelity Android mobile LOGIN screen for the existing Spanish restaurant-group app Mesa. This is a realistic implementable UI design proposal, not a marketing poster.
Input image 1 is a REFERENCE for brand identity and existing functionality, not a layout to copy exactly. Retain its warm terracotta and ivory restaurant-table illustration identity and the serif Mesa wordmark, while substantially improving hierarchy, compactness, clarity and safe-area spacing.
Output: ONE complete flat front-on app screenshot, very tall portrait approximately 1080 x 2340, proportional to a 390 x 844 dp screen. Edge-to-edge image, no device mockup frame, no presentation background, no annotations, no comparisons. All text in Spanish, perfectly typeset and crisp.

Design system: warm ivory #FAF7F2 content background, dark charcoal #28251F text, secondary text #696159. Rich terracotta #A6412B primary button and links; warm terracotta #B75035 header. White fields with fine warm-gray #BEB5AA outlines, 12dp corner radius. Matte flat interface, restrained texture only inside the illustration. Thin consistent eye icon, no oversized icons. Comfortable form text equivalent to 16dp, visible labels 14-15dp, button label 17dp semibold; generous 48-56dp touch zones. Screen gutters 28dp.

Layout, in logical 390x844 coordinates:
- Top header height about 238dp including a realistic 30dp Android status bar showing 11:53 and small connection/battery icons in ivory.
- Compact brand at x28 y62: small 34dp rounded ivory square containing serif italic M, and adjacent serif wordmark 'Mesa' in ivory around 32dp. Much smaller than the reference.
- Header lower-left: the reference slogan in an elegant ivory serif, about 22dp, neatly in four short lines: 'Los mejores planes' / 'empiezan alrededor' / 'de una mesa.' It fits in the left 225dp area beneath the brand.
- Lower-right of header: delicate elegant cream line illustration of a dining plate with a small leaf garnish, folded napkin, fork and a small glass, inspired by the reference's tabletop illustration, cropped decoratively at the right edge. Keep decoration confined to header, no collision with text; it occupies under a quarter of total screen.
- Warm ivory main surface begins around y238, upper corners gently rounded 26dp, no raised card shadow.
- Main title at x28 y269, 'Qué bien verte' in bold clean sans approximately 29dp. Under it, at y312, secondary text 'Entra y vuelve a compartir buenos planes.' in 15dp, at most two neatly spaced lines.
- Email label 'Email' at y366. Full-width 56dp white input at y389 with placeholder 'tu@email.com'. No leading icon.
- Password label 'Contraseña' at y475, with terracotta text link '¿La has olvidado?' aligned right on the same row, clearly legible and with separate touch space.
- Password input y498 h56, neutral example '••••••••' at left and a discreet outlined show-password eye at right.
- At y581 a checked terracotta checkbox plus 'Mantener sesión' in dark text, on its own uncluttered row. No extra right-hand link on this row.
- Primary full-width button at y619 h56, rich dark terracotta fill, radius12, centered white label 'Entrar'. Strong clear focus of the form, no gradient.
- At y716, fully visible centered secondary action on one line: '¿Aún no tienes cuenta? Crear cuenta' where 'Crear cuenta' is semibold terracotta and the preceding text is medium gray. Keep it well above the OS navigation, not faded.
- Preserve breathable empty ivory space below the signup row. Bottom Android system navigation area in matching ivory at y816-844 with subtle square, circle, triangle controls, no content underneath it.

No social login buttons, no new features, no legal footer, no tab bar, no giant unused header, no photo backgrounds, no gradients, no excessive pill-shaped containers, no low-contrast actions, no clipped text. The result should feel warm, recognizable as Mesa, professional, attractive, and practical on a real small Android phone.

## Prompt final de refinamiento

Referencia de esta segunda llamada: primera imagen generada. Imagen final seleccionada: mesa-login-v1.png.

Refine the supplied generated Mesa login design with ONE targeted goal: make it a more compact, cleaner, professional everyday login layout with the decorative header reduced to 25% of screen height. Preserve the Mesa identity, all existing Spanish text verbatim, all fields and actions, the hand-drawn tabletop style, the overall tall 390x844 Android screenshot aspect ratio. One flat complete screen only, no frame or annotations.
At logical 390x844 dp: header ends at y214 instead of about y280. Brand row near y60 is 36dp high; wordmark Mesa about32dp. Slogan now small elegant serif20dp in three lines below it, left of a much smaller cropped tabletop illustration. Keep the entire illustration inside the header, never touching form content. Reduce the dominant greeting to a polished bold clean sans29dp, at x28 y252. Subtext15dp at y295. Email label y350, white email input y374 height56. Password label and right aligned recovery link y457, password input y480 height56. Maintain checked 'Mantener sesión' on its own row y565. Primary 'Entrar' button y610 height56, solid rich dark terracotta #A6412B with WHITE crisp17dp semibold text, absolutely NO texture, shadow or gradient. '¿Aún no tienes cuenta? Crear cuenta' row around y711, clearly visible with high contrast. Ivory empty safe space below until Android navigation area at bottom.
Both fields must be 56dp high, their corners12dp; input text16dp, eye small22dp. Warm ivory main surface is a perfectly clean flat solid fill, not a paper texture or photo; no soft focus or gradient anywhere outside the header illustration. Top corners of form surface24dp, not exaggerated curves. Uniform 28dp side margins. Make typography clean and moderate rather than oversized. Fully preserve Spanish accents, functionality and original Mesa serif wordmark. Keep enough space for real touch targets. No new elements.

