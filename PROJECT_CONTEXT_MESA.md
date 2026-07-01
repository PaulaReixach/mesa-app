# Mesa — Contexto del proyecto

## 1. Resumen

**Mesa** es una aplicación colaborativa para guardar, organizar, puntuar y planificar visitas a restaurantes con una pareja, amigos o grupos.

No pretende sustituir a Google Maps, Tripadvisor o TheFork. Su valor está en organizar los restaurantes que interesan a un grupo concreto, guardar las opiniones de cada miembro y facilitar la decisión de dónde ir.

Ejemplos de grupos:

- Paula y Angel
- Restaurantes con las amigas
- Viaje a Japón
- Brunch pendientes
- Cenas de empresa

---

## 2. Problema que resuelve

Actualmente, los restaurantes recomendados o pendientes suelen terminar repartidos entre:

- Google Maps
- Notas del móvil
- Capturas de Instagram
- Conversaciones de WhatsApp
- TikTok
- Listas personales

Mesa centraliza todo eso y permite saber:

- A qué restaurantes quiere ir el grupo.
- Cuáles ya ha visitado.
- Qué puntuación ha dado cada persona.
- Cuál es la media del grupo.
- Qué restaurantes son favoritos.
- Cuáles quedan cerca.
- Qué lugares encajan con un tipo de comida, precio o ubicación.
- Dónde ir en el próximo plan.

---

## 3. Flujo principal de usuario

1. Una persona se registra.
2. Crea un grupo.
3. Invita a otras personas.
4. Busca un restaurante mediante un proveedor gratuito basado en OpenStreetMap.
5. Añade el restaurante al grupo.
6. Selecciona un estado:
   - Quiero ir
   - Visitado
   - Favorito
   - Quiero repetir
   - No repetir
   - Archivado
7. Cada miembro añade su propia puntuación y notas.
8. La aplicación calcula la media del grupo.
9. El grupo puede filtrar, ordenar, ver el mapa y planificar la próxima visita.

---

## 4. MVP

La primera versión incluirá:

### Usuarios

- Registro.
- Inicio de sesión.
- Perfil básico.
- Autenticación con JWT.

### Grupos

- Crear grupos.
- Editar grupos.
- Invitar miembros.
- Ver miembros.
- Roles básicos:
  - Administrador
  - Miembro

### Restaurantes

- Buscar restaurantes automáticamente.
- Añadir un restaurante a un grupo.
- Añadir manualmente si no aparece en el buscador.
- Evitar duplicados usando el identificador externo del proveedor.
- Guardar:
  - Nombre
  - Dirección
  - Ciudad
  - País
  - Coordenadas
  - Tipo de establecimiento
  - Tipo de cocina, si está disponible
  - Teléfono, web y horario, si están disponibles

### Organización dentro del grupo

- Estado del restaurante.
- Persona que lo propuso.
- Nota del grupo.
- Fecha de añadido.
- Favoritos.
- Filtros por:
  - Estado
  - Tipo de cocina
  - Ciudad
  - Puntuación
  - Distancia

### Valoraciones

Cada miembro puede tener una valoración propia con:

- Puntuación general.
- Comida.
- Servicio.
- Ambiente.
- Calidad-precio.
- Comentario.
- Volvería o no.
- Fecha de visita.

La aplicación mostrará:

- Valoraciones individuales.
- Media del grupo.
- Ranking del grupo.

---

## 5. Funcionalidades posteriores al MVP

- Colecciones personalizadas.
- Historial de varias visitas.
- Platos pedidos.
- Fotografías.
- Mapa interactivo.
- Restaurantes cercanos.
- Votaciones para elegir dónde ir.
- Planes con fecha y hora.
- Notificaciones.
- Ruleta de restaurantes.
- Resumen anual.
- Estadísticas personales.
- Recomendaciones basadas en los gustos del grupo.
- Aplicación móvil.

---

## 6. Tecnologías

### Backend

- Java 21.
- Spring Boot 4.1.0.
- Maven.
- Spring Web.
- Spring Data JPA.
- Spring Security.
- JWT.
- Bean Validation.
- PostgreSQL.
- Flyway.
- Lombok.
- MapStruct.
- JUnit.
- Mockito.
- OpenAPI / Swagger.

### Frontend

Se añadirá más adelante:

- React.
- TypeScript.
- Vite.
- React Router.
- TanStack Query.
- React Hook Form.
- Zod.
- Tailwind CSS o una solución de estilos equivalente.
- React Leaflet.

