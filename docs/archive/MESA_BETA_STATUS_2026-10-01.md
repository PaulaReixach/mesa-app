# MESA — revisión y primera implementación, 1 de octubre de 2026

## Estado y alcance

Se revisó el repositorio raíz, preservando los cambios locales anteriores. No se crearon ramas, commits, PRs ni despliegues; no se modificaron `.env`, dependencias ni backend. Los documentos de septiembre son antecedentes, no pruebas de la aplicación actual.

Versiones confirmadas en los manifiestos: Expo 56.0.21, Expo Router 56.2.20, React Native 0.85.3, React 19.2.3, TypeScript 6.0.3; Spring Boot 4.1.0 y Java 21. Arquitectura: cliente móvil con contextos y servicios existentes; monolito modular Java, PostgreSQL y 23 migraciones Flyway. Context7 disponible y consultado para FlatList. Se aplicaron professional-mobile-ui y vercel-react-native-skills.

La revisión de código cubrió cuenta/sesión, registro, grupos privados/públicos, permisos e invitaciones, búsqueda y alta manual, estados/favoritos, valoraciones, inicio y mapa. No hubo un recorrido interactivo nativo. No es una auditoría exhaustiva de seguridad ni una certificación de preparación para tiendas.

## Cambios implementados: grupo → restaurante

| Archivo dentro de mobile/src | Resultado |
| --- | --- |
| screens/PrivateGroupDetailScreen.tsx | Lista completa virtualizada con FlatList; búsqueda por nombre/ciudad/categoría y filtros combinables por estado/favorito. Vacío con limpieza de filtros. Miembros privados pueden añadir; invitaciones siguen reservadas a propietario y colaboradores públicos mantienen su ruta propia. |
| screens/PrivateGroupDetailScreen.tsx | Errores visibles con reintento y regreso. Fallos temporales conservan el contenido anterior; 401/403/404 lo retiran. Fallos de invitaciones/propuestas no inutilizan el grupo. Respuestas antiguas se descartan al salir o iniciar una carga posterior. Eliminado el contador duplicado de miembros. |
| components/RestaurantStatusSection.tsx | Favorito usa el endpoint booleano existente y conserva el estado. Ya no ofrece FAVORITE como estado, rechazado por el dominio. Bloqueo de controles durante cambios, error conservando datos y estado accesible de selección/favorito. |
| components/GroupDetailPrimitives.tsx | Tarjetas de restaurantes con monograma en lugar de fotografías genéricas. Nombre 16, información secundaria 12, estado 12 y media 14; metadatos reorganizados para permitir varias líneas. Nombre completo y contexto en etiqueta accesible. Acciones de grupo de 48 como mínimo, texto adaptable y terracota de la paleta existente. Afecta también a la lista pública que comparte estas tarjetas. |
| components/GroupDetailPrimitivesTuned.tsx | Estadísticas legibles (16/12), sin encoger etiquetas a una sola línea. Comparte el patrón con otras pantallas que lo utilizan. |

Se conservó el dominio de favoritos por grupo, las rutas, contratos, componentes y dirección Sobremesa. No se introdujo una biblioteca de listas. Sigue existiendo la etiqueta histórica FAVORITE para compatibilidad de lectura; no se envía desde el selector.

## Hallazgos confirmados pendientes

P0: cerrar antes de abrir una beta a terceros cuando afecte a privacidad o compromisos de la cuenta. P1: siguiente lote funcional. Esta prioridad es un criterio de producto, no una predicción de aprobación por tiendas.

