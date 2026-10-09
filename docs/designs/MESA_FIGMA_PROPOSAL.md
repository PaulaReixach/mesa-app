# MESA · Sobremesa · Propuesta visual

Fecha: 1 de octubre de 2026.

Archivo: https://www.figma.com/design/VyXRQ0CWShGEjkACvUPYD0?node-id=5-2

## Entrega

Cinco vistas vectoriales importadas, con formas y textos editables:

| Vista | Nodo de Figma | Fuente |
| --- | --- | --- |
| Inicio | 5:2 | mesa-inicio.svg |
| Grupo con restaurantes | 5:321 | mesa-grupo.svg |
| Restaurante con valoraciones | 5:256 | mesa-restaurante.svg |
| Grupo vacío | 5:136 | mesa-grupo-vacio.svg |
| Restaurante sin valoraciones | 5:200 | mesa-restaurante-sin-valoraciones.svg |

La propuesta prioriza la lista compartida y una acción principal por pantalla. Fondo crema #FAF7F0, texto #2D3025, terracota #A6412B y oliva #526043. Inter para controles y cuerpo; Fraunces para títulos, como propuesta distinta de la tipografía actual. Las ilustraciones son originales y representan la marca, no fotos de restaurantes. Los datos son ficticios.

## Archivos creados

- Cinco SVG, `mesa-sobremesa-preview.html` y captura `mesa-sobremesa-preview.png`.
- `mesa-sobremesa-export.cjs` y `mesa-icons.json`: generación reproducible de las vistas; iconos Lucide.
- `mesa-preview-server.cjs`: servidor local, enlazado solo a 127.0.0.1.
- `figma-sobremesa-foundations.js`, `figma-sobremesa-components.js` y sus archivos de estado: fuentes y registro de la base inicial de Figma.

Esta tarea de diseño no modifica mobile/ ni backend/.

## Vista previa y prueba manual

Ejecutar desde la raíz:

```powershell
node docs/designs/mesa-preview-server.cjs
```

Abrir http://127.0.0.1:8769. El servidor estaba en ejecución al entregar.

1. Comparar Inicio, Grupo y Restaurante en «Vista conjunta».
2. Abrir «Los de siempre» y después «Casa Nona».
3. Probar añadir una valoración, cambiar estado y marcar favorito. Son simulaciones locales.
4. Seleccionar «Grupo vacío» y añadir un nombre ficticio. Comprobar que aparece un restaurante pendiente y sin valoración.
5. Seleccionar «Sin valoraciones» para revisar el estado inicial.
6. Usar «Restablecer» para volver a la composición original.

Mapas, filtros, invitaciones y perfil muestran avisos; no constituyen flujos implementados. La vista previa no accede al backend ni persiste datos.

## Comprobaciones

- Importación de los cinco SVG confirmada por Figma y revisión visual en su navegador.
- Revisión visual de las tres pantallas en la vista previa, sin solapamientos visibles.
- Navegación por teclado hacia el grupo, guardado simulado de valoración (media 4,7 tras añadir un 5), alta desde grupo vacío (un restaurante, pendiente, sin valoración) y restablecimiento comprobados.
- `node --check` para generador y servidor: correcto.
- Sintaxis del script del HTML comprobada con `new Function`: correcta.
- Los cinco SVG se han analizado como XML: correctos.
- `git diff --check`: sin errores de espacios; avisos de finales de línea en archivos preexistentes.

## Pendiente y límites

El límite del plan Starter bloqueó las siguientes operaciones del MCP de Figma. La base contiene variables, estilos y componentes iniciales, pero las vistas importadas no están vinculadas a instancias reutilizables ni tienen auto-layout equivalente a una interfaz nativa. Los marcos vacíos iniciales permanecen junto a las importaciones. El nombre automático de los SVG es «Uploaded Image».

La biblioteca inicial requiere corregir el tamaño de botones y otros elementos horizontales. La corrección está en el script local, pero no se pudo aplicar al archivo por el límite. No se presenta como biblioteca terminada para producción.

El navegador de Figma estaba en modo visitante: permitió comprobar el resultado pero no terminar su organización. No se cambiaron permisos ni se contrató un plan.

El intento de comprobar el ancho 320 mediante la capacidad de viewport no alteró el ancho efectivo de 1440; no se considera verificación de pantalla estrecha. La vista previa escala SVG fijos de 390 × 844. Quedan pendientes las pruebas de texto ampliado, áreas seguras, teclado y comportamiento en un dispositivo nativo.

Para avanzar hacia el producto final: revisar primero esta dirección visual, completar componentes y estados, y trasladar una pantalla al código existente para comprobarla en la app antes de extenderla.
