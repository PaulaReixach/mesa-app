# Mesa: revisión de producto, UX y preparación de lanzamiento

7 de septiembre de 2026 · Dirección recomendada: **Sobremesa**.

Mesa tiene una base funcional considerable. Mi recomendación es cerrar el recorrido de guardar y compartir restaurantes, corregir los obstáculos localizables en el código y sacar una beta pequeña.

Esta es una revisión del repositorio y un estudio de diseño navegable. No es una prueba de la app instalada, una auditoría completa de seguridad ni investigación con usuarios. Las hipótesis de UX necesitan validación. Las personas, pertenencias, notas y puntuaciones del prototipo son ejemplos; las ubicaciones del mapa proceden de OpenStreetMap.

## Lo que conservaría

- **La necesidad concreta:** reunir recomendaciones dispersas y decidir con un grupo conocido. “Tus sitios, con tu gente” explica bien el producto.
- **El grupo como contexto:** la lista y la valoración tienen sentido dentro de una pareja, viaje o grupo de amigos. Mostrar ese contexto evita confundir opiniones públicas y privadas.
- **El monolito modular:** API, aplicación, dominio e infraestructura resultan proporcionados. No introduciría microservicios.
- **La base móvil:** Expo Router, TypeScript, cliente HTTP común, contexto de autenticación y SecureStore.
- **El trabajo de estados y permisos:** hay carga, errores, vacíos, roles, invitaciones y solicitudes. Conviene pulir sus inconsistencias.
- **Entrada manual y búsqueda acotada:** el cliente de Nominatim ya incorpora caché y limitación de frecuencia.
- **Valoraciones simples:** puntuación de 1 a 5, media del grupo y pruebas de resumen. No añadiría cinco subpuntuaciones al primer lanzamiento.
- **La personalidad cálida:** terracota, oliva y fondos suaves encajan con comida y conversación.

## Hallazgos prioritarios

P0 = resolver antes de enviar a revisión; P1 = resolver antes de abrir la beta a desconocidos; P2 = mejora posterior o deuda acotada. Es mi criterio de lanzamiento, no una certeza de rechazo por las tiendas.

| Prioridad | Evidencia actual | Consecuencia y propuesta |
| --- | --- | --- |
| P0 | mobile/src/app/(auth)/register.tsx, función handleLegalPress: “disponible próximamente”. | Se pide aceptar documentos que no se pueden leer. Publicar documentos reales, accesibles antes del registro y desde Perfil. Los ajustes de privacidad no sustituyen la política. |
| P0 | No localicé un flujo de denunciar contenido/bloquear usuarios en las rutas, servicios y controladores revisados. Sí hay grupos públicos y contenido aportado por usuarios. | Definir mecanismos accesibles, respuesta a denuncias y contacto. La salida privada reduce complejidad, pero no elimina automáticamente obligaciones aplicables al contenido de usuarios. |
| P1 | mobile/src/app/(auth)/login.tsx:114, handleForgotPassword, solo abre un aviso. | Quien olvide su contraseña pierde acceso. Implementar enlace de un solo uso, caducidad y confirmación neutral. El prototipo diseña ese flujo; no envía correo. |
| P1 | PrivateGroupDetailScreen.tsx:138 usa restaurants.slice(0, 3) y renderiza esa colección sin acceso a la lista completa en esa pestaña. | Los sitios posteriores al tercero no están en la lista del grupo, aunque puedan encontrarse por otras vías. Mostrar lista completa y filtros; virtualizar cuando proceda. |
| P1 | El CTA de añadir está bajo isOwner, alrededor de la línea 356. GroupService.validateRestaurantManagementAccess permite gestionar sitios a miembros privados. | La UI restringe una acción permitida por el backend. Mostrar “Añadir restaurante” a miembros privados autorizados; conservar los permisos de colaboradores públicos. |
| P1 | RestaurantStatusSection.tsx ofrece FAVORITE y está conectado al detalle. GroupRestaurant.validateSelectableStatus lo rechaza; V101 prohíbe ese estado. | Opción visible incompatible con el dominio. Sacar “Favorito” del selector y usar el booleano y servicio existentes. No cambiar migraciones ejecutadas. |
| P1 | auth-context.tsx, restoreSession, elimina el token ante cualquier excepción. | Un fallo de red al abrir la app puede convertirse en sesión perdida. Diferenciar credencial inválida y error temporal; ofrecer reintento conservando la sesión cuando corresponda. |
| P1 | HomeScreenRefined.tsx, pickRecommendation, ordena todos los candidatos por media, cantidad de valoraciones y actualización. | Puede elegir “No repetir” o “Archivado”. Excluirlos y separar “Por probar” y “Para repetir”. Sin opiniones no afirmar “la mejor valorada”. |
| P1 | restaurant-images.ts elige una imagen de respaldo mediante hash del nombre; se usa en Inicio, Mapa y detalle. | La imagen genérica puede parecer foto real del local. Usar monograma o ilustración neutra cuando no haya fotografía autorizada. |
| P1 | 76 apariciones de allowFontScaling=false en TSX, además de etiquetas de navegación sin escalado. | Se pierde la preferencia de letra grande. Habilitar escalado y reflow; probar nombres largos antes de ajustar alturas. |
| P1 | PrimaryButton.tsx: blanco de 16 sobre #C9684E; contraste calculado **3,77:1**. | Inferior a 4,5:1 para texto normal según WCAG. Propuesta #A6412B: **6,15:1** con blanco. Es una medición de esa pareja, no una certificación de toda la UI. |
| P1 | mobile/app.json solicita RECORD_AUDIO; los selectores localizados usan solo imágenes. | No encontré una función de audio que lo justifique. Revisar manifest final y deshabilitar el permiso que agregue el plugin si no se necesita. |
| P2 | Inicio enriquece hasta cuatro grupos con miembros, actividad y restaurantes: hasta 14 peticiones de esa función. Varios errores se convierten en listas vacías. | Medir en red lenta. Distinguir “sin actividad” de “actividad no disponible”, conservar contenido previo y valorar después un resumen agregado o caché compartida. |
| P2 | PROJECT_CONTEXT_MESA.md describe PostgreSQL y móvil como pendientes y cita Photon; ya hay PostgreSQL, Expo y Nominatim. | Actualizar la fuente de contexto. Limpiar nombres Refined/Polished y reexportaciones de forma acotada al consolidar cada pantalla. |

