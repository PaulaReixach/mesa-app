# Mesa · Implementación del login

Fecha: 8 de septiembre de 2026. Rama: `codex/login-redesign`.
Referencia visual: [propuesta aprobada](mesa-login-v1.png), la segunda imagen mostrada en la conversación.

## Cambios

- `mobile/src/app/(auth)/login.tsx`: cabecera compacta con marca y lema como texto nativo, ilustración independiente, formulario marfil y botón terracota. Recuperación junto a Contraseña, Mantener sesión en una fila propia y registro separado del área inferior del sistema.
- El encabezado reduce su contenido cuando aparece el teclado. El formulario se puede desplazar; los campos permiten texto ampliado y los elementos principales tienen zonas de pulsación de 48–56 dp. La franja de la barra de estado conserva su fondo terracota al desplazar el formulario.
- Validación de campos vacíos junto a cada campo y foco en el primero incompleto. Siguiente pasa a contraseña; la acción del teclado envía el formulario. Mostrar/ocultar contraseña y autofill.
- Carga con indicador y texto Entrando, bloqueo de edición y de acciones durante la petición, y protección síncrona ante envíos simultáneos desde teclado y botón. Los errores conservan los datos para poder reintentar.
- `mobile/src/components/FormField.tsx`: variante opcional `login`, accesorio de etiqueta, referencia al campo y dimensiones adaptables. La variante predeterminada conserva el diseño existente.
- `mobile/src/components/PrimaryButton.tsx`: variante opcional `login` y estados accesibles de carga/deshabilitado.
- `mobile/src/theme/colors.ts`: paleta `loginColors` independiente, sin sustituir los colores generales.
- `mobile/assets/images/login-header-table.png`: ilustración de cabecera derivada de la referencia aprobada.

Se reutilizan el contexto de autenticación, el cliente API, las fuentes Inter, los componentes compartidos y Expo Router. Mantener sesión sigue pasando su valor al `signIn` existente. No se ha añadido un servicio de autenticación nuevo.

Los cambios de `mobile/package.json` y `mobile/package-lock.json` ya estaban presentes al comenzar y no fueron modificados por esta tarea. No se editaron archivos .env ni el backend. No se hicieron commits, pushes ni publicaciones.

## Comprobaciones

- `node node_modules/typescript/bin/tsc --noEmit`, ejecutado desde `mobile`: correcto tras los cambios.
- `node node_modules/expo/bin/cli export --platform android --platform ios --output-dir "$env:TEMP/mesa-login-export"`: exportación de bundles con Hermes, no generación de APK/IPA.
- `git diff --check` sobre los archivos de código modificados: correcto.
- Revisión visual aislada con React Native Web de los mismos componentes de producción, las fuentes Inter y la ilustración, con áreas seguras de 24 px arriba y abajo.
- A 390 × 844: formulario, botón y Crear cuenta visibles; registro a y=684–732 antes del último ajuste equivalente de la franja superior.
- A 320 × 640: no se detectó desbordamiento horizontal de títulos ni controles. Se verificó el desplazamiento al final; Crear cuenta queda a y=544–592, por encima del área segura inferior.
- Verificados: errores de campos vacíos y foco, avance de Email a Contraseña, mostrar contraseña, cambio de Mantener sesión, carga/deshabilitado, doble pulsación con una sola petición, error de credenciales, error de conexión y acción de navegación a `/register`.
- Las respuestas de acceso y el enrutador fueron simulados exclusivamente en el visor temporal; no se utilizaron credenciales reales ni se crearon cuentas. El visor temporal se retiró de la aplicación después de la revisión.

La app web completa presenta un error previo de una dependencia nativa (`codegenNativeComponent is not a function`), por lo que no se usó como prueba de la app completa. No hay un dispositivo Android conectado ni un emulador configurado en este entorno. Quedan pendientes las pruebas físicas del teclado, TalkBack/VoiceOver, texto ampliado, sesión persistida y acceso real contra el backend. La compilación de bundles no sustituye estas pruebas.

