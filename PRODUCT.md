# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

App móvil nativa para iOS y Android (Expo + React Native). Una sola identidad Mesa en
ambos sistemas, respetando las convenciones nativas de cada uno: navegación, hojas,
gesto de volver y hápticos.

## Users

Grupos de personas que comparten restaurantes. En la primera beta tienen el mismo peso
los dos tipos de grupo:

- **Grupos privados:** parejas, amigos, viajes o compañeros de trabajo que se conocen y
  reúnen en una lista los sitios que les interesan, los que ya han visitado y lo que
  opina cada uno («Paula y Angel», «Restaurantes con las amigas», «Viaje a Japón»).
- **Grupos públicos:** listas abiertas que otros usuarios pueden seguir y a las que
  pueden proponer sitios. El propietario es quien gestiona la lista.

Su tarea: dejar de perder recomendaciones repartidas entre Google Maps, notas,
capturas de Instagram, TikTok y WhatsApp, y decidir juntos a dónde ir.

## Product Purpose

Mesa centraliza los restaurantes que interesan a un grupo concreto: qué quiere probar,
qué ha visitado, qué ha puntuado cada persona, la media del grupo y qué sitios son
favoritos. Ayuda a decidir el próximo plan. Para Mesa, el éxito es que un grupo vuelva
a su lista compartida cuando tiene que elegir dónde comer.

## Positioning

Mesa no sustituye a Google Maps, Tripadvisor ni TheFork. Su unidad es **el grupo**: la
lista, el estado y las opiniones de un sitio dependen del grupo en el que está. Las
opiniones son de personas conocidas o de la lista que sigues, no de reseñas anónimas.
Un mismo restaurante puede tener estados distintos en grupos distintos.

## Operating Context

- Uso recurrente: grupo → sitios pendientes → restaurante → decidir → valorar después
  de la visita.
- Primer uso: bienvenida → registro → crear grupo → guardar el primer sitio → invitar.
  Se puede empezar con un grupo de una sola persona.
- Navegación: Inicio · Grupos · Añadir · Mapa · Perfil.
- La búsqueda de lugares usa Nominatim/OpenStreetMap, con búsqueda explícita, como
  máximo 10 resultados y caché. Si un sitio no aparece, se añade a mano. Hay que mostrar
  la atribución de OpenStreetMap.
- Backend: monolito modular en Java 21 / Spring Boot 4 con PostgreSQL. El objetivo es
  que el MVP cueste 0 €.

## Capabilities and Constraints

- Cuenta: registro, inicio de sesión (JWT en SecureStore), perfil, ajustes, cambio de
  contraseña y borrado de cuenta.
- Grupos: privados y públicos, invitaciones, miembros, roles (propietario/miembro) y
  seguir grupos públicos. En un grupo público, los colaboradores proponen sitios y el
  propietario los añade.
- Restaurantes por grupo: estados (Quiero ir, Visitado, Quiero repetir, No repetir,
  Archivado). Favorito es un booleano independiente, no un estado. También guardan nota
  del grupo, quién lo propuso y fecha.
- Valoraciones: una puntuación entera de 1 a 5 por persona, restaurante y grupo, más la
  media del grupo, que solo cuenta las valoraciones que existen. «Sin valorar» no es lo
  mismo que una puntuación baja. En la beta no hay subpuntuaciones, planes con fecha,
  votaciones ni ruleta.
- Mapa con los sitios del grupo. La ubicación personal es opcional.
- Notificaciones push e invitaciones.
- Idioma: **solo español** en la beta.
- La app debe tener modo claro y modo oscuro.
- Pendiente (según la revisión del 1 de octubre de 2026): documentos legales reales,
  recuperación de contraseña, flujo de denuncia/bloqueo para grupos públicos y
  privacidad de las imágenes de grupos privados.

## Brand Commitments

- Nombre **Mesa**. Concepto: «Un lugar para encontrarnos». Lema: «Tus sitios, con los
  tuyos.» Personalidad cercana, abierta y sencilla.
- Logo: una «m» de dos arcos con una curva que sugiere una mesa, y el logotipo «mesa»
  con trazos redondeados. Siempre se usan los SVG oficiales
  (`mobile/assets/images/brand/`); nunca se sustituyen por texto. No se estiran, rotan
  ni sombrean.
- Colores de marca obligatorios: Terracota `#A6412B` (el encuentro, acción principal,
  con moderación), Carbón `#272924` (lectura), Oliva `#4C5C3C` (apoyo), Crema `#FCFAF7`
  (superficie clara). El modo oscuro se deriva de estos mismos colores.
- Fuente de la identidad: `docs/designs/prototipo/brand.html` (y `brand/USO.md`). El
  sistema visual aplicado está en `DESIGN.md`.
- La dirección «Sobremesa» anterior se ha descartado.

## Evidence on Hand

- Fotos que suben los propios usuarios de restaurantes y grupos: se usan y deben verse
  bien.
- Prototipo de producto en `docs/designs/prototipo/` (`node server.cjs` →
  http://127.0.0.1:8770), con capturas de cada pantalla.
- Revisiones anteriores (solo antecedentes): `docs/archive/`.
- **No existen y no deben inventarse:** fotos de terceros ni de stock de restaurantes,
  testimonios, cifras de usuarios, valoraciones públicas ni reseñas de prensa. Las
  personas, notas y puntuaciones del prototipo son de ejemplo.

## Product Principles

1. **El grupo siempre visible.** Toda lista, opinión y acción indica a qué grupo
   pertenece.
2. **Honestidad con los datos.** Nada de fotos ajenas presentadas como del local ni
   afirmaciones como «el mejor valorado» sin valoraciones. Tampoco se prometen reservas,
   rutas, IA ni funciones que no existen.
3. **Una acción principal en cada decisión.** Guardar un sitio debe ser el gesto más
   rápido de la app.
4. **Prever lo que falta.** Sin foto, sin categoría, sin ubicación, sin conexión o sin
   valoraciones son estados normales y se diseñan como tales.
5. **Permisos coherentes con el dominio.** La interfaz ofrece lo que el backend
   permite, y nada más.

## Accessibility & Inclusion

- Contraste WCAG 2.2 AA: texto ≥ 4,5:1 e indicadores no textuales ≥ 3:1, en claro y en
  oscuro.
- Respetar la letra grande del sistema (no desactivar el escalado) y permitir que el
  texto se recoloque, incluidos nombres largos.
- Áreas táctiles ≥ 44 pt (iOS) / 48 dp (Android).
- Etiquetas y estados accesibles para lectores de pantalla (VoiceOver/TalkBack), por
  ejemplo favorito, estado y puntuación.
- Respetar la preferencia de reducir movimiento.
