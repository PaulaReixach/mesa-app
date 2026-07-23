# Mesa · Grupos públicos — Especificación funcional del MVP

## 1. Visión

La parte pública de Mesa permite descubrir listas de restaurantes creadas por personas reales de una zona, consultarlas sin compromiso, seguirlas para tenerlas a mano, solicitar colaborar y copiar restaurantes interesantes a grupos propios.

La propuesta no busca convertir Mesa en una red social generalista. El centro sigue siendo el restaurante y la utilidad práctica de decidir dónde comer.

Ejemplo:

> **Las mejores hamburguesas de Girona**  
> por **@eustaquio**  
> 18 restaurantes · 246 seguidores

La identidad del grupo pertenece a su creador. Las demás personas pueden observar, seguir, valorar como colaboradoras y proponer contenido, pero no apropiarse de la lista ni modificarla sin control.

---

## 2. Objetivos del MVP

1. Aportar valor a una persona que llega sola a Mesa y todavía no tiene grupos privados.
2. Permitir descubrir recomendaciones locales con autoría y contexto.
3. Conectar la parte pública con la privada mediante **Copiar a mi grupo**.
4. Permitir participación controlada sin perder la identidad editorial del creador.
5. Evitar que un grupo público se convierta en una lista caótica donde cualquiera edita todo.

### No objetivos del MVP

Quedan fuera de esta primera versión:

- Chat del grupo.
- Feed social de publicaciones.
- Comentarios generales o hilos.
- Likes sobre notas o valoraciones.
- Perfiles de creador complejos.
- Ranking público de usuarios.
- Moderadores múltiples.
- Recomendaciones con inteligencia artificial.
- Acceso anónimo sin cuenta.

---

## 3. Conceptos y roles

### Visitante

Persona autenticada que abre un grupo público sin seguirlo ni colaborar.

Puede explorar y consultar el contenido, pero no participar en la construcción de la lista.

### Seguidor

Persona que guarda un grupo público para encontrarlo fácilmente desde Mesa.

Seguir un grupo no convierte a la persona en miembro ni le da permisos de edición.

### Colaborador

Persona cuya solicitud de colaboración ha sido aceptada por el creador.

Puede valorar restaurantes y proponer nuevos sitios, pero no controla la identidad editorial del grupo.

### Creador

Propietario del grupo público.

Es la única persona que edita los datos generales del grupo, aprueba colaboradores, aprueba propuestas y decide qué restaurantes forman parte de la lista pública.

---

## 4. Matriz de permisos

| Acción | Visitante | Seguidor | Colaborador | Creador |
|---|:---:|:---:|:---:|:---:|
| Ver un grupo público | Sí | Sí | Sí | Sí |
| Ver restaurantes aprobados | Sí | Sí | Sí | Sí |
| Ver nota editorial del restaurante | Sí | Sí | Sí | Sí |
| Ver valoración media y valoraciones públicas | Sí | Sí | Sí | Sí |
| Seguir o dejar de seguir | Sí | Sí | Sí | No aplica |
| Copiar restaurantes a un grupo propio | Sí | Sí | Sí | Sí |
| Solicitar colaboración | Sí | Sí | No aplica | No aplica |
| Cancelar una solicitud pendiente | Sí | Sí | No aplica | No aplica |
| Valorar un restaurante | No | No | Sí | Sí |
| Editar su propia valoración | No | No | Sí | Sí |
| Proponer un restaurante | No | No | Sí | Sí |
| Editar una propuesta pendiente propia | No | No | Sí | Sí |
| Aprobar o rechazar propuestas | No | No | No | Sí |
| Editar la nota editorial | No | No | No | Sí |
| Retirar un restaurante aprobado | No | No | No | Sí |
| Aceptar o rechazar colaboradores | No | No | No | Sí |
| Retirar a un colaborador | No | No | No | Sí |
| Editar nombre, descripción, foto, zona o etiquetas | No | No | No | Sí |
| Cambiar el grupo entre privado y público | No | No | No | Sí |
| Activar o desactivar solicitudes de colaboración | No | No | No | Sí |
| Reportar contenido | Sí | Sí | Sí | Sí |

