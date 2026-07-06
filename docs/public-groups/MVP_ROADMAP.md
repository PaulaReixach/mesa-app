# Mesa · Grupos públicos — Hoja de ruta del MVP

## Propósito

Este documento define el orden de trabajo recomendado para construir la parte pública sin diseñar pantallas que después obliguen a rehacer permisos, navegación o modelo de datos.

La estrategia es avanzar mediante recorridos verticales pequeños: cada fase debe quedar utilizable de principio a fin antes de ampliar la siguiente.

---

## Fase 0 · Producto y UX

### Objetivo

Cerrar el comportamiento antes de programar.

### Entregables

- Especificación funcional.
- Matriz de permisos.
- Mapa de pantallas.
- Flujos de seguir, colaborar, proponer y copiar.
- Estados vacíos, errores y confirmaciones.
- Wireframes de baja fidelidad.
- Diseño visual de las pantallas principales.

### Decisiones que deben quedar cerradas

- Diferencia entre visitante, seguidor, colaborador y creador.
- Acciones permitidas a cada rol.
- Funcionamiento de la nota editorial y las valoraciones individuales.
- Qué ocurre al cambiar un grupo entre privado y público.
- Destinos permitidos al copiar restaurantes.
- Reglas de ubicación y popularidad.

### Definición de terminado

Una persona ajena al proyecto puede recorrer los wireframes y explicar correctamente:

- Qué significa seguir.
- Qué significa colaborar.
- Quién puede editar.
- Cómo copiar restaurantes.
- Cómo se aprueba una propuesta.

---

## Fase 1 · Base de grupos públicos

### Objetivo

Permitir que un creador publique un grupo y que otra persona pueda visualizarlo sin ser miembro.

### Alcance

- Visibilidad `PRIVATE` y `PUBLIC`.
- Ciudad o zona del grupo.
- Categoría y etiquetas.
- Opción para aceptar solicitudes.
- Lectura pública autenticada.
- Protección de datos privados.
- Detalle público adaptado al rol visitante.

### Recorrido validable

1. Un creador convierte un grupo en público.
2. Otro usuario abre el grupo.
3. Ve restaurantes, nota editorial y valoraciones.
4. No ve controles de edición.

### Fuera de esta fase

- Seguir.
- Solicitar colaborar.
- Proponer.
- Copiar.

---

## Fase 2 · Explorar por zona

### Objetivo

Permitir descubrir grupos públicos útiles según la ubicación o ciudad elegida.

### Alcance

- Selector `Mis grupos | Explorar`.
- Permiso de ubicación opcional.
- Ciudad manual como alternativa.
- Secciones Cerca de ti, Populares y Nuevos.
- Buscador.
- Filtros de distancia y categoría.
- Ranking inicial sencillo.

### Recorrido validable

1. La persona abre Explorar.
2. Permite ubicación o elige ciudad.
3. Encuentra un grupo público relevante.
4. Entra en su detalle.

### Riesgo principal

Pantalla vacía por falta de contenido local. Deben existir datos de demostración o grupos iniciales suficientes para probar Girona.

---

## Fase 3 · Seguir grupos

### Objetivo

Permitir guardar grupos públicos sin solicitar participación.

### Alcance

- Seguir y dejar de seguir.
- Estado persistente.
- Contador de seguidores.
- Sección Siguiendo en Mis grupos.
- Señal de popularidad.

### Recorrido validable

1. La persona sigue un grupo desde Explorar o el detalle.
2. Vuelve a Mis grupos.
3. Lo encuentra en Siguiendo.
4. Puede dejar de seguirlo.

### Definición de terminado

Seguir no concede ningún permiso adicional y nunca crea una membresía.

---

## Fase 4 · Copiar restaurantes

### Objetivo

Convertir descubrimiento público en utilidad privada.

### Alcance

- Selección múltiple.
- Selector de grupo de destino.
- Validación de permisos del destino.
- Detección de duplicados.
- Copia con estado `WANT_TO_GO`.
- Resumen de éxito total o parcial.
- Registro interno del origen para métricas.

### Recorrido validable

1. La persona abre un grupo público.
2. Selecciona varios restaurantes.
3. Elige un grupo privado propio.
4. Confirma.
5. Los encuentra en su grupo como pendientes.

### Definición de terminado

No se copian notas, valoraciones ni estados del grupo público.

