# Mesa: verificación del estudio de diseño

Revisión realizada el 7 y 8 de septiembre de 2026.

## Alcance

Se revisó el repositorio principal y se creó una propuesta interactiva de 21 vistas. No se modificó el código de la aplicación ni del backend. Los resultados de navegación descritos aquí pertenecen al prototipo local; no acreditan que la aplicación nativa implemente esos cambios.

Entregables:

- MESA_PRODUCT_UX_REVIEW.md: diagnóstico, evidencias, prioridades, tres conceptos, correspondencia de pantallas, preparación de lanzamiento y pruebas manuales.
- MESA_DESIGN_VERIFICATION.md: este registro.
- mesa-sobremesa.html: diseño interactivo mostrado en la conversación, en el directorio de visualizaciones de esta tarea.

## Comprobaciones del proyecto

| Comando | Resultado |
| --- | --- |
| mobile: npx tsc --noEmit | Correcto. |
| backend: .\mvnw.cmd test | Se detectaron clases compiladas antiguas en target. Se repitió con limpieza. |
| backend: .\mvnw.cmd clean test | Compilación correcta. 27 pruebas: 26 pasan; contextLoads falla al conectar a PostgreSQL en localhost:5432. |
| backend: .\mvnw.cmd '-Dtest=*ServiceTest' test | 26 pruebas correctas; BUILD SUCCESS. |
| git diff --check | Sin errores. Los documentos nuevos se revisaron también de forma explícita. |

No se volvió a ejecutar la misma batería al retomar la tarea: no había cambios en código de aplicación ni nuevas evidencias que lo justificaran.

## Comprobaciones del prototipo

- Sintaxis JavaScript comprobada con node --check.
- Las 21 vistas se recorrieron a 320 y 390 píxeles de ancho de dispositivo.
- Se midieron los límites de botones, entradas, selectores, áreas de texto y textos principales respecto a la superficie del dispositivo. Sin desbordamientos horizontales en esas muestras.
- Revisión visual de Sobremesa, Cuaderno y Barra; contraste visual claro/oscuro en vistas representativas. No es una certificación de accesibilidad.
- Inicio se compactó eliminando una tarjeta que repetía el grupo de la cabecera.
- El mapa incorpora 108 segmentos de calles publicados por OpenStreetMap, proyectados con D3. Tres ubicaciones guardadas iniciales y selección de marcadores mediante botones con nombre accesible.
- Texto de atribución visible. No se accede a la ubicación real del usuario ni se consulta la API de Mesa.
- Sin errores de consola en las sesiones revisadas.

Recorridos comprobados:

| Recorrido | Resultado observado |
| --- | --- |
| Inicio → Ver pendientes | Abre el grupo filtrado por Queremos ir. |
| Buscar Katiyaki | Filtra la lista de ejemplo mediante búsqueda explícita. |
| Guardar Katiyaki | La lista pasa de tres a cuatro restaurantes. |
| Repetir guardado | Informa del duplicado y no añade otra fila. |
| Guardar valoración sin puntuación | Muestra validación local. |
| Puntuar 5 y guardar | Ficha con 5,0 y una valoración; mi puntuación queda visible. |
| Seleccionar Ninja Ramen en mapa | Cambia la ficha asociada al marcador. |
| Crear un grupo | El detalle muestra un estado vacío. |
| Añadir manualmente sin coordenadas | Se conserva en lista, sin inventar un marcador. |

## Uso y límites

El selector superior permite abrir cualquiera de las 21 vistas. Los controles de diseño permiten comparar Sobremesa, Cuaderno y Barra y ajustar ancho y texto. El estado es local a la vista y se reinicia al recargar.

Los nombres de locales y sus coordenadas se usan para representar el diseño. Pertenencias a grupos, puntuaciones, notas y actividad son datos ficticios. Las imágenes neutras con iniciales no se presentan como fotografías de los locales.

Las acciones de cuenta, envío de invitación y recuperación son simuladas. Los enlaces secundarios de ajustes y moderación explican el patrón propuesto; no contienen una implementación completa. El mapa no implementa navegación por GPS, zoom o rutas.

No verificado:

- Aplicación instalada en Android/iOS, navegación nativa o lectores de pantalla.
- Migraciones e integración con una base PostgreSQL activa.
- Notificaciones push, envío de correo y proveedores en una build de producción.
- Operación de denuncias/bloqueos o eliminación de cuenta en el servicio real.
- Requisitos particulares de las cuentas de las tiendas o aprobación de publicación.

Las pruebas manuales propuestas para la app real están al final de MESA_PRODUCT_UX_REVIEW.md.
