# Grupos: implementación y revisión visual

Fecha: 10 de septiembre de 2026.

Alcance: Mis grupos y Explorar, siguiendo la propuesta de Grupos y las skills ui-ux-pro-max y professional-mobile-ui. Sin cambios en backend, API, autenticación, timeouts, dependencias ni assets de marca.

## Cambios

- Cabecera, acción Nuevo grupo, pestañas, búsqueda y mensajes compartidos. Se mantienen los colores cálidos, Inter y la ilustración existente.
- Tarjetas con el nombre como primera información, metadatos legibles y estilos coherentes. Privacidad y colaboración se muestran por separado; gestionar colaboración conserva su destino.
- Inicial como alternativa cuando falta la imagen o no carga. Nombres sin truncamiento; distribución vertical con texto del sistema ampliado.
- Filtros con objetivos táctiles de 48, selección accesible, indicador al plegarlos y salida explícita cuando no hay coincidencias.
- Carga inicial y actualización diferenciadas; un fallo parcial conserva las listas disponibles. Reintento sin ocultar el contenido cargado.
- Barra de estado oscura solo mientras la pantalla está enfocada, márgenes de seguridad y espacio inferior calculado con la altura de navegación.
- Se conserva el modo de selección de grupo al añadir un restaurante y sus rutas SEARCH/MANUAL.

## Archivos de esta iteración

- `mobile/src/app/(app)/groups/index.tsx`
- `mobile/src/app/(app)/groups/explore.tsx`
- `mobile/src/components/GroupCard.tsx`
- `mobile/src/components/PublicGroupCard.tsx`
- `mobile/src/components/GroupsPrimitives.tsx` (nuevo)
- `mobile/src/components/GroupList.styles.ts` (nuevo)
- `mobile/src/components/GroupArtwork.tsx` (nuevo)

## Comprobaciones

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit`, desde `mobile`, sin errores.
- Espacios y diff: `git -c core.safecrlf=false diff --check`, sin errores.
- Revisión visual de los componentes reales en un montaje temporal React Native Web a 390 × 844 y 320 × 640. Servicios, navegación, iconos nativos y zonas de seguridad simulados; no es una ejecución nativa ni una prueba contra la API.
- Revisados: listas con datos, primer uso sin grupos, filtro sin resultados y Mostrar todos, búsqueda sin coincidencias, error parcial con contenido, pestaña seleccionada y selección de grupo para SEARCH.
- Texto simulado al 200 % y nombre largo: se detectó falta de ancho y se corrigió apilando el contenido de la tarjeta. Sin desbordamiento horizontal en la comprobación de 320 puntos.
- Ruta emitida por selección comprobada con navegación simulada. La navegación real y la conservación de posición al volver requieren prueba en app.

## Prueba manual pendiente

Desde `mobile`, ejecutar `npx expo start --dev-client` y abrir la aplicación de desarrollo existente. Esta iteración solo cambia código JS/TS y no requiere reconstruir la APK de desarrollo.

1. Abrir Grupos y alternar Mis grupos/Explorar; comprobar volver atrás, búsqueda y posición al regresar.
2. Probar grupos propios privados/públicos, colaboraciones y seguidos, con imágenes reales y nombres largos.
3. Usar búsqueda, limpiar, filtros públicos/privados y Mostrar todos. Comprobar teclado abierto y cierre al desplazar.
4. Crear grupo, abrir detalles, gestionar colaboración y elegir grupo al añadir por búsqueda y manualmente.
5. Probar actualización y reintento con conectividad real, incluidos fallos parciales.
6. Comprobar Android e iOS: iconos oscuros de la barra de estado, safe areas, navegación inferior, orientación horizontal, texto ampliado, TalkBack/VoiceOver y foco.

No había dispositivo ni emulador conectado durante esta revisión. No se ha verificado la publicación en las tiendas ni la ejecución nativa.
