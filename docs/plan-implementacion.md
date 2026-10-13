# Plan de implementación del diseño aprobado

Mensajes listos para copiar y pegar en Claude Code, **uno por mensaje y en este orden**. Revisa cada
entrega antes de pasar a la siguiente.

- **Fuente de verdad:** el apartado de cada pantalla en `DESIGN.md`.
- **Referencia visual:** el lienzo https://claude.ai/artifact/YEtWNs3Yc8qTKn74L1tZsm, que solo hay que leer si falta un detalle.

---

## 0 · Arranque (una vez por sesión nueva)

```text
Empezamos a pasar a código el diseño aprobado de Mesa. Lee tu memoria «implementacion-plan» y
«design-canvas-workflow», docs/CODEMAP.md, mobile/src/theme y mobile/src/components/ui.
No escribas código todavía: dime qué componentes compartidos hay que crear o cambiar y en qué orden,
y qué ya existe. Gasta pocos tokens.
```

---

## 1 · Componentes compartidos (`mobile/src/components/ui/`)

Plantilla. Cambia lo que va entre corchetes:

```text
Haz el componente «[NOMBRE]» en mobile/src/components/ui según DESIGN.md (apartado «[APARTADO]»).
Usa los tokens de mobile/src/theme y @expo/ui cuando sea un control nativo. Crea una pantalla de
prueba temporal si hace falta para verlo. Verifica con npx tsc --noEmit y capturas a 390 px en claro
y oscuro con datos difíciles (textos largos, vacío). Al final, «Skills usadas».
```

| # | [NOMBRE] | [APARTADO] de DESIGN.md |
|---|---|---|
| 1.1 | Lista agrupada con campos dentro de la fila | Editar un sitio · Ajustes del grupo |
| 1.2 | Hoja modal con Cancelar · Título · Guardar | Editar un sitio · Ajustes del grupo (Editar) |
| 1.3 | Alerta destructiva | Ajustes del grupo (Alertas) |
| 1.4 | Aviso inferior (`role=status`, con acción) | Gestionar propuestas (Después de decidir) |
| 1.5 | Portada tipográfica | Portada tipográfica (`RestaurantCover`) |
| 1.6 | Encabezado de foto ancho (con Añadir/Cambiar foto) | Editar un sitio (Encabezado) |
| 1.7 | Aviso informativo que se puede cerrar | Descubrir listas públicas (Sin ubicación) |
| 1.8 | Estado vacío con acción | Estados de pantalla (`EmptyState`) |

---

## 2 · Pantallas

Plantilla general (las de abajo ya vienen rellenas):

```text
Implementa «[PANTALLA]» según DESIGN.md › «[APARTADO]». Rutas: [RUTAS].
Usa los componentes de components/ui y los servicios existentes; cubre carga, vacío, error y los
casos difíciles del apartado. Lo marcado como «pendiente de backend» se deja preparado pero oculto
o desactivado. Verifica con npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza
docs/CODEMAP.md. «Skills usadas».
```

### 2.1 Entrar
```text
Implementa «Entrar» según DESIGN.md › «Entrar». Rutas: (auth)/onboarding, (auth)/login, (auth)/register.
Usa los componentes de components/ui y auth-context; cubre carga, error y los casos difíciles del
apartado. Apple/Google y «¿Has olvidado tu contraseña?» son pendientes de backend: déjalos preparados
pero ocultos. Verifica con npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza docs/CODEMAP.md.
«Skills usadas».
```

### 2.2 Inicio
```text
Implementa «Inicio» según DESIGN.md › «Inicio v2» y «Cabecera al deslizar». Ruta: (app)/home.
Usa los componentes de components/ui y los servicios existentes; cubre carga, vacío (primer uso),
error y los casos difíciles del apartado. Verifica con npx tsc --noEmit y capturas a 390 px
claro/oscuro. Actualiza docs/CODEMAP.md. «Skills usadas».
```

### 2.3 Grupos
```text
Implementa «Grupos» según DESIGN.md › «Grupos». Ruta: (app)/groups/index.
Usa los componentes de components/ui; cubre carga, sin grupos, error y nombres largos o grupos sin
foto. Añade la entrada a Descubrir (groups/explore). Verifica con npx tsc --noEmit y capturas a 390 px
claro/oscuro. Actualiza docs/CODEMAP.md. «Skills usadas».
```

