# MESA — Previsualización independiente

Diseño local con datos ilustrativos. No modifica la aplicación React Native ni el backend y no realiza operaciones reales de cuenta.

## Abrir
Desde esta carpeta, ejecutar `node server.cjs` y abrir:
- Inicio con contenido: http://127.0.0.1:8770/?mode=app&screen=home&state=content
- Inicio vacío: http://127.0.0.1:8770/?state=empty
- Acceso: http://127.0.0.1:8770/?mode=auth
- Identidad: http://127.0.0.1:8770/brand.html

## Revisión de Inicio — 2 de octubre de 2026
La última revisión recupera una invitación con dos acciones, tarjetas de grupo con fotos y recuentos, fotografía de mayor presencia en la recomendación y actividad directamente sobre el fondo, con separadores finos. Conserva Inter, crema, terracota y oliva. Terracota identifica acciones principales; oliva, contexto, estados y navegación seleccionada.

La sugerencia utiliza restaurantes guardados en grupos propios de la ciudad seleccionada. Prioriza los que tienen fotografía cuando los hay. La primera selección favorece un favorito valorado; Otro sitio cambia a otro nombre de forma aleatoria. No representa una recomendación comercial externa.

Las imágenes de restaurante y las identidades de las personas son ilustrativas. Los perfiles sin fotografía muestran su inicial. Las ubicaciones ausentes se indican sin ofrecer una acción de mapa. Los controles y la actividad usan datos de demostración.

Cambios: app.js (composición de invitación y selección de restaurante), styles.css (jerarquía, fotografía, tarjetas de grupo y actividad sin contenedor), esta documentación y las tres capturas de Inicio. Acceso y marca conservan el diseño aprobado.

## Comprobaciones
- `node --check app.js`: correcto.
- Revisión visual de Inicio a 360 y 390 píxeles; sin desbordamientos horizontales en las tarjetas.
- Recursos de imagen cargados y consola sin errores en la revisión.
- Otro sitio cambia la tarjeta y mantiene la posición con el control completamente visible.
- Capturas actualizadas: mesa-inicio-contenido.png, mesa-inicio-recomendacion.png y mesa-inicio-contenido-actividad.png.

## Comprobación manual
Abrir Inicio, recorrer grupos, recomendación y actividad. Pulsar Otro sitio, Ver restaurante y Ver mapa. Revisar la invitación con Ver detalles y volver. El estado content se reinicia al recargar.

La validación corresponde a esta previsualización HTML. No se ha validado ni implementado esta revisión en la aplicación nativa; tampoco se han probado servicios reales ni realizado pruebas de uso con personas.


## Perfil — revisión de diseño
- Tarjeta de identidad con foto, botón visible Editar perfil y resumen de sitios únicos guardados en los grupos donde participa la persona, grupos propios y valoraciones escritas por ella. Se excluyen grupos seguidos del resumen.
- Invitaciones pendientes con contador calculado y acceso al detalle. No se inventan solicitudes ni cifras; las solicitudes de administración siguen dentro de su grupo público.
- Cuenta y privacidad en un bloque; notificaciones, ayuda y acerca de Mesa en otro. Se conservan los destinos existentes.
- Cerrar sesión conserva la confirmación de la previsualización.
- Comprobado a 390 × 844 y 360 × 800, sin desbordamientos ni imágenes rotas. Se conserva el desplazamiento para llegar a Cerrar sesión en móviles pequeños.
- Verificados Editar perfil y el recorrido Invitaciones → detalle → volver. `node --check app.js` correcto.
- Archivos modificados: app.js, styles.css, icons.json (icono de información), README.md y mesa-perfil.png. No se ha modificado ni validado la aplicación nativa.
- Abrir: http://127.0.0.1:8770/?mode=app&screen=profile&state=content

- Afinado visual posterior: identidad reunida en una tarjeta, iconos sobre superficies suaves, invitaciones sobre blanco e indicador terracota. Recuentos alineados incluso cuando las etiquetas ocupan dos líneas.
- Verificados de nuevo Editar perfil y la confirmación de Cerrar sesión, sin ejecutar el cierre; área de edición de 44 px. Captura mesa-perfil.png actualizada.

