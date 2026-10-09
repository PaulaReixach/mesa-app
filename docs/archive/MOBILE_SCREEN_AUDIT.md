# Mesa — inventario integral de pantallas

Este documento define el alcance visual de la aplicación móvil y evita que un
flujo quede fuera del sistema de diseño. La fuente de verdad de navegación son
las rutas de `mobile/src/app`.

## Sistema visual

- Fondo global cálido: `#FBF6F3`.
- Superficies principales: `#FFFDFC` y blanco para elevación.
- Acción principal: terracota `#C9684E`.
- Acción secundaria y estados positivos: oliva `#6F7D4C`.
- Tipografía de interfaz: Inter 400, 500, 600 y 700.
- Marca: tratamiento editorial puntual; nunca sustituye a Inter en textos de UI.
- Controles táctiles: mínimo 44 px.
- Tarjetas: radios de 20–24 px, borde cálido y elevación sutil.
- Los estados no dependen solo del color: siempre incluyen texto o icono.
- Toda pantalla con datos remotos contempla carga, vacío, error y reintento.

## Acceso y primera experiencia

| Pantalla | Ruta | Estados y objetivo |
| --- | --- | --- |
| Onboarding | `/onboarding` | Tres beneficios, progreso, saltar, crear cuenta e iniciar sesión. |
| Inicio de sesión | `/login` | Normal, validación, error remoto y envío. |
| Registro | `/register` | Normal, validación, error remoto y envío. |
| Splash | raíz | Marca, carga de fuentes y restauración de sesión. |

## Navegación principal

| Pantalla | Ruta | Estados y objetivo |
| --- | --- | --- |
| Inicio | `/home` | Resumen, recomendaciones, grupos, actividad, invitaciones, carga, vacío y error. |
| Mapa | `/map` | Permisos, ubicación, grupos, filtros, resultados, selección, vacío y error. |
| Centro de acciones | `/add` | Buscar, añadir manualmente, crear grupo e invitaciones; variante compacta. |
| Grupos | `/groups` | Propios, colaboraciones, seguidos, selección para añadir, carga, vacío y error. |
| Explorar grupos | `/groups/explore` | Búsqueda local, resultados públicos, sin coincidencias, vacío y error. |
| Perfil | `/profile` | Identidad, estadísticas, navegación a ajustes y error parcial de estadísticas. |

## Grupos privados y públicos

| Pantalla | Ruta | Estados y objetivo |
| --- | --- | --- |
| Crear grupo | `/groups/create` | Foto, datos, privacidad, invitaciones, validación y envío. |
| Detalle privado | `/groups/[groupId]` | Restaurantes, miembros, actividad, acciones según rol, carga y error. |
| Detalle público | `/groups/public/[groupId]` | Seguir, colaborar, copiar, restaurantes, creadora, carga y error. |
| Editar grupo | `/groups/[groupId]/edit` | Permisos, imagen, datos, privacidad, validación y guardado. |
| Añadir miembros | `/groups/[groupId]/members/add` | Invitar, pendientes, cancelar, éxito, vacío y error. |
| Invitaciones | `/group-invitations` | Pendientes, aceptar, rechazar, abrir grupo, vacío y error. |
| Solicitudes de colaboración | `/groups/[groupId]/collaboration-requests` | Activar solicitudes, pendientes, aceptar, rechazar y vacío. |
| Espacio de colaboradora | `/groups/[groupId]/collaboration` | Contexto del rol, proponer, historial propio, vacío y error. |
| Solicitar colaboración | `/groups/public/[groupId]/collaborate` | Mensaje, límite, envío, confirmación y error. |
| Colaboradores públicos | `/groups/public/[groupId]/collaborators` | Creadora, colaboradores, vacío y error. |
| Propuestas recibidas | `/groups/[groupId]/restaurant-proposals` | Pendientes, historial, aceptar, rechazar, vacío y error. |
| Crear propuesta | `/groups/[groupId]/restaurant-proposals/create` | Buscar o introducir manualmente, mensaje, resultados y error. |
| Copiar restaurantes | `/groups/public/[groupId]/copy` | Selección, grupo destino, resultado, grupo inexistente y error. |

## Restaurantes

| Pantalla | Ruta | Estados y objetivo |
| --- | --- | --- |
| Añadir restaurante | `/groups/[groupId]/restaurants/create` | Búsqueda, entrada manual, resultados, notas, duplicado, vacío y error. |
| Detalle restaurante | `/groups/[groupId]/restaurants/[groupRestaurantId]` | Información, ubicación, notas, estado, valoraciones, permisos, carga y error. |
| Editar restaurante | `/groups/[groupId]/restaurants/edit` | Datos del grupo, ubicación, notas, validación y guardado. |

## Notificaciones, cuenta y soporte

| Pantalla | Ruta | Estados y objetivo |
| --- | --- | --- |
| Centro de notificaciones | `/notifications` | Filtros, leídas/no leídas, borrar, paginar, vacío y error. |
| Preferencias de notificación | `/notification-settings` | Carga, toggles, guardado automático, error y reintento. |
| Editar perfil | `/profile-edit` | Avatar, nombre, usuario, email, validación y guardado. |
| Ajustes de cuenta | `/account-settings` | Datos de acceso, contraseña y eliminación. |
| Cambiar contraseña | `/change-password` | Contraseña actual, nueva, confirmación, validación y sesión expirada. |
| Eliminar cuenta | `/delete-account` | Advertencia, contraseña, confirmación escrita y error. |
| Privacidad | `/privacy-settings` | Visibilidad y descubrimiento, carga, guardado y error. |
| Ayuda | `/help-support` | Acciones de soporte, preguntas frecuentes y contacto. |
| Solicitud de soporte | `/support-request` | Categoría, asunto, mensaje, validación, envío y confirmación. |
| Acerca de Mesa | `/about-mesa` | Propuesta de valor, versión, privacidad, términos y soporte. |

## Criterios de revisión

1. El usuario siempre sabe dónde está y cómo volver.
2. Solo existe una acción principal por bloque de decisión.
3. Privado, público, seguidor y colaborador tienen lenguaje y permisos claros.
4. Las colaboradoras proponen; no editan directamente restaurantes públicos.
5. Los textos importantes admiten pantallas compactas sin truncarse.
6. Android e iOS mantienen jerarquía, espaciado y áreas táctiles equivalentes.
7. Los flujos aprobados de Inicio, Mapa, centro `+` y detalles de grupo se
   conservan y comparten los mismos tokens visuales que el resto.