### Regla principal

Un colaborador **no edita directamente** restaurantes aprobados ni la nota editorial del creador. Puede valorar y proponer. El creador conserva el control final.

---

## 5. Privado y público

Un grupo tiene una visibilidad:

- `PRIVATE`: solo lo ven sus miembros actuales.
- `PUBLIC`: cualquier usuario autenticado puede encontrarlo y visualizarlo.

En el MVP no existe el modo “oculto con enlace”.

### Convertir un grupo privado en público

Solo puede hacerlo el creador. Antes de publicar, Mesa debe pedir:

- Ciudad o zona principal.
- Categoría principal.
- Hasta tres etiquetas.
- Confirmación de que las notas existentes pasarán a ser visibles.
- Si acepta o no solicitudes de colaboración.

### Convertir un grupo público en privado

Solo puede hacerlo el creador.

Al hacerlo:

- Desaparece de Explorar.
- Los seguidores dejan de tener acceso.
- Las solicitudes pendientes se cancelan.
- Los colaboradores aceptados permanecen como miembros privados, salvo que el creador los elimine.
- Las valoraciones ya creadas permanecen dentro del grupo.

---

## 6. Autoría y contenido público

### Datos públicos del grupo

- Nombre.
- Imagen.
- Descripción.
- Creador: avatar, nombre visible y `@username`.
- Ciudad o zona.
- Categoría principal.
- Etiquetas.
- Número de restaurantes.
- Número de seguidores.
- Número de colaboradores.
- Fecha de última actualización.

Nunca se muestra la ubicación en tiempo real del creador.

### Datos públicos del restaurante

- Nombre.
- Categoría.
- Dirección general.
- Estado editorial dentro de la lista.
- Nota editorial del creador.
- Valoración media del grupo.
- Valoraciones individuales de colaboradores, con nombre y avatar.

### Nota editorial

Cada restaurante público tiene una nota editorial única, administrada por el creador.

Ejemplo:

> “La smash más equilibrada de la lista. Pedid las patatas con parmesano.”

Las valoraciones de colaboradores son individuales y no sobrescriben esa nota.

---

## 7. Seguir un grupo

### Comportamiento

- La acción es inmediata y reversible.
- No requiere aprobación.
- No concede permisos.
- El grupo aparece en una sección **Siguiendo** dentro de `Mis grupos`.
- Seguir cuenta como señal de popularidad.

### Notificaciones

En el MVP, seguir un grupo no activa automáticamente notificaciones push. Se evita generar ruido antes de tener controles de preferencias más finos.

En una versión posterior se podrá activar “Avisarme cuando añadan restaurantes”.

---

## 8. Solicitar colaborar

El botón se muestra únicamente cuando:

- El grupo es público.
- El visitante todavía no es colaborador.
- No tiene una solicitud pendiente.
- El creador ha activado **Aceptar solicitudes de colaboración**.

### Solicitud

La persona puede añadir un mensaje opcional de hasta 300 caracteres.

Estados:

- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `CANCELLED`

Solo puede existir una solicitud pendiente por usuario y grupo.

### Resolución

El creador puede:

- Aceptar.
- Rechazar.
- Abrir el perfil básico del solicitante.

Al aceptar, la persona pasa a ser colaboradora y puede valorar y proponer restaurantes.

Al rechazar, puede volver a solicitar tras un periodo de 30 días. Este límite evita insistencia y spam.

### Retirar colaboración

El creador puede retirar a un colaborador. La persona pierde permisos de participación, pero sus valoraciones históricas se mantienen visibles como aportaciones pasadas, salvo moderación.

---

## 9. Proponer restaurantes

Un colaborador puede proponer un restaurante mediante búsqueda o creación manual.

La propuesta incluye:

- Restaurante.
- Motivo o nota opcional.
- Fecha.
- Autor.