## Cómo probar en Android

### Con una build de desarrollo de Mesa instalada

Si Expo está abierto en otra terminal, detenlo con Ctrl+C. Desde PowerShell:

```powershell
cd C:\Users\Paula\IdeaProjects\mesa-app\mobile
npx expo start --dev-client --clear
```

Abre la build de desarrollo de Mesa y conecta con el QR de esta terminal. Si la app entra directamente en Inicio, cierra sesión para ver el nuevo login. El teléfono y el ordenador deben estar en la misma red y el backend debe ser accesible mediante `EXPO_PUBLIC_API_URL`.

### Con un APK de preview

Un APK de preview ya instalado no recibe automáticamente este cambio local. Para generar otro:

```powershell
cd C:\Users\Paula\IdeaProjects\mesa-app\mobile
npx eas-cli build --platform android --profile preview
```

Antes de compilar, `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` deben estar configuradas en el entorno **preview** de EAS. El archivo local `mobile/.env` no se sube. Descarga e instala el APK de la nueva compilación terminada desde el [historial de Mesa en Expo](https://expo.dev/accounts/paulirei/projects/mobile/builds).

Esta tarea no ha enviado una compilación a EAS ni ha generado un APK nuevo.

## Recorrido manual

1. Cierra sesión si es necesario. Comprueba la cabecera, el botón Entrar y el enlace Crear cuenta.
2. Pulsa Entrar con los campos vacíos: deben aparecer los mensajes junto a los campos y enfocarse Email.
3. Escribe tu email; pulsa Siguiente. Debe enfocarse Contraseña.
4. Abre/cierra el teclado y alterna Mostrar/Ocultar contraseña. En un móvil pequeño, comprueba que se puede desplazar hasta el registro.
5. Prueba una contraseña incorrecta y después una válida. El error debe permitir reintentar sin perder el email; el acceso correcto debe llevar a Inicio.
6. Prueba Mantener sesión activado y desactivado cerrando completamente y reabriendo la aplicación después de entrar.
7. Prueba Crear cuenta y volver atrás.
8. Repite con texto grande y con el lector de pantalla.
9. Comprueba que recuperar contraseña sigue mostrando el aviso existente.

## Pendiente fuera del rediseño

El servicio de recuperación de contraseña no existe actualmente en el backend. El enlace conserva su aviso de disponibilidad futura; no simula el envío de un correo. Completar ese flujo y probarlo en dispositivos reales sigue siendo necesario antes de publicar.

## Ilustración: procedencia y prompt

Herramienta integrada `image_gen`, no CLI. Referencia: `docs/designs/mesa-login-v1.png`. Destino consumido por la app: `mobile/assets/images/login-header-table.png`.

Prompt final utilizado:

> Use case: ui-mockup supporting illustration asset. The input is a reference for the restaurant table illustration only. Make a production mobile login HEADER BACKGROUND image, 1600x800 landscape 2:1. Exact perfectly FLAT SOLID background color #B34D32. This is opaque, NOT transparent; no checkerboard. On the RIGHTMOST 48% of the canvas ONLY reproduce the delicate cream-line and peach-fill illustration from the reference: two dining plates, two gently posed hands, fork, folded napkin, glass, vase with leaves. Fine editorial line work, graceful composition, no heavy outlines. The LEFTMOST 52% must remain COMPLETELY EMPTY solid #B34D32 space for native app text that will be placed later. Do not draw ANY typography, letters, logo, wordmark, slogan, status bar, phone controls, rounded card, buttons or interface. All four canvas edges and the whole empty left area must have the exact same uninterrupted FLAT solid color #B34D32. Avoid textures, gradients, vignette or noise in the background. This is a simple raster illustration asset derived from the approved Mesa design, not the whole screen.

La imagen generada conserva pequeñas variaciones de textura y proporción propias del modelo. El texto y los controles se implementan en React Native.