## Editar perfil — diseño y previsualización
- Foto de perfil con selector JPG, PNG o WebP (hasta 5 MB) y vista previa local. Nombre, usuario con prefijo @ y correo editable.
- Acción Guardar cambios al pie, desactivada mientras no haya modificaciones. Validación de nombre, usuario y correo; foco en el campo incorrecto.
- Al volver con modificaciones se ofrece descartarlas o seguir editando. El borrador conserva los valores escritos y la foto al abrir esa confirmación.
- Guardar vuelve al Perfil y conserva la asociación del nombre con miembros y valoraciones de los datos de muestra. No se realizan envíos ni verificación real del correo.
- Comprobaciones: diseño a 360 × 800 y 390 × 844 sin desbordamientos; botón activado al editar; usuario inválido rechazado; nombre guardado con foto y recuentos conservados; selección de un WebP local; aviso al volver con cambios. No se ha verificado el teclado del móvil nativo.
- Archivos: app.js, styles.css, icons.json (cámara y flecha), README.md, mesa-editar-perfil.png. `node --check app.js` correcto.
- Abrir http://127.0.0.1:8770/?mode=app&screen=edit-profile&state=content ; modificar un campo y guardar para revisar el resultado. Cambiar foto permite probar una imagen local. En modo content los datos se restablecen al recargar.

## Cuenta y seguridad — revisión de diseño
- Información de acceso agrupada: correo, usuario y antigüedad de la cuenta cuando ese dato existe. La fecha de septiembre de 2026 corresponde al perfil de muestra.
- Acceso claro a Editar correo y usuario; contraseña en Seguridad. Privacidad y notificaciones mantienen sus accesos propios desde Perfil.
- Eliminar cuenta utiliza el tono terracota y conserva el diálogo existente para revisar antes los grupos administrados. No se ha realizado ninguna eliminación ni cambio de contraseña.
- Comprobado a 360 × 800 y 390 × 844 sin desbordamientos. Verificados los accesos a edición, contraseña y diálogo de eliminación/cancelación. `node --check app.js` correcto.
- Archivos actualizados: app.js, styles.css, README.md y mesa-cuenta-seguridad.png.
- Abrir http://127.0.0.1:8770/?mode=app&screen=settings&state=content ; comprobar las tres acciones y volver a Perfil. Esta revisión corresponde a la previsualización local, sin integración nativa o servicios reales.

## Criterio para las próximas pantallas
Las capturas proporcionadas son ejemplos, no plantillas ni un objetivo de reproducción. Buscar referencias externas pertinentes para cada pantalla, distinguir inspiración visual de reglas de interacción y justificar las decisiones por la tarea de Mesa. Conservar la identidad aprobada y analizar jerarquía, contenido, tipografía, densidad, color, estados y facilidad de uso. Tras diseñar, inspeccionar la pantalla renderizada y corregir problemas concretos; no cambiar elementos solo para diferenciarse ni declarar perfección absoluta.

Revisión crítica de Cuenta: se ha retirado el rótulo Zona de peligro por redundancia con el tratamiento visual de la acción. El paso Revisar mis grupos ahora se presenta y ejecuta como navegación, sin estilo de eliminación. Verificada la navegación a Grupos. Fuentes consultadas: https://developer.apple.com/design/human-interface-guidelines/settings y https://developer.apple.com/design/human-interface-guidelines/buttons ; las guías informan el criterio, no demuestran por sí solas la calidad del resultado de Mesa.