### 2.4 Detalle de grupo
```text
Implementa «Detalle de grupo» según DESIGN.md › «Detalle de grupo». Ruta: (app)/groups/[groupId].
Pestañas Sitios · Actividad · Miembros; el engranaje de la portada lleva a Ajustes del grupo (si aún
no existe la ruta, déjalo apuntando a groups/[groupId]/settings). En listas públicas, el aviso de
propuestas solo para la propietaria. Cubre carga, recién creado, sin resultados, error y casos
difíciles. Verifica con npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza docs/CODEMAP.md.
«Skills usadas».
```

### 2.5 Restaurante
```text
Implementa «Restaurante» según DESIGN.md › «Restaurante». Ruta: (app)/groups/[groupId]/restaurants/[groupRestaurantId].
Estado, favorito, media del grupo, valorar en hoja nativa y «Editar» en el menú (lleva a
restaurants/edit). Cubre carga, pendiente sin valorar, añadido a mano, error. Verifica con
npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza docs/CODEMAP.md. «Skills usadas».
```

### 2.6 Botón «+» y Añadir un restaurante
```text
Implementa «Botón + y Añadir un restaurante» según DESIGN.md › «Botón «+» y Añadir un restaurante».
Rutas: (app)/add y (app)/groups/[groupId]/restaurants/create. Una sola hoja con su pila, búsqueda en
OpenStreetMap con atribución y alta a mano. Cubre sin resultados, sin conexión, a mano, sin grupos.
Verifica con npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza docs/CODEMAP.md.
«Skills usadas».
```

### 2.7 Mapa
```text
Implementa «Mapa» según DESIGN.md › «Mapa». Ruta: (app)/map.
Selector de grupo, hoja nativa con filtros y lista por cercanía, pin con tarjeta flotante. Cubre sin
ubicación, permiso denegado, sitios sin coordenadas, grupo vacío, muchos pines, sin conexión, cargando.
Verifica con npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza docs/CODEMAP.md.
«Skills usadas».
```

### 2.8 Crear un grupo
```text
Implementa «Crear un grupo» según DESIGN.md › «Crear un grupo». Rutas: (app)/groups/create y la
invitación por usuario (reutiliza la lógica de groups/[groupId]/members/add). Cubre sin nombre,
público con «Aceptar propuestas», foto y nombre largo, sin conexión. Verifica con npx tsc --noEmit y
capturas a 390 px claro/oscuro. Actualiza docs/CODEMAP.md. «Skills usadas».
```

### 2.9 Ajustes del grupo
```text
Implementa «Ajustes del grupo» según DESIGN.md › «Ajustes del grupo». Rutas: nueva
(app)/groups/[groupId]/settings, (app)/groups/[groupId]/edit como hoja modal y
(app)/groups/[groupId]/members/add para Invitar. Vista de propietaria y de miembro, alertas de borrar
y quitar. «Traspasar la propiedad» es pendiente de backend: preparado pero oculto. Cubre solo tú sin
foto, grupo público y editar sin nombre. Verifica con npx tsc --noEmit y capturas a 390 px
claro/oscuro. Actualiza docs/CODEMAP.md. «Skills usadas».
```

### 2.10 Editar un sitio
```text
Implementa «Editar un sitio» según DESIGN.md › «Editar un sitio». Ruta:
(app)/groups/[groupId]/restaurants/edit como hoja modal, con la pantalla Cocina apilada dentro.
La foto y «Quitar de este grupo» son pendientes de backend: preparados pero ocultos. Cubre añadido a
mano y sin nombre. Verifica con npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza
docs/CODEMAP.md. «Skills usadas».
```

### 2.11 Descubrir listas públicas
```text
Implementa «Descubrir listas públicas» según DESIGN.md › «Descubrir listas públicas». Rutas:
(app)/groups/explore, (app)/groups/public/[groupId] y (app)/groups/public/[groupId]/collaborate
(«Pedir colaborar»). «Cerca de ti» con expo-location para la ciudad; los minutos a pie son pendientes
de backend (ocultos). Aviso de ubicación con cruz que vuelve en la próxima apertura. Cubre sin
resultados, ciudad sin listas, solicitud pendiente. Verifica con npx tsc --noEmit y capturas a 390 px
claro/oscuro. Actualiza docs/CODEMAP.md. «Skills usadas».
```