Estados:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

### Reglas

- Una propuesta pendiente no aparece en la lista pública general.
- El creador puede aprobarla o rechazarla.
- Al aprobarla, el restaurante entra en la lista con estado inicial `WANT_TO_GO`.
- El creador puede escribir o adaptar la nota editorial antes de publicar.
- El colaborador puede editar o cancelar su propuesta mientras esté pendiente.
- No se permiten propuestas duplicadas del mismo restaurante en el mismo grupo.

---

## 10. Copiar restaurantes a mi grupo

Esta función conecta el descubrimiento público con la organización privada.

### Flujo

1. Pulsar **Copiar restaurantes**.
2. Seleccionar uno o varios restaurantes aprobados.
3. Elegir un grupo de destino.
4. Confirmar.
5. Mostrar resumen de copiados y omitidos.

### Destinos permitidos en el MVP

- Grupos privados donde la persona pueda añadir restaurantes.
- Grupos públicos creados por esa persona.

No se permite copiar directamente a un grupo público ajeno donde solo sea colaboradora. Para ese caso se utiliza **Proponer restaurante**.

### Qué se copia

- Referencia del restaurante.
- Nombre, dirección, ciudad, coordenadas y categoría disponibles.
- Estado inicial: `WANT_TO_GO`.

### Qué no se copia

- Nota editorial del grupo de origen.
- Valoraciones.
- Estado del grupo de origen.
- Comentarios o actividad.
- Colaboradores.

### Duplicados

Si un restaurante ya está en el grupo de destino, se omite y se informa al finalizar.

Ejemplo:

> 4 restaurantes copiados · 1 ya estaba en tu grupo

### Atribución interna

Se recomienda conservar internamente el grupo público de origen para métricas y atribución futura, aunque no es necesario mostrarlo en el MVP.

---

## 11. Descubrimiento por ubicación

### Uso de ubicación

La ubicación del usuario se utiliza para ordenar grupos relevantes cercanos, siempre con permiso.

No se guarda ni muestra como ubicación pública del usuario.

### Ubicación del grupo

Un grupo se posiciona mediante:

1. Ciudad o zona configurada por el creador.
2. Centro geográfico aproximado de sus restaurantes aprobados con coordenadas.

Nunca mediante la ubicación actual del creador.

### Sin permiso de ubicación

Mesa utiliza:

- Ciudad guardada en el perfil, si existe.
- Última ciudad elegida en Explorar.
- Selector manual de ciudad como alternativa.

---

## 12. Explorar y popularidad

### Secciones iniciales

- Cerca de ti.
- Populares en tu zona.
- Nuevos esta semana.
- Categorías destacadas.
- Grupos que sigues.

### Filtros

- Ciudad o zona.
- Distancia.
- Categoría principal.
- Etiquetas.
- Más populares.
- Más recientes.

### Señales de ranking del MVP

La popularidad no depende únicamente del número de seguidores.

Propuesta inicial:

- 40 % proximidad y relevancia geográfica.
- 25 % seguidores y copias recientes.
- 20 % actividad reciente del grupo.
- 15 % calidad y completitud.

### Calidad y completitud

Se considera:

- Imagen y descripción completas.
- Al menos tres restaurantes aprobados.
- Notas editoriales útiles.
- Valoraciones reales.
- Ausencia de reportes confirmados.

### Protección para grupos nuevos

Los grupos nuevos reciben una exposición temporal limitada en **Nuevos esta semana**, evitando que los grupos grandes ocupen siempre todas las posiciones.

---

## 13. Moderación mínima del MVP

La parte pública necesita moderación desde el principio, aunque sea sencilla.

### Acciones disponibles

- Reportar grupo.
- Reportar nota editorial.
- Reportar valoración.
- Reportar perfil del creador o colaborador.

### Motivos

- Spam.
- Contenido ofensivo.
- Información falsa.
- Suplantación.
- Publicidad engañosa.
- Otro.

### Medidas básicas