### Infraestructura

- GitHub.
- Docker.
- Docker Compose.
- GitHub Actions más adelante.

---

## 7. Servicios externos gratuitos

El proyecto debe poder funcionar inicialmente con un coste de **0 €**.

### Búsqueda de lugares

- Photon.
- Datos de OpenStreetMap.

### Restaurantes cercanos

- Overpass API.

### Mapa

- Leaflet.
- React Leaflet.
- OpenStreetMap.

### Consideraciones

- Los servicios públicos gratuitos no deben tratarse como una infraestructura para millones de usuarios.
- Se aplicará debounce en las búsquedas.
- Se limitará el número de resultados.
- Se almacenarán los restaurantes seleccionados en PostgreSQL.
- Se añadirá caché donde sea conveniente.
- Se mostrará la atribución de OpenStreetMap.
- La entrada manual será un respaldo cuando un lugar no aparezca.

---

## 8. Arquitectura

Se empezará con un **monolito modular**, no con microservicios.

Paquete raíz:

```text
com.pauluna.mesa
```

Organización por funcionalidad:

```text
com.pauluna.mesa
├── shared
├── auth
├── user
├── group
├── restaurant
├── review
├── place
├── invitation
├── collection
└── visit
```

Cada módulo podrá dividirse en:

```text
module
├── api
├── application
├── domain
└── infrastructure
```

No se usarán carpetas globales gigantes como:

```text
controller
service
repository
entity
```

La aplicación podrá evolucionar hacia microservicios en el futuro, pero solo cuando existan límites de dominio claros y una necesidad real.

---

## 9. Modelo de dominio inicial

### User

- id
- name
- username
- email
- passwordHash
- avatarUrl
- createdAt
- updatedAt

### Group

- id
- name
- description
- imageUrl
- ownerId
- city
- privacy
- createdAt
- updatedAt

### GroupMember

- id
- groupId
- userId
- role
- joinedAt

### Restaurant

- id
- provider
- externalPlaceId
- externalPlaceType
- name
- address
- city
- country
- latitude
- longitude
- phone
- website
- openingHours
- cuisineType
- createdAt
- updatedAt

### GroupRestaurant

Relaciona un restaurante con un grupo y guarda la información específica de ese grupo.

- id
- groupId
- restaurantId
- status
- proposedBy
- groupNotes
- addedAt

### Review

- id
- groupRestaurantId
- userId
- generalScore
- foodScore
- serviceScore
- ambienceScore
- valueScore
- comment
- wouldReturn
- visitedAt
- createdAt
- updatedAt

### Collection

- id
- groupId
- name
- description
- createdBy
- createdAt

### Visit

- id
- groupRestaurantId
- visitDate
- notes
- createdBy

---

## 10. Reglas de negocio

- Solo los miembros de un grupo privado pueden verlo.
- Solo los miembros pueden añadir restaurantes.
- Cada usuario tiene una valoración propia por restaurante y grupo.
- Un usuario puede modificar su valoración.
- Nadie puede modificar la valoración de otra persona.
- La media se calcula solo con valoraciones existentes.
- Un restaurante puede pertenecer a varios grupos.
- El estado de un restaurante depende del grupo.
- Borrar un restaurante de un grupo no debe eliminarlo globalmente.
- El identificador externo del proveedor se utilizará para evitar duplicados.
- Un restaurante puede existir sin foto.
- Las fotografías no se copiarán de Google, Instagram o Tripadvisor sin permiso.
- La entrada manual será posible cuando un restaurante no aparezca en el buscador.

---

## 11. Endpoints previstos

### Salud

```http
GET /api/health
```

### Autenticación

```http
POST /api/auth/register
POST /api/auth/login
```

### Grupos

```http
POST /api/groups
GET /api/groups
GET /api/groups/{groupId}
PUT /api/groups/{groupId}
POST /api/groups/{groupId}/invitations
```

### Restaurantes

```http
GET /api/places/search
GET /api/places/nearby
POST /api/groups/{groupId}/restaurants
GET /api/groups/{groupId}/restaurants
GET /api/groups/{groupId}/restaurants/{restaurantId}
PATCH /api/groups/{groupId}/restaurants/{restaurantId}/status
DELETE /api/groups/{groupId}/restaurants/{restaurantId}
```

### Valoraciones

```http
POST /api/groups/{groupId}/restaurants/{restaurantId}/reviews
PUT /api/groups/{groupId}/restaurants/{restaurantId}/reviews/me
GET /api/groups/{groupId}/restaurants/{restaurantId}/reviews
```

