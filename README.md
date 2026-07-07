# GymApp

GymApp es una PWA mobile-first que funciona como coach de entrenamiento personal para gimnasio. No está pensada como un listado de rutinas, sino como una experiencia guiada, enfocada en acompañar a la usuaria ejercicio por ejercicio con contexto, recomendaciones y progreso persistente.

## Stack

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- LocalStorage para persistencia local
- `manifest.json` + `service worker` para instalación PWA
- Configuración lista para Vercel

## Qué hace hoy

- Home minimalista estilo app nativa con saludo, semana actual y CTA principal.
- Check-in diario rápido para registrar sueño, energía, molestias y tiempo disponible.
- Recomendaciones inteligentes que explican por qué conviene mantener o ajustar la sesión.
- Modo entrenamiento guiado con un ejercicio por pantalla.
- Registro por ejercicio de series, peso, RPE y zona donde se sintió el movimiento.
- Conversión automática entre kg y lb.
- Cronómetro de descanso con aviso local y vibración cuando termina.
- Historial por sesión con fecha, pesos, RPE y mini evolución.
- Calendario con sesiones completadas, racha, volumen semanal y sesiones del mes.
- Estadísticas con semanas activas, mejor semana, mejores pesos y fase del programa.
- Ajustes para cambiar la semana actual, probar notificaciones y reiniciar el progreso.

## Perfil de la usuaria incorporado

La lógica del producto recuerda permanentemente este contexto:

- mujer
- 5 días de entrenamiento por semana
- hace Pilates
- nivel principiante-intermedio
- todavía no levanta cargas altas
- antecedentes de bypass gástrico
- rodillas sensibles
- preferencia por movimientos de bajo impacto
- gimnasio con máquinas mezcladas entre kg y lb

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Estructura clave

```text
public/
  manifest.json
  sw.js
  favicon.ico
  apple-touch-icon.png
  icons/

src/
  components/
  data/
    athleteProfile.ts
    workouts.ts
  hooks/
  screens/
    HomeScreen.tsx
    CheckInScreen.tsx
    AgendaScreen.tsx
    WorkoutScreen.tsx
    ProgressionScreen.tsx
    SettingsScreen.tsx
  utils/
    progress.ts
    recommendations.ts
    session.ts
    training.ts
    units.ts
  App.tsx
  index.css
  main.tsx
```

## Arquitectura rápida

- `src/App.tsx` controla navegación interna, estado principal, notificaciones y persistencia.
- `src/data/workouts.ts` define rutina, fases del programa y metadatos de ejercicios.
- `src/data/athleteProfile.ts` concentra restricciones permanentes de la usuaria.
- `src/utils/progress.ts` normaliza el estado guardado y migra datos viejos sin perder historial.
- `src/utils/recommendations.ts` genera recomendaciones por ejercicio y ajustes de sesión.
- `src/utils/session.ts` arma el estado operativo de cada ejercicio para el modo guiado.
- `src/utils/training.ts` calcula historial, rachas, volumen, mejores pesos y métricas.

## PWA

El proyecto ya incluye:

- `public/manifest.json` configurado para instalación standalone
- `public/sw.js` para caché del app shell
- iconos `192x192` y `512x512`
- `theme-color` y metadatos móviles en `index.html`
- registro del service worker en `src/main.tsx`

## Despliegue en Vercel

La configuración ya está lista:

- `npm run build`
- `vite.config.ts`
- `vercel.json`
- `manifest.json`
- `service worker`
- favicon e iconos

Valores esperados en Vercel:

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

## Publicar en GitHub paso a paso

1. Crea un repositorio vacío en GitHub.
2. Abre la terminal en la raíz del proyecto.
3. Si hace falta, inicializa Git:

```bash
git init
```

4. Agrega el remoto:

```bash
git remote add origin https://github.com/TU-USUARIO/recompon.git
```

5. Agrega los archivos:

```bash
git add .
```

6. Crea un commit:

```bash
git commit -m "feat: premium training coach experience"
```

7. Sube la rama principal:

```bash
git branch -M main
git push -u origin main
```

## Desplegar en Vercel paso a paso

1. Entra a [Vercel](https://vercel.com).
2. Inicia sesión con tu cuenta de GitHub.
3. Haz clic en `Add New...`.
4. Selecciona `Project`.
5. Importa el repositorio `recompon`.
6. Revisa que Vercel use:
   - `npm install`
   - `npm run build`
   - `dist`
7. Haz clic en `Deploy`.
8. Espera a que termine el build.
9. Abre la URL pública generada.
10. Valida en celular:
   - instalación PWA
   - manifest
   - service worker
   - notificaciones locales con permiso otorgado
   - layout en iPhone

## Notas

- El progreso se guarda en `localStorage` con la clave `recompon-progress-v1`.
- Las notificaciones locales dependen del permiso del navegador y no se muestran si la plataforma no las soporta.
- Si cambias `manifest.json`, iconos o `sw.js`, vuelve a correr `npm run build` antes de publicar.