| Prioridad | Evidencia actual | Consecuencia y trabajo siguiente |
| --- | --- | --- |
| P0 | SecurityConfig permite GET `/groups/*/image`; GroupController.getGroupImage no recibe usuario, GroupImageService.getImage no comprueba membresía/privacidad y la respuesta usa caché pública de 30 días. | La imagen de un grupo privado es recuperable con su URL sin sesión. Implementar autorización condicional para imágenes privadas, cabeceras del cliente y política de caché apropiada; comprobar con propietario, miembro, ajeno y sin token. Es evidencia estática; no se explotó contra un servidor. |
| P0 | register.tsx, handleLegalPress: documentos «disponibles próximamente», mientras se solicita aceptarlos. | Faltan documentos realmente accesibles y acordes al servicio. No inventar identidad del responsable ni compromisos de tratamiento. |
| P0 | No se encontraron rutas/servicios específicos de denuncia de contenido y bloqueo en el inventario revisado; sí existen grupos públicos y soporte general. | Definir alcance de beta pública y operación de moderación; soporte genérico no demuestra un flujo de denuncia/bloqueo. Requiere verificar el servicio operativo, no solo añadir un botón. |
| P1 | auth-context.tsx, restoreSession: catch borra SecureStore ante cualquier excepción. | Un fallo de red pierde la sesión persistida. Diferenciar 401 de error temporal y ofrecer reintento sin borrar credenciales válidas. |
| P1 | login.tsx, handleForgotPassword: aviso de función futura; no se encontró endpoint de recuperación. | No hay recuperación real. Requiere token de un solo uso con caducidad y un canal de entrega verificable. |
| P1 | MapScreenPolished.tsx, handleToggleFavorite: actualiza todas las memberships del restaurante cuando está agregado entre grupos. | Cambiar un favorito puede afectar varias listas. Pedir/elegir el grupo en esa acción y conservar el resto. |
| P1 | HomeScreenRefined.tsx, pickRecommendation: ordena todos los restaurantes sin excluir ARCHIVED/DO_NOT_REPEAT. | Puede recomendar locales que el grupo descartó. Inicio ya tiene mejoras locales de error parcial y un icono neutro: no repetir el diagnóstico histórico de que todo Inicio usa fotos ficticias. |
| P1 | app.json declara RECORD_AUDIO y expo-image-picker no desactiva microphonePermission; los usos revisados son de imágenes. | Permiso sin función localizada. Verificar plugin y manifest generado antes de retirarlo; la exportación JS no comprueba permisos del APK. |
| P1 | colors.primary sigue siendo #C9684E y PrimaryButton por defecto lo usa con texto blanco; el acceso ya utiliza #A6412B. Otros textos pequeños y límites de escalado permanecen. | Consolidar accesibilidad por flujo; en este lote solo se mejoraron acciones/tarjetas/estadísticas de grupos. No afirmar que todo el tema ni toda la accesibilidad están corregidos. |
| P1 | Detalle del restaurante y mapa siguen utilizando imágenes genéricas del helper restaurant-images.ts. | Completar el reemplazo por ilustración/monograma y no presentar imágenes ajenas como foto del local. |
| P2 | Inventario de rutas, servicios y migraciones revisado sin flujo de planes/visitas; la valoración actual guarda una puntuación entera 1–5 por usuario y restaurante del grupo. | Planificación, comentarios por visita y subpuntuaciones del contexto inicial no están demostrados como implementados. Acordar MVP real después de cerrar sus bloqueos, sin prometer esas funciones en la ficha. |

## Controles ya presentes y límites

- Permisos de escritura: GroupService.validateRestaurantManagementAccess admite miembros privados y solo propietario en lista pública. La nueva acción móvil respeta esta distinción.
- Invitaciones: propietario para gestionar; aceptación/rechazo busca la invitación vinculada al usuario autenticado.
- Valoraciones: controlador obtiene el usuario del JWT, valida pertenencia y relación restaurante/grupo, y guarda/elimina únicamente la valoración de ese usuario. Hay restricción única y rango 1–5 en V4; la media se calcula con valoraciones existentes. No probado contra PostgreSQL activo.
- Duplicados externos: índice único por proveedor/identificador externo en V3. Alta manual conserva coordenadas nulas y campos tras fallo de guardado. No se verificaron carreras concurrentes ni deduplicación manual.
- Proveedor real: Nominatim/OpenStreetMap, no Photon como indica el contexto inicial. Hay búsqueda explícita, límite de 10 resultados, caché de 30 minutos y limitación de frecuencia en el cliente del backend. No se comprobó servicio externo ni capacidad de varias instancias.
- Mapa: solicitud de ubicación al cargar mediante loadMap; denegación devuelve null. Revisar interacción/latencia y petición contextual en dispositivo. No se observó comportamiento nativo.
- Cuenta: existe borrado con comprobación de contraseña y eliminación de grupos propios; la pantalla explica esa consecuencia. Falta probarlo contra la base, incluidos registros vinculados, imágenes y push.
- No se detectó exposición de hashes en los DTO de cuenta revisados. No se hizo análisis completo de uploads, abuso de endpoints, sesiones revocadas o infraestructura de producción.