## Privacidad — revisión de diseño
- Ajuste real comprobado en los tipos y pantalla nativa: groupInvitationsEnabled. Se retiran de esta pantalla los controles de perfil público y actividad pública que la previsualización anterior había inventado.
- Invitaciones: interruptor oliva con área de 48 px, descripción y consecuencia visible al activarlo/desactivarlo. La confirmación posterior especifica que se guarda en la previsualización.
- Información compartida en filas sin tarjeta exterior ni flechas, para distinguirla de los controles. Correo privado y datos visibles dentro del grupo.
- Permisos y datos agrupa dos accesos. Cuenta y datos abre Cuenta y seguridad. Permisos muestra un aviso honesto sobre el acceso a los ajustes nativos; el HTML no cambia permisos del dispositivo.
- Referencias consultadas: Apple Privacy (https://developer.apple.com/design/human-interface-guidelines/privacy/), Apple Settings (https://developer.apple.com/design/human-interface-guidelines/settings) y Signal sobre separar visibilidad de contacto (https://support.signal.org/hc/en-us/articles/6712070553754-Phone-Number-Privacy-and-Usernames). Son referencias de interacción, no plantillas visuales copiadas.
- Revisión visual a 390 x 844 y 360 x 800: sin desbordamiento horizontal, texto completo, jerarquía y separación de contenidos revisadas. Comprobados interruptor en ambos estados, aviso de permisos y navegación a cuenta. node --check app.js correcto. No se ha modificado ni verificado la aplicación nativa; no hay guardado en servidor o permisos reales.
- Archivos: app.js, styles.css, README.md, mesa-privacidad.png; paquete ZIP actualizado.
- Prueba manual: abrir http://127.0.0.1:8770/?mode=app&screen=privacy&state=content ; alternar Recibir invitaciones, abrir Permisos del dispositivo y Cuenta y datos. En modo content los datos de muestra se restablecen al recargar.

## Notificaciones — diseño revisado
- Se muestran las cinco preferencias existentes en Mesa: notificationsEnabled, newRestaurantsEnabled, restaurantStatusEnabled, ratingsEnabled y groupActivityEnabled. No se incorporan categorías o permisos nuevos.
- Control general separado de las cuatro categorías, textos de 14/12 px, interruptores con área de 48 px y oliva para estado activado. Se conserva Inter y la paleta aprobada.
- Pausar los avisos deshabilita las categorías sin borrar la selección; un mensaje explica cómo recuperarla. La confirmación tras cambiar especifica el guardado en esta previsualización.
- Invitaciones y grupos agrupa avisos de invitación y actividad conforme al servicio actual. Permitir recibir avisos no cambia la preferencia de privacidad sobre recibir invitaciones.
- Fuente consultada: https://developer.apple.com/design/human-interface-guidelines/managing-notifications ; informa la claridad y elección de categorías, no garantiza el acabado visual de Mesa.
- Comprobado: node --check app.js y evaluación aislada del renderizado con Node (cinco interruptores, cuatro deshabilitados al pausar, preferencias conservadas al reactivar). Servidor local iniciado con node server.cjs.
- Actualización de revisión: inspección visual de Notificaciones y Perfil completada en el navegador local. Se comprobó el estado pausado (categorías bloqueadas y selección conservada) y la vista normal. Ajuste de densidad para que las categorías y el mensaje de guardado quepan mejor en el alto disponible. La pausa y las preferencias siguen siendo estado de la previsualización, no cambios enviados al servidor ni a la app nativa.
- Archivos modificados: app.js, styles.css y README.md. Paquete ZIP actualizado.
- Prueba manual: abrir http://127.0.0.1:8770/?mode=app&screen=notification-settings&state=content ; desactivar una categoría, pausar Recibir notificaciones y volver a activarlo. La categoría previamente apagada debe seguir apagada. Volver a Perfil y comprobar navegación. En modo content, recargar restablece los datos de muestra.


## Mis grupos — diseño final de la previsualización
- Un único título y Crear grupo compacto en la cabecera. La búsqueda conserva el foco y busca por nombre o ciudad; se informa cuando no hay coincidencias.
- Se muestran invitaciones pendientes reales de los datos de muestra, con aceptación y detalle. No se inventan recuentos de miembros de grupos a los que aún no se ha accedido.
- Grupos separados entre participación (Con tu gente) y seguimiento (Grupos que sigues). Tarjetas blancas con nombre, privacidad, ciudad, restaurantes guardados, miembros y pendientes por probar calculados a partir de los datos disponibles.
- Fotos pequeñas cuando existen y letras como respaldo. Sin iniciales gigantes ni fechas de actividad inventadas. La paleta aprobada se mantiene: terracota para acciones, oliva para información de planes y sage para la invitación.
- Estado vacío sin buscador inútil ni dos botones de creación; una acción principal y acceso a grupos públicos. El escenario vacío del estudio también se conserva.
- Corregido el bloqueo de la cabecera mientras se abre el diálogo de invitación. El grupo público seguido de muestra ahora tiene following=true; dejar de seguirlo lo retira de esta lista.
- Fuentes de referencia: listas compartidas y seguidas de Google Maps (https://support.google.com/maps/answer/7280933?hl=en-IN) y colaboración en listas de Airbnb (https://www.airbnb.com/help/article/1236). No se reproducen sus pantallas ni se incorporan votos o calendarios ajenos al alcance de Mesa.
- Revisión visual completada a 390 x 844 y 360 x 800: sin desbordamiento horizontal ni fotos rotas; comprobada también la parte inferior desplazable. Se ajustó la altura de las tarjetas tras renderizar. Verificados búsqueda por ciudad y sin resultados, detalles y aceptación de invitación, creación, navegación a grupo, exploración pública y retirada de un grupo seguido. node --check app.js correcto.
- Archivos actualizados: app.js, styles.css, README.md, mesa-mis-grupos.png, mesa-mis-grupos-continuacion.png y mesa-grupos-vacio.png. ZIP actualizado. No hay cambios en mobile/ o backend/; las acciones operan sobre la muestra local.
- Abrir http://127.0.0.1:8770/?mode=app&screen=groups&state=content ; buscar Girona, abrir un grupo y revisar una invitación. Para vacío: http://127.0.0.1:8770/?mode=app&screen=groups&state=empty . Recargar mode=content repone los datos de muestra.

## Invitación pendiente — revisión común para Inicio y Mis grupos
- Se sustituye el bloque verde con dos botones anchos por una superficie blanca con el mismo borde y radio que las tarjetas de Mesa. Icono de correo en el tono suave usado ya en Perfil; nombre de grupo destacado, remitente y estado en segundo nivel.
- Una acción Aceptar compacta y terracota; Ver invitación como enlace secundario con flecha. Ambas mantienen 44 px de altura táctil. Se usa un único componente invitationNotice en las dos pantallas para evitar diferencias de diseño y texto.
- Varias invitaciones dan acceso a la lista completa y mantienen la aceptación vinculada a la invitación mostrada. Ajustado el espacio antes de Tus grupos en Inicio.
- Inspección visual en Inicio y Mis grupos, a 360 x 800 y 390 x 844. Sin desbordamiento horizontal. Comprobados detalle, cierre y aceptación en los datos de muestra. node --check app.js correcto.
- Archivos modificados: app.js, styles.css, README.md, mesa-invitacion-inicio.png y mesa-mis-grupos.png. ZIP actualizado. Las comprobaciones corresponden al prototipo local.
- Probar: abrir Inicio o Mis grupos con state=content, pulsar Ver invitación y Cerrar; después Aceptar abre el grupo. Recargar restablece la invitación de muestra.

## Invitación pendiente — diferenciación del aviso
- La revisión blanca anterior se confundía con las tarjetas de grupos. Sustituida en Inicio y Mis grupos por un aviso cálido con acento lateral terracota, etiqueta e icono de correo discretos.
- Mensaje humano explícito: Carlos te invita a unirte a [grupo]. Acción Aceptar invitación y enlace Ver detalles. El tratamiento terracota comunica una respuesta pendiente dentro de la marca; no utiliza iconos de error ni advertencias.
- Revisión visual completada en las dos pantallas a 360 x 800 y 390 x 844. Sin desbordamiento horizontal; áreas de las dos acciones de 44 px. Comprobados Ver detalles y cierre; se conserva el controlador de aceptación ya verificado en la revisión anterior. node --check app.js correcto.
- Actualizados app.js, styles.css, README.md, mesa-invitacion-inicio.png y mesa-mis-grupos.png; paquete ZIP regenerado. Todo corresponde a la previsualización local.

## Invitación integrada — revisión de acabado
Se elimina el bloque cálido y la franja lateral. La invitación queda como una sección sin tarjeta, con estado en oliva, nombre del grupo, remitente y acción de aceptar delineada en terracota. Compartida entre Inicio y Mis grupos. Revisadas visualmente a 390 × 844 y 360 × 800; sin desbordamiento horizontal en Inicio, acciones de 44 px. Ver detalles abre el diálogo correcto. node --check app.js correcto. Solo cambios en la previsualización independiente (app.js y styles.css).


## Comparación de invitaciones
Abrir invitaciones.html: cuatro propuestas navegables (personal, tarjeta, compacta, salvia), selector Inicio/Mis grupos y enlaces de cada variante a tamaño real. app.js activa variantes solo mediante el parámetro invitation; styles.css contiene sus estilos. Revisadas las cuatro variantes en ambas pantallas. node --check app.js correcto. Sin cambios en mobile ni backend.


## Revisión de invitación personal
Nueva versión predeterminada en Inicio/Mis grupos: sección Invitaciones, remitente con foto de muestra, estado pendiente, grupo y acciones Ver invitación/Aceptar. Se reutiliza un retrato de muestra del prototipo para representar al remitente ficticio; no es una fotografía real de Carlos. Versiones anteriores siguen solo como comparación descartada. Revisada en 390 × 844 y 360 × 800; apertura de detalles correcta, acciones de 44 px, Inicio sin desbordamiento. node --check correcto. Cambios exclusivamente en el prototipo local.


## Invitación discreta — revisión
Sustituida la sección con tarjeta por una fila de 68 px: retrato de muestra de 28 px, Invitación de Carlos, grupo y acceso Ver. Sin título de sección, fondo de color ni botón de aceptar en el listado. Abre el detalle existente para aceptar o rechazar; múltiples invitaciones abren su lista. Referencias consultadas: ayuda de Figma Accept invitations (incluida captura real) y Apple How to accept a shared album invitation. Revisados Mis grupos a 390 × 844 e Inicio a 360 × 800, sin desbordamiento en Inicio. Apertura de detalles correcta, node --check app.js correcto. Solo prototipo local.


## Invitación con presencia moderada
Fila compacta de 86 px con superficie blanca y borde suave: estado Invitación pendiente, grupo con mayor peso, remitente y acceso Ver. Sin sección independiente ni CTA sólido. Revisada en Mis grupos (390 × 844) e Inicio (360 × 800); sin desbordamiento en Inicio. node --check app.js correcto. Sin cambios en la aplicación nativa.


## Identificación de invitación compacta
Se conserva la composición compacta y se añade superficie salvia tenue, borde acorde y sobre junto a Invitación pendiente en terracota. Se distingue de las tarjetas blancas de grupos sin aumentar su tamaño ni introducir un CTA sólido. Revisada visualmente en Mis grupos 390 × 844 e Inicio 360 × 800. node --check app.js correcto. Cambios en app.js/styles.css del prototipo local únicamente.


## Invitación como mensaje personal — revisión de composición
Nueva composición: retrato, frase Carlos te ha invitado al grupo…, estado pendiente y acciones de texto Aceptar/Ver invitación. Superficie blanca sin relleno salvia ni títulos de grupo separados. Referencia visual inspeccionada: Pivot (https://pivot.app/platform). Revisadas Mis grupos 390 × 844 e Inicio 360 × 800. Detalles correctos y aceptación local comprobada (crea el grupo y muestra confirmación); Inicio sin desbordamiento, botones de 44 px. node --check app.js correcto. Datos de muestra; ningún cambio en mobile/backend.