- Ocultar contenido con múltiples reportes mientras se revisa.
- Limitar solicitudes repetidas.
- Limitar propuestas masivas.
- Registrar acciones del creador sobre solicitudes y propuestas.

No se introduce moderación automática compleja en el MVP.

---

## 14. Notificaciones del MVP

| Evento | Destinatario | Canal |
|---|---|---|
| Nueva solicitud de colaboración | Creador | In-app y push |
| Solicitud aceptada | Solicitante | In-app y push |
| Solicitud rechazada | Solicitante | In-app |
| Nueva propuesta de restaurante | Creador | In-app y push |
| Propuesta aprobada | Colaborador | In-app y push |
| Propuesta rechazada | Colaborador | In-app |
| Colaborador retirado | Colaborador | In-app |
| Restaurante añadido a grupo seguido | Seguidor | Fuera del MVP |

---

## 15. Métricas para validar la idea

### Descubrimiento

- Personas que abren `Explorar`.
- Grupos públicos abiertos desde Explorar.
- Tasa de apertura por tarjeta mostrada.
- Búsquedas sin resultados por ciudad.

### Valor aportado

- Seguimientos realizados.
- Restaurantes copiados a grupos propios.
- Grupos de destino creados después de descubrir contenido.
- Retorno a un grupo seguido.

### Participación

- Solicitudes de colaboración enviadas.
- Porcentaje aceptado.
- Propuestas enviadas y aprobadas.
- Colaboradores que valoran al menos un restaurante.

### Salud

- Reportes por grupo público.
- Solicitudes rechazadas repetidas.
- Propuestas duplicadas o spam.
- Grupos sin actividad durante 90 días.

### Señal principal recomendada

La métrica más importante del MVP no debería ser el número de seguidores, sino:

> **Porcentaje de usuarios que copian al menos un restaurante descubierto a un grupo propio.**

Esto demuestra que la parte pública genera utilidad real y alimenta el núcleo privado de Mesa.

---

## 16. Recorrido vertical que debe funcionar de principio a fin

1. Eustaquio crea o convierte un grupo en público.
2. Configura Girona, categoría Hamburguesas y acepta colaboradores.
3. Paula permite ubicación o elige Girona manualmente.
4. Mesa muestra el grupo en Explorar.
5. Paula entra como visitante y ve restaurantes, notas y valoraciones.
6. Paula sigue el grupo.
7. Paula copia dos restaurantes a su grupo privado.
8. Paula solicita colaborar con un mensaje.
9. Eustaquio acepta la solicitud.
10. Paula valora un restaurante.
11. Paula propone otro restaurante.
12. Eustaquio aprueba la propuesta.
13. El restaurante aparece públicamente con autoría y actividad registradas.

Este recorrido es el criterio funcional principal del MVP.

---

## 17. Decisiones de producto cerradas para el diseño

- `Mis grupos` y `Explorar` convivirán dentro de la sección Grupos.
- Seguir y colaborar son acciones distintas.
- Seguir es inmediato; colaborar requiere aprobación.
- Los colaboradores valoran y proponen, pero no editan directamente la lista publicada.
- Solo el creador administra la identidad y el contenido editorial del grupo.
- Copiar restaurantes es una función central del MVP.
- Las notas y valoraciones del grupo público no se copian al destino.
- La ubicación del creador nunca se utiliza para posicionar el grupo.
- El MVP utiliza `PRIVATE` y `PUBLIC`, sin visibilidad intermedia.
- La parte pública requiere reporte y límites anti-spam desde el lanzamiento.

---

## 18. Decisiones que pueden esperar a una segunda versión

- Perfil público completo del creador.
- Seguir personas además de grupos.
- Comentarios.
- Notificaciones para seguidores.
- Administradores múltiples.
- Listas colaborativas sin aprobación.
- Compartir grupos mediante enlace web público.
- Recomendación personalizada por gustos.
- Insignias de creador o verificación.
- Monetización o promoción patrocinada.
