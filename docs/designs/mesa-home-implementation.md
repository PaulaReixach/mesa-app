# Inicio de Mesa — implementación y revisión

Fecha: 9 de septiembre de 2026.

## Alcance

Aplicada la propuesta aprobada de Inicio usando `ui-ux-pro-max` y el criterio de revisión móvil. Se mantienen la autenticación, los servicios/API, el backend, los timeouts, los destinos de navegación y la selección de recomendaciones existentes. No se añaden dependencias ni assets.

## Cambios

- Cabecera terracota sólida, wordmark serif existente, ilustración secundaria y paleta compartida con los formularios aprobados.
- Acceso explícito «Buscar en el mapa», controles de cabecera de 48 y márgenes consistentes.
- Acciones rápidas adaptables: contador de invitaciones expresado en texto y distribución vertical cuando falta espacio o se amplía la letra.
- Sin grupos: una acción principal para crear el primero; si hay invitaciones pendientes, estas pasan a ser la prioridad. Sin duplicación del CTA ni bloques de actividad vacíos innecesarios.
- Tarjeta de grupo con altura natural, nombre completo y protección de contraste sobre las fotos. Si no hay foto o falla, se utiliza el fondo de marca.
- Recomendación con nombre, ciudad, grupo y puntuación reales. Se eliminan la foto genérica, el estado fijo «Para descubrir» y la afirmación no garantizada «La mejor valorada».
- Actividad con texto mayor, fecha debajo y contexto del grupo en las valoraciones y cambios de estado. Se retira «Ver toda», cuyo destino era otra fuente de información.
- Carga inicial diferenciada del vacío; errores parciales explícitos; reintento. Una actualización global fallida mantiene el contenido anterior.
- Barra inferior: «Añadir» visible y botón sólido más contenido. El contenido de Inicio reserva la altura real de la barra mediante el hook público de `expo-router/js-tabs`.
- Escalado del contenido, alturas flexibles, etiquetas accesibles y foco visible en controles de Inicio. Las etiquetas de navegación crecen hasta 1,3; la marca y la inicial del avatar conservan su tamaño.

La recomendación sigue seleccionándose entre los restaurantes cargados de los cuatro primeros grupos, como antes. Esta iteración no amplía esa cobertura ni cambia el algoritmo.

## Archivos

- `mobile/src/screens/HomeScreenRefined.tsx`: composición y estados de presentación de las cargas existentes.
- `mobile/src/components/HomeHeader.tsx` y `HomeDashboardStyles.ts`: cabecera, espaciado, feedback y superficies.
- `mobile/src/components/HomeDashboardContentRefined.tsx`: contenido con grupos y primer uso.
- `mobile/src/components/HomeQuickActionCardRefined.tsx` y su `.styles.ts`.
- `mobile/src/components/HomeGroupCardRefined.tsx` y su `.styles.ts`.
- `mobile/src/components/HomeRecommendationCardRefined.tsx` y su `.styles.ts`.
- `mobile/src/components/HomeActivityRowRefined.tsx` y su `.styles.ts`.
- `mobile/src/components/NotificationBellButton.tsx`: variante de cabecera.
- `mobile/src/navigation/AppTabsLayout.tsx` y su `.styles.ts`: barra compartida; los cambios visuales se ven también en las otras pestañas.

## Verificación realizada

- `node node_modules/typescript/bin/tsc --noEmit`, desde `mobile`: correcto.
- `git diff --check` sobre los archivos de esta iteración: correcto con la configuración normal de finales de línea del repositorio.
- Revisión visual en un montaje temporal de React Native Web que importa Home, sus componentes y la configuración de la barra reales. Autenticación, servicios, navegación, safe areas e iconos nativos se sustituyen por datos/adaptadores de prueba; no es una ejecución nativa ni una prueba de extremo a extremo con backend.
- Revisados 390 × 844, 320 × 640 y horizontal 740 × 360.
- Revisados cuenta vacía, invitación pendiente, grupos y actividad, nombres largos y simulación de texto al 200 %.
- Detectado y corregido un recorte de las acciones rápidas apiladas con texto ampliado: ahora crecen con su contenido.
- Probados fallo inicial y recuperación mediante Reintentar; fallos parciales de actividad/restaurantes; invitaciones no disponibles sin afirmar «Sin pendientes»; actualización fallida conservando contenido anterior.
- Comprobados los destinos emitidos por los controles de invitación, restaurante, grupo público y mapa, con router simulado.
- Comprobado que el final del contenido es accesible por encima de la barra inferior y sin desbordamiento horizontal en la vista revisada.
- `adb devices`: no había dispositivo/emulador conectado.

## Prueba manual pendiente

1. Desde `mobile`, ejecutar `npx expo start --dev-client` y abrir el proyecto en la APK de desarrollo ya instalada. No hace falta regenerar la APK por estos cambios de UI.
2. Revisar una cuenta sin grupos, otra con invitación pendiente y otra con grupos, fotos y actividad reales.
3. Probar crear grupo, invitaciones, campana, perfil, grupo, restaurante y mapa. Comprobar regreso a Inicio y conservación del scroll.
4. Revisar la barra compartida en Inicio, Grupos, Añadir, Mapa y Perfil, especialmente el estado seleccionado y las etiquetas.
5. Ampliar el texto del sistema y comprobar pulsaciones, safe areas, fotos claras/oscuras y nombres largos en Android/iOS.
6. Probar TalkBack/VoiceOver, teclado externo y los iconos nativos. La simulación web no certifica estos comportamientos.
7. Comprobar actualizar deslizando hacia abajo y los mensajes de carga/error con el backend real.

La recuperación real de contraseña, la autenticación y la publicación en tiendas quedan fuera de esta iteración.