### Razón para priorizarla

Es la función que conecta directamente la parte pública con el valor principal actual de Mesa. Debe construirse antes de la colaboración social compleja.

---

## Fase 5 · Solicitudes de colaboración

### Objetivo

Permitir que una persona pida participar sin entrar automáticamente.

### Alcance

- Activar o desactivar solicitudes.
- Enviar solicitud con mensaje opcional.
- Estado pendiente.
- Cancelar solicitud.
- Gestión por parte del creador.
- Aceptar o rechazar.
- Notificaciones.
- Límite temporal tras rechazo.

### Recorrido validable

1. Seguidor o visitante solicita colaborar.
2. El creador recibe la solicitud.
3. La acepta.
4. El solicitante pasa a colaborador.
5. La interfaz cambia sin mostrar controles de creador.

---

## Fase 6 · Valoraciones y propuestas

### Objetivo

Permitir colaboración útil sin perder el control editorial.

### Alcance

- Valoración individual por colaborador.
- Edición y eliminación de valoración propia.
- Proponer restaurante.
- Editar o cancelar propuesta pendiente.
- Aprobar o rechazar propuesta.
- Nota editorial final del creador.
- Notificaciones.

### Recorrido validable

1. Colaborador valora un restaurante.
2. La media pública se actualiza.
3. Propone un restaurante nuevo.
4. El creador revisa y aprueba.
5. El restaurante aparece públicamente.

### Regla de seguridad

El colaborador no modifica directamente restaurantes aprobados ni la nota editorial.

---

## Fase 7 · Moderación y salud

### Objetivo

Evitar que la apertura pública deteriore la confianza de Mesa.

### Alcance

- Reportar grupo, nota, valoración o perfil.
- Motivos de reporte.
- Límites de solicitudes y propuestas.
- Registro de acciones administrativas.
- Ocultación temporal bajo criterios definidos.
- Panel mínimo de revisión administrativa.

### Recorrido validable

1. Una persona reporta contenido.
2. El reporte queda registrado.
3. El contenido puede revisarse y moderarse.
4. El autor no puede identificar al reportante.

---

## Fase 8 · Métricas y ajuste del ranking

### Objetivo

Comprobar si la parte pública aporta utilidad real.

### Eventos mínimos

- `public_explore_opened`
- `public_group_impression`
- `public_group_opened`
- `public_group_followed`
- `public_restaurant_copy_started`
- `public_restaurant_copied`
- `collaboration_requested`
- `collaboration_accepted`
- `restaurant_proposed`
- `restaurant_proposal_approved`
- `public_content_reported`

### Métrica principal

Porcentaje de usuarios que copian al menos un restaurante público a un grupo propio.

### Ajustes posteriores

- Pesos de cercanía.
- Exposición de grupos nuevos.
- Calidad mínima.
- Penalización por inactividad o reportes.

---

## Orden de diseño UI recomendado

Antes de comenzar la Fase 1 técnica, diseñar:

1. Grupos con selector `Mis grupos | Explorar`.
2. Pantalla Explorar.
3. Tarjeta de grupo público.
4. Detalle público como visitante.
5. Detalle público como seguidor.
6. Flujo Copiar restaurantes.
7. Panel Solicitar colaboración.
8. Gestión de solicitudes.
9. Detalle como colaborador.
10. Proponer y gestionar propuestas.

Los estados de creador y colaborador deben diseñarse sobre la misma pantalla base, evitando duplicar pantallas completas por rol.

---

## Estrategia de ramas futura

Cuando comience la implementación, evitar una única rama gigantesca.

Propuesta:

```text
feature/public-groups-foundation
feature/public-groups-explore
feature/public-groups-following
feature/public-groups-copy
feature/public-groups-collaboration
feature/public-groups-proposals
feature/public-groups-moderation
```

Cada rama debe partir de `main` o de una rama de integración pública temporal si existen dependencias encadenadas.

---

## Recomendación final

La primera implementación no debería empezar por solicitudes ni seguidores. El orden más seguro es:

```text
Publicar y visualizar
→ Explorar
→ Seguir
→ Copiar restaurantes
→ Colaborar
→ Proponer y valorar
→ Moderar y optimizar
```

Así Mesa obtiene primero una experiencia pública útil y comprensible. La capa social se añade después, sobre una base ya validada.