## Verificación

| Comando / evidencia | Resultado |
| --- | --- |
| mobile: `npx tsc --noEmit` | Correcto antes de editar y después del lote final. |
| mobile: `npx expo export --platform android --output-dir C:/Users/Paula/AppData/Local/Temp/mesa-beta-check-20261001` | Exportación Android/Hermes correcta, 1559 módulos y bundle de 4,1 MB. Verifica empaquetado, no instalación ni interacción. Se ejecutó antes del último ajuste que descarta respuestas antiguas; ese ajuste pasó TypeScript. |
| backend: `.\mvnw.cmd clean test` | Compila 184 fuentes. 27 pruebas: 26 correctas, 0 fallos de aserción, 1 error en contextLoads por conexión rechazada a PostgreSQL localhost:5432. No se cambió backend. |
| `adb devices` | Sin dispositivos/emuladores conectados. |
| `docker ps` y puertos locales | Docker Engine no disponible; sin listener 5432, 8080 ni 8081 en la comprobación inicial. |
| `git diff --check` | Sin errores de espacios; avisos de conversión LF/CRLF en cambios previos. |

No verificado: renderizado, letra grande, teclado, lectores de pantalla, navegación Android/iOS, persistencia de filtros, integración HTTP/SQL, migraciones contra base activa, proveedores, entrega de correo/push, firma/permisos de APK y operación del servicio en producción. No se añadieron tests que solo inspeccionen el texto de la implementación. Las comprobaciones de TypeScript/exportación no sustituyen estos recorridos.

## Pruebas manuales del lote

1. Con dos cuentas, crear grupo privado e invitar/aceptar. Crear al menos cinco restaurantes; la segunda cuenta debe ver los cinco y poder añadir el sexto. Solo propietario ve Invitar.
2. Buscar por nombre, ciudad y categoría; combinar estado y favorito, incluyendo Archivado/No repetir. Sin resultados, limpiar filtros. Revisar una lista extensa y abrir el último elemento.
3. En ficha, marcar/desmarcar favorito con estados Queremos ir y Visitado; volver al grupo y comprobar el corazón/filtro. El estado debe conservarse y otro grupo del mismo local debe permanecer igual. El mapa tiene el fallo separado indicado arriba.
4. Desconectar red durante carga inicial: mensaje, reintento y regreso. Desconectar durante actualización: contenido anterior visible. Restaurar red y reintentar. Forzar fallo solo de invitaciones/propuestas: lista utilizable y aviso.
5. Retirar permiso de miembro o borrar grupo y recargar: 403/404 retira el contenido anterior. Navegar rápidamente entre dos grupos y confirmar que una respuesta lenta no sustituye el grupo actual.
6. Propietario público: añadir directamente; colaborador público: ruta pública y propuesta, sin edición directa. Revisar también las tarjetas públicas compartidas.
7. Android e iOS, pantalla estrecha y letra grande: revisar cabecera, estadísticas, acciones, tarjetas, selector de estado, teclado y acceso al final de la lista. Comprobar lectura del favorito/estado con lector de pantalla.

## Siguiente lote y bloqueo real de beta

Primero cerrar privacidad de imágenes privadas y restauración de sesión, con pruebas de permisos y red. Después mapa/favoritos y recomendaciones; luego recuperación y documentos reales, junto con decisión operativa de moderación. Es necesaria una base de pruebas y al menos un dispositivo Android/iOS para validar el recorrido completo. Las cuentas de tiendas y el servicio desplegado no se inspeccionaron. MESA tiene funciones avanzadas, pero este lote no acredita que esté lista para lanzamiento.
