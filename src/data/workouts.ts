import type { DayId, ProgressionPhase, WorkoutDay } from "../types";

export const TOTAL_PROGRAM_WEEKS = 12;

export const legacyExerciseIdMap: Record<string, string> = {
  "abduccion-b": "abduccion",
  "abduccion-c": "abduccion",
  "curl-femoral-b": "curl-femoral",
  "hip-thrust-b": "hip-thrust",
  "hip-thrust-c": "hip-thrust",
  "pantorrillas-b": "pantorrillas",
  "pantorrillas-c": "pantorrillas",
  "peso-muerto-rumano-b": "peso-muerto-rumano",
  "triceps-b": "triceps"
};

export const normalizeExerciseId = (exerciseId: string) =>
  legacyExerciseIdMap[exerciseId] ?? exerciseId;

export const workouts: WorkoutDay[] = [
  {
    id: "monday",
    label: "Lunes",
    shortLabel: "Lun",
    title: "Pierna A",
    focus: "Glúteo, femoral y base de fuerza con bajo impacto.",
    kind: "strength",
    warmup: "Elíptica 15 min",
    tip: "Concéntrate en sentir el glúteo y en cuidar el recorrido de rodilla.",
    microcopy: "Hoy buscamos un trabajo sólido, controlado y amable con tus articulaciones.",
    estimatedDurationMinutes: 62,
    expectedEnergy: "media",
    exercises: [
      {
        id: "hip-thrust",
        name: "Hip Thrust",
        sets: "4",
        reps: "10",
        rest: "90 s",
        priority: "alta",
        muscleGroup: "Glúteo",
        motion: "thrust",
        jointLoad: "low",
        defaultUnit: "kg",
        starterWeight: { value: 20, unit: "kg" },
        media: {
          type: "placeholder",
          alt: "Animación futura de empuje de cadera"
        }
      },
      {
        id: "peso-muerto-rumano",
        name: "Peso muerto rumano",
        sets: "4",
        reps: "10",
        rest: "90 s",
        priority: "alta",
        muscleGroup: "Femoral",
        motion: "hinge",
        jointLoad: "medium",
        defaultUnit: "kg",
        starterWeight: { value: 12.5, unit: "kg" },
        media: {
          type: "placeholder",
          alt: "Animación futura de bisagra de cadera"
        }
      },
      {
        id: "prensa",
        name: "Prensa",
        sets: "4",
        reps: "12",
        rest: "90 s",
        priority: "base",
        muscleGroup: "Cuádriceps",
        motion: "press",
        jointLoad: "high",
        defaultUnit: "kg",
        starterWeight: { value: 40, unit: "kg" },
        media: {
          type: "placeholder",
          alt: "Animación futura de prensa de pierna"
        }
      },
      {
        id: "extension",
        name: "Extensión",
        sets: "3",
        reps: "15",
        rest: "60 s",
        priority: "base",
        muscleGroup: "Cuádriceps",
        motion: "extension",
        jointLoad: "high",
        defaultUnit: "lb",
        starterWeight: { value: 20, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de extensión de pierna"
        }
      },
      {
        id: "abduccion",
        name: "Abducción",
        sets: "4",
        reps: "20",
        rest: "45 s",
        priority: "alta",
        muscleGroup: "Glúteo medio",
        motion: "abduction",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 35, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de abducción de cadera"
        }
      },
      {
        id: "pantorrillas",
        name: "Pantorrillas",
        sets: "4",
        reps: "20",
        rest: "45 s",
        priority: "base",
        muscleGroup: "Pantorrilla",
        motion: "calf",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 30, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de elevación de pantorrilla"
        }
      }
    ]
  },
  {
    id: "tuesday",
    label: "Martes",
    shortLabel: "Mar",
    title: "Superior A",
    focus: "Espalda, pecho y hombro con técnica limpia.",
    kind: "strength",
    warmup: "Elíptica 15 min",
    tip: "Controla el movimiento y evita impulsarte para proteger hombro y zona lumbar.",
    microcopy: "Tu objetivo hoy es control: espalda activa, hombros lejos de las orejas.",
    estimatedDurationMinutes: 58,
    expectedEnergy: "media",
    exercises: [
      {
        id: "jalon",
        name: "Jalón",
        sets: "4",
        reps: "10",
        rest: "75 s",
        priority: "alta",
        muscleGroup: "Espalda",
        motion: "pull",
        jointLoad: "medium",
        defaultUnit: "lb",
        starterWeight: { value: 40, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de jalón al pecho"
        }
      },
      {
        id: "remo",
        name: "Remo",
        sets: "4",
        reps: "10",
        rest: "75 s",
        priority: "alta",
        muscleGroup: "Espalda",
        motion: "pull",
        jointLoad: "medium",
        defaultUnit: "lb",
        starterWeight: { value: 35, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de remo sentado"
        }
      },
      {
        id: "press-pecho",
        name: "Press pecho",
        sets: "3",
        reps: "12",
        rest: "75 s",
        priority: "base",
        muscleGroup: "Pecho",
        motion: "press",
        jointLoad: "medium",
        defaultUnit: "lb",
        starterWeight: { value: 25, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de press de pecho"
        }
      },
      {
        id: "press-hombro",
        name: "Press hombro",
        sets: "3",
        reps: "12",
        rest: "75 s",
        priority: "base",
        muscleGroup: "Hombro",
        motion: "press",
        jointLoad: "medium",
        defaultUnit: "lb",
        starterWeight: { value: 15, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de press de hombro"
        }
      },
      {
        id: "elevaciones-laterales",
        name: "Elevaciones laterales",
        sets: "3",
        reps: "15",
        rest: "45 s",
        priority: "base",
        muscleGroup: "Hombro",
        motion: "pull",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 5, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de elevaciones laterales"
        }
      },
      {
        id: "biceps",
        name: "Bíceps",
        sets: "3",
        reps: "12",
        rest: "60 s",
        priority: "base",
        muscleGroup: "Bíceps",
        motion: "curl",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 10, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de curl de bíceps"
        }
      },
      {
        id: "triceps",
        name: "Tríceps",
        sets: "3",
        reps: "12",
        rest: "60 s",
        priority: "base",
        muscleGroup: "Tríceps",
        motion: "extension",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 15, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de extensión de tríceps"
        }
      }
    ]
  },
  {
    id: "wednesday",
    label: "Miércoles",
    shortLabel: "Mié",
    title: "Pierna B",
    focus: "Femoral y glúteo con ejecución controlada.",
    kind: "strength",
    warmup: "Elíptica 15 min",
    tip: "Si sientes más espalda baja que femoral, reduce carga y acorta el rango.",
    microcopy: "Aquí gana la técnica paciente: cadera estable, espalda tranquila.",
    estimatedDurationMinutes: 55,
    expectedEnergy: "media",
    exercises: [
      {
        id: "hip-thrust",
        name: "Hip Thrust",
        sets: "4",
        reps: "8",
        rest: "90 s",
        priority: "alta",
        muscleGroup: "Glúteo",
        motion: "thrust",
        jointLoad: "low",
        defaultUnit: "kg",
        starterWeight: { value: 22.5, unit: "kg" },
        media: {
          type: "placeholder",
          alt: "Animación futura de empuje de cadera"
        }
      },
      {
        id: "curl-femoral",
        name: "Curl femoral",
        sets: "4",
        reps: "12",
        rest: "60 s",
        priority: "alta",
        muscleGroup: "Femoral",
        motion: "curl",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 25, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de curl femoral"
        }
      },
      {
        id: "peso-muerto-rumano",
        name: "Peso muerto rumano",
        sets: "3",
        reps: "10",
        rest: "90 s",
        priority: "alta",
        muscleGroup: "Femoral",
        motion: "hinge",
        jointLoad: "medium",
        defaultUnit: "kg",
        starterWeight: { value: 12.5, unit: "kg" },
        media: {
          type: "placeholder",
          alt: "Animación futura de bisagra de cadera"
        }
      },
      {
        id: "patada-gluteo",
        name: "Patada de glúteo",
        sets: "3",
        reps: "15",
        rest: "45 s",
        priority: "base",
        muscleGroup: "Glúteo",
        motion: "thrust",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 15, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de patada de glúteo"
        }
      },
      {
        id: "abduccion",
        name: "Abducción",
        sets: "4",
        reps: "20",
        rest: "45 s",
        priority: "alta",
        muscleGroup: "Glúteo medio",
        motion: "abduction",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 35, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de abducción de cadera"
        }
      },
      {
        id: "pantorrillas",
        name: "Pantorrillas",
        sets: "4",
        reps: "20",
        rest: "45 s",
        priority: "base",
        muscleGroup: "Pantorrilla",
        motion: "calf",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 30, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de elevación de pantorrilla"
        }
      }
    ]
  },
  {
    id: "thursday",
    label: "Jueves",
    shortLabel: "Jue",
    title: "Superior B",
    focus: "Espalda, hombro y core con postura estable.",
    kind: "strength",
    warmup: "Elíptica 15 min",
    tip: "Prioriza postura, respiración y un core firme antes de empujar carga.",
    microcopy: "Más control que impulso: espalda larga, abdomen firme, hombro contento.",
    estimatedDurationMinutes: 52,
    expectedEnergy: "media",
    exercises: [
      {
        id: "remo-mancuerna",
        name: "Remo mancuerna",
        sets: "4",
        reps: "10",
        rest: "75 s",
        priority: "alta",
        muscleGroup: "Espalda",
        motion: "pull",
        jointLoad: "medium",
        defaultUnit: "lb",
        starterWeight: { value: 15, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de remo con mancuerna"
        }
      },
      {
        id: "jalon-cerrado",
        name: "Jalón cerrado",
        sets: "3",
        reps: "12",
        rest: "75 s",
        priority: "alta",
        muscleGroup: "Espalda",
        motion: "pull",
        jointLoad: "medium",
        defaultUnit: "lb",
        starterWeight: { value: 35, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de jalón cerrado"
        }
      },
      {
        id: "press-militar",
        name: "Press militar",
        sets: "3",
        reps: "12",
        rest: "75 s",
        priority: "base",
        muscleGroup: "Hombro",
        motion: "press",
        jointLoad: "medium",
        defaultUnit: "lb",
        starterWeight: { value: 10, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de press militar"
        }
      },
      {
        id: "face-pull",
        name: "Face Pull",
        sets: "3",
        reps: "15",
        rest: "45 s",
        priority: "base",
        muscleGroup: "Espalda alta",
        motion: "pull",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 20, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de face pull"
        }
      },
      {
        id: "curl-martillo",
        name: "Curl martillo",
        sets: "3",
        reps: "12",
        rest: "60 s",
        priority: "base",
        muscleGroup: "Bíceps",
        motion: "curl",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 10, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de curl martillo"
        }
      },
      {
        id: "triceps",
        name: "Tríceps",
        sets: "3",
        reps: "12",
        rest: "60 s",
        priority: "base",
        muscleGroup: "Tríceps",
        motion: "extension",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 15, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de extensión de tríceps"
        }
      },
      {
        id: "plancha",
        name: "Plancha",
        sets: "3",
        reps: "40 s",
        rest: "45 s",
        priority: "base",
        muscleGroup: "Core",
        motion: "plank",
        jointLoad: "low",
        defaultUnit: "kg",
        starterWeight: { value: 0, unit: "kg" },
        media: {
          type: "placeholder",
          alt: "Animación futura de plancha"
        }
      }
    ]
  },
  {
    id: "friday",
    label: "Viernes",
    shortLabel: "Vie",
    title: "Pierna C",
    focus: "Glúteo y cierre fuerte de semana sin castigar articulaciones.",
    kind: "strength",
    warmup: "Elíptica 15 min",
    tip: "Cierra fuerte, pero sin dolor articular ni acelerarte en las últimas repeticiones.",
    microcopy: "Último empuje de la semana: tensión útil, cero prisa, articulaciones felices.",
    estimatedDurationMinutes: 50,
    expectedEnergy: "alta",
    exercises: [
      {
        id: "hip-thrust",
        name: "Hip Thrust",
        sets: "5",
        reps: "8",
        rest: "90 s",
        priority: "alta",
        muscleGroup: "Glúteo",
        motion: "thrust",
        jointLoad: "low",
        defaultUnit: "kg",
        starterWeight: { value: 22.5, unit: "kg" },
        media: {
          type: "placeholder",
          alt: "Animación futura de empuje de cadera"
        }
      },
      {
        id: "pull-through",
        name: "Pull Through",
        sets: "4",
        reps: "12",
        rest: "60 s",
        priority: "alta",
        muscleGroup: "Glúteo",
        motion: "hinge",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 25, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de pull through"
        }
      },
      {
        id: "curl-femoral",
        name: "Curl femoral",
        sets: "4",
        reps: "12",
        rest: "60 s",
        priority: "base",
        muscleGroup: "Femoral",
        motion: "curl",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 25, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de curl femoral"
        }
      },
      {
        id: "abduccion",
        name: "Abducción",
        sets: "4",
        reps: "20",
        rest: "45 s",
        priority: "alta",
        muscleGroup: "Glúteo medio",
        motion: "abduction",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 35, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de abducción de cadera"
        }
      },
      {
        id: "pantorrillas",
        name: "Pantorrillas",
        sets: "4",
        reps: "20",
        rest: "45 s",
        priority: "base",
        muscleGroup: "Pantorrilla",
        motion: "calf",
        jointLoad: "low",
        defaultUnit: "lb",
        starterWeight: { value: 30, unit: "lb" },
        media: {
          type: "placeholder",
          alt: "Animación futura de elevación de pantorrilla"
        }
      }
    ]
  },
  {
    id: "saturday",
    label: "Sábado",
    shortLabel: "Sáb",
    title: "Caminata o descanso activo",
    focus: "Recuperación con movimiento suave.",
    kind: "active",
    details: "Caminata de 45 a 60 min o una sesión corta de movilidad y respiración.",
    tip: "Recuperar también es entrenar cuando ayuda a sentirte mejor mañana.",
    microcopy: "Hoy tocó recargar: pasos, respiración y cero impacto innecesario.",
    estimatedDurationMinutes: 45,
    expectedEnergy: "suave",
    exercises: []
  },
  {
    id: "sunday",
    label: "Domingo",
    shortLabel: "Dom",
    title: "Descanso",
    focus: "Recuperación total.",
    kind: "rest",
    details: "Prioriza sueño, hidratación, comida suficiente y una caminata ligera si se antoja.",
    tip: "Descansar bien también protege tus rodillas y te deja entrenar mejor.",
    microcopy: "Pausa con intención: hoy el progreso se construye recuperando.",
    estimatedDurationMinutes: 0,
    expectedEnergy: "suave",
    exercises: []
  }
];

