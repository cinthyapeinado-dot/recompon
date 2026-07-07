# Recompón

Recompón es una PWA premium de entrenamiento para gimnasio, pensada para usarse como una app mobile-first en iPhone y Android. La experiencia guía la sesión paso a paso, guarda el progreso en local, registra pesos por ejercicio y mantiene historial, estadísticas, cronómetro de descanso y soporte de instalación como app.

## Stack

- React 18
- Vite 5
- TypeScript 5
- Tailwind CSS 3
- LocalStorage para persistencia local
- `manifest.json` + `service worker` para PWA instalable
- Vitest para pruebas unitarias
- Vercel para despliegue

## Funcionalidades actuales

- Home con saludo, semana actual y acceso rápido al entrenamiento del día.
- Agenda semanal con sesiones de fuerza, descanso activo y descanso total.
- Check-in diario previo al entrenamiento.
- Modo entrenamiento guiado con registro de series, RPE, zona sentida y peso.
- Conversión automática de pesos entre kg y lb.
- Cronómetro de descanso con soporte para notificaciones locales.
- Historial por sesión y estadísticas de progreso.
- Calendario con sesiones completadas.
- Persistencia completa del progreso en `localStorage`.
- Instalación PWA con iconos, splash screens y modo standalone.

## Sistema visual de ejercicios

La rutina vive en `src/data/workouts.ts`. Cada ejercicio puede declarar:

- `mediaKey`
- `externalExerciseId`
- `muscleGroup`
- `equipment`
- `difficulty`
- `kneeFriendly`

La resolución del recurso visual se centraliza en `src/services/exerciseMedia.ts` y sigue este orden:

1. Archivo local `demo.mp4`
2. Archivo local `demo.gif`
3. Compatibilidad heredada con `animation.mp4` o `animation.gif`
4. Recurso remoto desde ExerciseDB (`https://oss.exercisedb.dev/api/v1`)
5. `preview.png`, `preview.jpg` o `preview.webp`
6. Fallback limpio con el texto `Animación disponible próximamente`

Estructura local esperada:

```text
src/assets/exercises/
  lat-pulldown/
    demo.gif
    preview.png
  hip-thrust/
    demo.mp4
    preview.png
```

Detalles importantes del resolver:

- No usa el ícono de la app como contenido del ejercicio.
- Si ExerciseDB no responde, la app no se rompe.
- La caché de medios remotos vive sólo en memoria durante la sesión actual.
- El fallback evita textos técnicos y mantiene una salida visual limpia.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior recomendado

## Correr localmente

```bash
npm install
npm run dev
```

La app quedará disponible en la URL local que indique Vite, normalmente `http://localhost:5173`.

## Build de producción

```bash
npm run build
```

Esto ejecuta:

- typecheck de la app
- typecheck de `vite.config.ts`
- build de Vite a `dist/`

## Pruebas

```bash
npm run test
```

## Despliegue en Vercel

El proyecto ya está preparado para Vercel con `vercel.json`.

Configuración esperada:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Flujo recomendado:

1. Sube el repositorio a GitHub.
2. Importa el repositorio en Vercel.
3. Verifica que Vercel detecte los comandos anteriores.
4. Ejecuta el primer deploy.
5. A partir de ese momento, cada push a `main` genera un nuevo deployment automáticamente.

Actualmente la app está pensada para desplegarse como SPA estática y no requiere variables de entorno para funcionar.

## Archivos clave de PWA y branding público

- `index.html`: `title`, meta tags, `application-name`, `theme-color`
- `public/manifest.json`: nombre público, colores, iconos y shortcuts
- `public/sw.js`: caché del app shell
- `public/icons/`: iconos para Android/PWA
- `public/apple-touch-icon*.png`: iconos de instalación en iPhone/iPad
- `public/startup/`: splash screens para iOS

## Persistencia local

- Clave principal: `recompon-progress-v1`
- El progreso se guarda completamente en `localStorage`
- No hay backend ni sincronización remota en el estado actual

## Desarrollo y mantenimiento

- Si cambias `manifest.json`, iconos, `index.html` o `sw.js`, vuelve a correr `npm run build`.
- Si agregas nuevos ejercicios, reutiliza `mediaKey` y la carpeta correspondiente dentro de `src/assets/exercises/`.
- Si un ejercicio no tiene media local, la app intentará resolverlo con ExerciseDB antes de mostrar el fallback limpio.

## Producción

- URL pública: [recompon.vercel.app](https://recompon.vercel.app/)