---

## 12. Interfaz del proveedor de lugares

La lógica de negocio no debe depender directamente de Photon u otro proveedor.

```java
public interface PlaceProvider {

    List<PlaceSearchResult> search(
        String query,
        BigDecimal latitude,
        BigDecimal longitude
    );

    List<PlaceSearchResult> findNearby(
        BigDecimal latitude,
        BigDecimal longitude,
        Integer radiusMeters
    );
}
```

Implementación inicial prevista:

```java
@Component
public class OpenStreetMapPlaceProvider implements PlaceProvider {

    private final PhotonClient photonClient;
    private final OverpassClient overpassClient;
}
```

---

## 13. Repositorio y estructura

Repositorio:

```text
mesa-app
```

Estructura prevista:

```text
mesa-app/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── PROJECT_CONTEXT.md
└── README.md
```

Backend actual:

```text
backend/
├── .mvn/
├── src/
├── mvnw
├── mvnw.cmd
└── pom.xml
```

---

## 14. Estado actual del desarrollo

Completado:

- Repositorio `mesa-app` creado.
- Backend creado con Spring Initializr.
- Java 21 instalado y configurado.
- Spring Boot 4.1.0.
- Maven Wrapper funcionando.
- Dependencias iniciales:
  - Spring Web
  - Validation
  - Lombok
  - Spring Boot DevTools
- Aplicación arrancando en el puerto 8080.
- Primer commit realizado.

Todavía no está implementado:

- PostgreSQL.
- Docker Compose.
- Spring Data JPA.
- Flyway.
- Endpoint `/api/health`.
- Usuarios.
- Grupos.
- Restaurantes.
- Frontend.

---

## 15. Próximo paso

Configurar PostgreSQL mediante Docker Compose y conectar Spring Boot.

Tareas:

1. Comprobar que Docker Desktop está instalado.
2. Crear `docker-compose.yml` en la raíz del repositorio.
3. Levantar PostgreSQL.
4. Añadir al `pom.xml`:
   - Spring Data JPA
   - PostgreSQL Driver
   - Flyway
5. Crear `application.yml`.
6. Probar la conexión.
7. Crear la primera migración.
8. Arrancar la aplicación.
9. Hacer commit.

---

## 16. Convenciones de Git

Ejemplos de commits:

```text
chore: initialize Spring Boot backend
chore: configure PostgreSQL with Docker
feat: add health endpoint
feat: create restaurant groups
feat: add restaurant search
fix: prevent duplicate restaurants
test: add group service tests
```

Para funcionalidades:

```text
feature/create-groups
feature/add-restaurants
feature/restaurant-reviews
feature/place-search
```

---

## 17. Reglas para trabajar con Codex

No pedirle que genere toda la aplicación de una vez.

Cada tarea debe:

- Tener un alcance pequeño.
- Indicar tecnologías y arquitectura.
- Explicar qué debe crear.
- Indicar qué no debe tocar.
- Pedir tests cuando proceda.
- Pedir una explicación final de los cambios.
- Pedir instrucciones para probarlo.
- Revisarse antes de hacer commit.

Ejemplo de formato:

```text
Contexto:
[Descripción breve del proyecto]

Objetivo:
[Una única tarea]

Restricciones:
[Arquitectura, tecnologías y reglas]

No hacer:
[Lo que queda fuera]

Entrega:
- Archivos modificados
- Explicación de la implementación
- Pasos para probarlo
```

---

## 18. Prompt para continuar en un chat nuevo

Copia este texto junto con este archivo:

```text
Estoy desarrollando una aplicación llamada Mesa.

Te adjunto el archivo PROJECT_CONTEXT_MESA.md con toda la información funcional, técnica y el estado actual del proyecto.

Quiero continuar exactamente desde el apartado "Estado actual del desarrollo" y realizar únicamente el siguiente paso pendiente.

Guíame paso a paso, sin adelantar varias fases a la vez. Antes de proponer código, ten en cuenta las decisiones ya tomadas en el documento. Cuando propongas cambios de código, entrégame los archivos completos.
```

---

## 19. Forma de trabajo acordada

- Avanzar paso a paso.
- No saltar a tareas futuras.
- Explicar el motivo de cada decisión.
- Mantener el proyecto gratuito durante el MVP.
- Priorizar un código mantenible y entendible.
- Entregar archivos completos cuando haya cambios de código.
- Construir primero una versión funcional y después añadir complejidad.