Referencias: [Apple, UGC y política de privacidad](https://developer.apple.com/app-store/review/guidelines/), [Google: moderación de UGC](https://support.google.com/googleplay/android-developer/answer/12923286?hl=en), [WCAG 2.2: contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Tres conceptos de UI/UX

| Dirección | Diseño | Encaje y coste |
| --- | --- | --- |
| **Sobremesa — recomendada** | Crema, terracota profundo, oliva de apoyo, títulos serif puntuales, filas compactas y acciones legibles. | Parejas y grupos pequeños. Evoluciona la identidad actual; reutilizar Inter para UI y una serif solo en títulos. |
| **Cuaderno** | Sans serif, cabecera baja, verde oscuro, radios pequeños y listas más densas. | Consulta frecuente de muchas listas. Menos expresivo en la tienda, más directo para el uso habitual. |
| **Barra** | Vino, composición recta, títulos sans serif y detalles de color contenidos. | Marca sobria y urbana. Mayor distancia respecto al Mesa actual; validarlo antes de cambiar la marca. |

Las tres direcciones se aplican a las mismas pantallas mediante los controles de diseño. Cambian títulos, cabecera, ritmo, radios y colores, conservando funciones y jerarquía.

Principios: mostrar siempre el grupo de destino; contenido útil pronto; una acción principal por decisión; ausencia de valoración distinta de puntuación baja; favorito independiente de visita; falta de foto/ubicación/conexión prevista; permisos coherentes con el dominio.

## Navegación y recorrido

Mantendría **Inicio · Grupos · Añadir · Mapa · Perfil**, reutilizando la navegación. El botón central debe tener etiqueta visible.

“Añadir” abre la búsqueda de restaurante. Dentro de un grupo conserva el destino; fuera permite elegirlo al guardar. “Crear grupo” queda en Grupos; invitaciones, en Actividad y detalle del grupo. El centro actual de cuatro acciones añade una decisión al gesto más frecuente.

Primer uso: bienvenida breve → registro → crear grupo → guardar primer sitio → invitar cuando tenga sentido. Permitir empezar con un grupo de una persona. “Ver un ejemplo” es una demostración local propuesta; portarlo exige separarlo de datos privados.

Uso recurrente: grupo → pendientes → restaurante → decidir → valorar después. No prometer reservas, rutas, IA o planificación con fecha sin una función real detrás.

## Pantallas diseñadas

| Vista | Cambio principal | Correspondencia |
| --- | --- | --- |
| 01 Inicio | Grupo reciente, pendientes y búsqueda directa; actividad secundaria. | /home, HomeScreenRefined. |
| 02 Tus grupos | Mis grupos y Siguiendo; crear accesible, público en segundo nivel. | /groups y /groups/explore. |
| 03 Grupo | Lista completa, filtros y pestañas Sitios/Miembros/Actividad. | /groups/[groupId]. |
| 04 Añadir | Nombre/ciudad y búsqueda enviada por el usuario. | restaurants/create. |
| 05 Guardar | Destino explícito, nota opcional, confirmación y duplicado. | Paso visual del formulario; no exige nueva API por sí solo. |
| 06 Restaurante | Estado, media con denominador, mi puntuación, dirección y nota. | restaurants/[groupRestaurantId]. |
| 07 Valorar | Escala de 1 a 5 y una acción de guardar. | RestaurantRatingsSection; payload actual. |
| 08 Mapa | Contexto del grupo y acceso a ficha; sin ubicación personal obligatoria. | /map. |
| 09 Crear grupo | Nombre primero, privacidad explicada, ciudad opcional. | /groups/create. |
| 10 Invitar | Buscar usuario/correo, enviar y ver pendiente. | Miembros e invitaciones existentes. |
| 11 Actividad | Invitaciones accionables y novedades contextualizadas. | /notifications y /group-invitations. |
| 12 Perfil | Identidad y accesos simples a cuenta/privacidad. | /profile y ajustes. |
| 13 Bienvenida | Beneficio visible y tres pruebas concretas. | /onboarding. |
| 14 Acceder | Campos legibles y recuperación visible. | /login. |
| 15 Registro | Mantiene los cuatro campos del contrato actual. | /register; documentos reales pendientes. |
| 16 Grupo público | Seguir primero; guardar copia y colaborar son decisiones distintas. | /groups/public/[groupId]. |
| 17 Manual | Nombre obligatorio; ausencia de mapa explicada. | Modo MANUAL existente. |
| 18 Primer uso | Una tarea clara; sin estadísticas de cero. | Variante vacía de Inicio/Grupos. |
| 19 Error | Explica qué falló y permite reintentar. | Patrón compartido. |
| 20 Cargando | Esqueletos estables, sin movimiento continuo. | Patrón compartido. |
| 21 Recuperar acceso | Solicitud y confirmación neutral. | **Requiere backend/correo nuevos**. |

Edición de perfil/grupo/restaurante, colaboración, propuestas, copiar, soporte, preferencias, cambio de contraseña y eliminación conservan sus flujos. Se aplicarían los mismos encabezados, campos, filas y confirmaciones. En esta entrega tienen especificación de patrón, **no pantallas adicionales completas ni implementación en React Native**. Algunos accesos secundarios del prototipo muestran un aviso con la intención.

## Sistema visual y adaptación móvil

- Fondo #FAF7F0; superficie #FFFFFF; texto #2D3025; secundario #6B6D60.
- Acción #A6412B: blanco 6,15:1. Secundario sobre fondo: 4,93:1.
- Oliva #526043 y salvia #E9EDDF para contexto y estados.
- Prototipo: DM Sans y Fraunces. App: **reutilizar Inter** y adoptar serif para títulos solo si compensa. La jerarquía no exige migrar todos los textos.
- Lectura 15–16; formularios 16; secciones 22–24; títulos 30–35; información auxiliar 12–13. Mantener tamaño dinámico.
- Ritmo 4/8; márgenes 20–24; campos/botones 52; iconos táctiles al menos 44. En Android, objetivos cómodos de 48 dp al portar.
- Radios 16–18; filas con separador fino; sombra solo para elevación real.
- SafeAreaView/insets; teclado sin tapar Guardar; conservar cambios de formulario.
- Sin foto: monograma o ilustración neutra, sin atribuir imágenes ajenas al local.
- Favorito **por grupo**, coherente con el servicio actual. Revisar el histórico: V101 propagó favoritos entre relaciones del mismo restaurante. No reejecutar ni reescribir esa migración.

## Estados y aceptación

| Situación | Respuesta esperada |
| --- | --- |
| Sin grupos | Crear primero; puede empezar una persona. |
| Grupo vacío | Añadir sitio; sin recomendaciones ficticias. |
| Búsqueda vacía | Conservar consulta/ciudad y ofrecer entrada manual. |
| Duplicado | Indicar grupo, abrir existente y evitar copia. |
| Sin opiniones | “Aún no hay valoraciones”, sin 0/5. |
| Guardado fallido | Conservar campos/destino y reintentar sin duplicar. |
| Error parcial | Conservar bloques disponibles, identificar el fallido. |
| Ubicación denegada | Lista y mapa disponibles; permiso al pedir cercanía. |
| Sin coordenadas | Disponible en lista; explicar ausencia de mapa. |
| Sesión inválida | Pedir acceso; distinguir fallo de red. |
| Miembro privado | Añadir/valorar según permisos reales. |
| Colaborador público | Proponer y ver pendiente, sin aparentar edición directa. |
| Letra grande/nombre largo | Varias líneas; ninguna acción recortada. |

Validación propuesta: cinco personas representativas crean grupo, guardan sitio, aceptan invitación y valoran sin instrucciones paso a paso. Objetivo orientativo, **aún no medido**: completar sin ayuda y explicar quién ve la lista y de dónde sale la media. Registrar dudas antes de ampliar alcance.

## Orden para lanzar

**A. Cerrar bloqueos.** Selector de favoritos, lista incompleta, CTA según permisos, recuperación, sesión ante fallo de red y contraste. Documentos, denuncia/bloqueo y su operación. Verificar eliminación de cuenta contra la base de datos: ya hay pantalla y servicio. La implementación elimina los grupos propios; el texto debe explicar esa consecuencia.

**B. Consolidar el recorrido.** Tokens y patrones en este orden: grupo → guardar → restaurante/valoración → Inicio → resto. Conservar rutas, auth, cliente y contratos. Hacer cada bloque verificable en Android e iOS.

**C. Beta y ficha.**

- Backend HTTPS disponible, datos de prueba, recuperación y cuenta de revisión.
- Builds firmadas en dispositivos: fotos, mapa, segundo plano, teclado y enlaces.
- Declaraciones de datos coherentes con correo, avatar, ubicación, push y proveedores.
- Google: recurso web para solicitar eliminación sin reinstalar, además de la opción dentro de la app. [Requisitos de eliminación](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en).
- Para cuentas personales de Play creadas después del 13/11/2023: **12 testers inscritos durante 14 días continuos**, después solicitar acceso a producción; no es aprobación automática. [Requisito oficial](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).
- Capturas reales con mensajes “Guarda los sitios que te recomiendan”, “Una lista con tu gente”, “Vuestras opiniones, en un sitio”. Estos conceptos no son capturas de una app ya implementada.
- Verificar requisitos de SDK, firma, clasificación y metadata al enviar. No se consultaron las cuentas de desarrollador.

El objetivo histórico de coste 0 debe distinguir infraestructura y distribución: inscripción estándar de Google de 25 USD una vez; Apple 99 USD/año o precio local, con excepciones elegibles. [Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en), [Apple](https://developer.apple.com/help/account/membership/program-enrollment).

Nominatim público no permite autocompletado del cliente y limita uso intensivo. Conservar búsqueda explícita, caché, atribución y proveedor configurable; evaluar frecuencia agregada con varias instancias. [Política de Nominatim](https://operations.osmfoundation.org/policies/nominatim/).

Dejar para después: votaciones, fechas, IA, estadísticas elaboradas, fotos de visitas y más subpuntuaciones. Los flujos públicos pueden quedar en segundo nivel; mantenerlos implica atender sus requisitos.

## Verificación de esta entrega

- Mobile: npx tsc --noEmit → **correcto**.
- Backend: .\mvnw.cmd test detectó clases antiguas en target; se repitió con limpieza.
- Backend: .\mvnw.cmd clean test → compila; **27 pruebas, 26 correctas y 1 error de arranque**. PostgreSQL rechaza conexión en localhost:5432.
- Backend: .\mvnw.cmd '-Dtest=*ServiceTest' test → **26 pruebas correctas, BUILD SUCCESS**.
- No se modificó código backend/móvil ni entornos. Sin ramas, commits o despliegues.
- La carpeta previa mesa-app-build-88394e/ estaba sin seguimiento y se conservó.
- Revisión del prototipo documentada en MESA_DESIGN_VERIFICATION.md.

## Pruebas manuales

1. Inicio → Ver pendientes → restaurante → valorar → guardar. Comprobar puntuación y media.
2. Añadir → buscar “Katiyaki” → elegir grupo → guardar. Repetir para comprobar duplicado.
3. Crear grupo → detalle vacío → añadir manualmente. No debe aparecer un punto inventado en mapa.
4. Cambiar filtros, favorito y grupo; cada contexto conserva sus datos.
5. Revisar acceso, registro, recuperación, invitaciones, vacío/error/carga.
6. Comparar Sobremesa/Cuaderno/Barra y anchos 320/390 con los controles de diseño.

En la app real, tras implementar: repetir con dos cuentas/dispositivos, grupo con más de tres sitios, red desconectada al restaurar sesión, ubicación denegada y letra grande. Usar una base de pruebas para borrado y permisos. Quedan sin verificar app nativa instalada, migraciones contra PostgreSQL activo, push reales, recuperación por correo y aceptación por tiendas.
