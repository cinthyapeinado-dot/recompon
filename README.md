# Recompón

PWA mobile-first para seguir un programa de entrenamiento en el gimnasio con una experiencia visual premium, estilo app iOS moderna.

## Stack

- React + Vite
- TypeScript
- Tailwind CSS
- LocalStorage para progreso
- Manifest + Service Worker para instalación como PWA
- Configuración lista para Vercel

## Funcionalidades

- Home con saludo, contador de semanas, progreso semanal y acceso directo a la sesión del día
- Agenda semanal con calendario y resumen del historial por fecha
- Pantalla de entrenamiento con checklist, pesos por ejercicio y cronómetro de descanso
- Historial de entrenamientos persistente en `localStorage`
- Estadísticas con sesiones, semanas activas, mejores pesos y fase actual del programa
- Ajustes para reiniciar progreso, cambiar semana manualmente y controlar notificaciones locales
- Botón flotante de `Hoy` para entrar rápido al entrenamiento del día

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Despliegue en Vercel

El proyecto ya incluye:

- `npm run build` listo
- `vite.config.ts` preparado para build SPA
- `vercel.json` con `installCommand`, `buildCommand`, `outputDirectory` y headers para PWA
- manifest, favicon e iconos configurados
- service worker servido desde `public/sw.js`

## Publicar en GitHub

1. Crea un repositorio nuevo en GitHub.
2. Abre una terminal en la raíz del proyecto.
3. Inicializa Git si todavía no existe:

```bash
git init
```

4. Agrega el remoto:

```bash
git remote add origin https://github.com/TU_USUARIO/recompon.git
```

5. Revisa que `.gitignore` esté presente.
6. Agrega archivos:

```bash
git add .
```

7. Crea el primer commit:

```bash
git commit -m "feat: prepara Recompón para despliegue en Vercel"
```

8. Sube la rama principal:

```bash
git branch -M main
git push -u origin main
```

## Desplegar en Vercel paso a paso

1. Entra a [https://vercel.com](https://vercel.com).
2. Inicia sesión con GitHub.
3. Haz clic en `Add New...` y luego en `Project`.
4. Importa el repositorio `recompon`.
5. Verifica que Vercel detecte el proyecto como frontend estático.
6. Confirma estos valores:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

7. Haz clic en `Deploy`.
8. Cuando termine, abre la URL pública generada por Vercel.
9. Entra desde el celular y valida:

- que la app cargue bien
- que el manifest responda
- que el service worker se registre
- que puedas instalar la PWA

## Estructura importante

- `src/data/workouts.ts`: datos de la rutina y fases del programa
- `src/utils/progress.ts`: migración y normalización del progreso persistido
- `src/App.tsx`: estado global de la app y flujos principales
- `public/manifest.json`: manifest PWA
- `public/sw.js`: service worker
- `vercel.json`: configuración de despliegue y headers

## Notas

- El progreso se guarda en `localStorage` bajo la clave `recompon-progress-v1`.
- La app está optimizada para pantallas móviles y se ve especialmente bien en iPhone.
- Si cambias iconos, manifest o `sw.js`, vuelve a correr `npm run build` antes de desplegar.