### 2.12 Copiar sitios de una lista
```text
Implementa «Copiar sitios» según DESIGN.md › «Copiar sitios de una lista pública». Ruta:
(app)/groups/public/[groupId]/copy como hoja, con «Elegir cuáles» apilada. Buscador de grupos,
«Seleccionar todos» de tres estados y resumen previo. Cubre sin grupos, búsqueda vacía, todo repetido
y más de 100. Verifica con npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza
docs/CODEMAP.md. «Skills usadas».
```

### 2.13 Una propuesta pública (quien colabora)
```text
Implementa «Una propuesta pública» según DESIGN.md › «Una propuesta pública». Rutas:
(app)/groups/[groupId]/restaurant-proposals/create, «Tus propuestas» y (app)/groups/[groupId]/collaboration.
Cubre no colaboras en ninguna lista, a mano, sin conexión, descartar con mensaje y nombres largos.
Verifica con npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza docs/CODEMAP.md.
«Skills usadas».
```

### 2.14 Gestionar propuestas (propietaria)
```text
Implementa «Gestionar propuestas» según DESIGN.md › «Gestionar propuestas». Rutas:
(app)/groups/[groupId]/restaurant-proposals (bandeja con Sitios y Personas), la ficha de propuesta,
Respondidas, y unifica ahí (app)/groups/[groupId]/collaboration-requests y
(app)/groups/public/[groupId]/collaborators (redirige o elimina las rutas antiguas). Cubre nada
pendiente, ya estaba, no acepta colaboradores y propuesta a mano sin mensaje. Verifica con
npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza docs/CODEMAP.md. «Skills usadas».
```

### 2.15 Perfil y ajustes
```text
Implementa «Perfil y ajustes» según DESIGN.md › «Perfil y ajustes». Rutas: (app)/profile,
(app)/profile-edit, (app)/account-settings, (app)/change-password, (app)/notification-settings,
(app)/privacy-settings, (app)/about-mesa y (app)/delete-account. Hazlo por partes si es grande:
primero perfil y editar perfil, luego cuenta y seguridad, luego ajustes y eliminar cuenta. Cubre los
casos difíciles del apartado. Verifica con npx tsc --noEmit y capturas a 390 px claro/oscuro.
Actualiza docs/CODEMAP.md. «Skills usadas».
```

### 2.16 Notificaciones e invitaciones
```text
Implementa «Notificaciones e invitaciones» según DESIGN.md › «Notificaciones e invitaciones». Rutas:
(app)/notifications y (app)/group-invitations. Dos bandejas, invitaciones en estilo tipográfico,
menú, deslizar, aceptar con deshacer. Cubre sin actividad, sin invitaciones, ya no disponible, sin
conexión. Verifica con npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza docs/CODEMAP.md.
«Skills usadas».
```

### 2.17 Soporte y permisos
```text
Implementa «Soporte y permisos» según DESIGN.md › «Soporte y permisos». Rutas: (app)/help-support
(centro de ayuda) y (app)/support-request (escribir, con el motivo que llega del camino elegido); y la
hoja de cámara sin permiso en (app)/profile-edit. Cubre mensaje corto y sin conexión. Verifica con
npx tsc --noEmit y capturas a 390 px claro/oscuro. Actualiza docs/CODEMAP.md. «Skills usadas».
```

---

## 3 · Backend pendiente (cuando quieras, uno por mensaje)

```text
Implementa en el backend «[FUNCIÓN]» según DESIGN.md › «[APARTADO]»: endpoint, reglas, migración
Flyway nueva si hace falta y tests; compila y pasa los tests. Después, activa en mobile lo que estaba
preparado y oculto para esta función.
```

| [FUNCIÓN] | [APARTADO] |
|---|---|
| Traspasar la propiedad de un grupo (y ofrecerlo antes de borrar la cuenta) | Ajustes del grupo |
| Quitar un sitio de un grupo | Editar un sitio |
| Foto de los sitios | Editar un sitio |
| Distancia a pie por lista para «Cerca de ti» | Descubrir listas públicas |
| Entrar con Apple y Google | Entrar |
| Recuperar la contraseña | Entrar |

---

## Para retomar en cualquier momento

```text
Seguimos con docs/plan-implementacion.md: ¿qué está hecho y qué toca ahora?
```

Si algo no te convence, di qué falla («parece web», «vacío», «sobra texto») en lugar de «no me gusta».