export const progressionPhases: ProgressionPhase[] = [
  {
    title: "Técnica",
    weeks: "Semanas 1-2",
    startWeek: 1,
    endWeek: 2,
    description: "Pulir ejecución, rangos de movimiento y ritmo de las repeticiones.",
    emphasis: "Busca consistencia y deja 2-3 repeticiones en reserva."
  },
  {
    title: "Encontrar pesos",
    weeks: "Semanas 3-4",
    startWeek: 3,
    endWeek: 4,
    description: "Identificar cargas retadoras que sigan viéndose limpias.",
    emphasis: "Anota pesos útiles; todavía no persigas el fallo."
  },
  {
    title: "Subir cargas",
    weeks: "Semanas 5-8",
    startWeek: 5,
    endWeek: 8,
    description: "Incrementar entre 5% y 10% cuando la técnica se mantenga.",
    emphasis: "Aumenta poco a poco y protege la calidad del movimiento."
  },
  {
    title: "Intensidad",
    weeks: "Semanas 9-12",
    startWeek: 9,
    endWeek: 12,
    description: "Empujar con intención sin sacrificar control ni recuperación.",
    emphasis: "Aprieta en los básicos clave y cuida el descanso."
  }
];

export const workoutsById = Object.fromEntries(
  workouts.map((workout) => [workout.id, workout])
) as Record<DayId, WorkoutDay>;

export const exerciseLabelsById = Object.fromEntries(
  workouts.flatMap((workout) =>
    workout.exercises.map((exercise) => [normalizeExerciseId(exercise.id), exercise.name])
  )
) as Record<string, string>;

export const exercisesById = Object.fromEntries(
  workouts.flatMap((workout) =>
    workout.exercises.map((exercise) => [normalizeExerciseId(exercise.id), exercise])
  )
);

export const getProgressionPhase = (week: number) =>
  progressionPhases.find((phase) => week >= phase.startWeek && week <= phase.endWeek) ??
  progressionPhases[0];
