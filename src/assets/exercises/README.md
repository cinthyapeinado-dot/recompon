Coloca los recursos locales de cada ejercicio en una carpeta con el mismo `mediaKey`.

Estructura recomendada:

```text
src/assets/exercises/
  lat-pulldown/
    demo.gif
    preview.png
  hip-thrust/
    demo.mp4
    preview.png
```

Orden de prioridad del resolver:

1. `demo.mp4`
2. `demo.gif`
3. `animation.mp4` o `animation.gif` para compatibilidad heredada
4. media remota desde ExerciseDB
5. `preview.png|jpg|webp`
6. fallback visual limpio

No uses el icono de la app como preview de ejercicio.
