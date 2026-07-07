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
    focus: "Glúteo, femoral y base de fuerza",
    kind: "strength",
    warmup: "Elíptica 15 min",
    tip: "Concéntrate en sentir el glúteo, no en cargar por cargar.",
    microcopy: "Hoy cuenta más la tensión bien puesta que la prisa.",
    exercises: [
      { id: "hip-thrust", name: "Hip Thrust", sets: "4", reps: "10", rest: "90 s", priority: "alta" },
      {
        id: "peso-muerto-rumano",
        name: "Peso muerto rumano",
        sets: "4",
        reps: "10",
        rest: "90 s",
        priority: "alta"
      },
      { id: "prensa", name: "Prensa", sets: "4", reps: "12", rest: "90 s", priority: "base" },
      { id: "extension", name: "Extensión", sets: "3", reps: "15", rest: "60 s", priority: "base" },
      { id: "abduccion", name: "Abducción", sets: "4", reps: "20", rest: "45 s", priority: "alta" },
      { id: "pantorrillas", name: "Pantorrillas", sets: "4", reps: "20", rest: "45 s", priority: "base" }
    ]
  },
  {
    id: "tuesday",
    label: "Martes",
    shortLabel: "Mar",
    title: "Superior A",
    focus: "Espalda, pecho y hombro",
    kind: "strength",
    warmup: "Elíptica 15 min",
    tip: "Controla el movimiento y evita impulsarte.",
    microcopy: "Hazlo limpio: una repetición sólida vale más que dos apuradas.",
    exercises: [
      { id: "jalon", name: "Jalón", sets: "4", reps: "10", rest: "75 s", priority: "alta" },
      { id: "remo", name: "Remo", sets: "4", reps: "10", rest: "75 s", priority: "alta" },
      { id: "press-pecho", name: "Press pecho", sets: "3", reps: "12", rest: "75 s", priority: "base" },
      { id: "press-hombro", name: "Press hombro", sets: "3", reps: "12", rest: "75 s", priority: "base" },
      {
        id: "elevaciones-laterales",
        name: "Elevaciones laterales",
        sets: "3",
        reps: "15",
        rest: "45 s",
        priority: "base"
      },
      { id: "biceps", name: "Bíceps", sets: "3", reps: "12", rest: "60 s", priority: "base" },
      { id: "triceps", name: "Tríceps", sets: "3", reps: "12", rest: "60 s", priority: "base" }
    ]
  },
  {
    id: "wednesday",
    label: "Miércoles",
    shortLabel: "Mié",
    title: "Pierna B",
    focus: "Femoral y glúteo con control",
    kind: "strength",
    warmup: "Elíptica 15 min",
    tip: "Si sientes la espalda baja más que el femoral, reduce el peso.",
    microcopy: "Ajustar carga también es progreso cuando mejora la ejecución.",
    exercises: [
      { id: "hip-thrust", name: "Hip Thrust", sets: "4", reps: "8", rest: "90 s", priority: "alta" },
      { id: "curl-femoral", name: "Curl femoral", sets: "4", reps: "12", rest: "60 s", priority: "alta" },
      {
        id: "peso-muerto-rumano",
        name: "Peso muerto rumano",
        sets: "3",
        reps: "10",
        rest: "90 s",
        priority: "alta"
      },
      {
        id: "patada-gluteo",
        name: "Patada de glúteo",
        sets: "3",
        reps: "15",
        rest: "45 s",
        priority: "base"
      },
      { id: "abduccion", name: "Abducción", sets: "4", reps: "20", rest: "45 s", priority: "alta" },
      { id: "pantorrillas", name: "Pantorrillas", sets: "4", reps: "20", rest: "45 s", priority: "base" }
    ]
  },
  {
    id: "thursday",
    label: "Jueves",
    shortLabel: "Jue",
    title: "Superior B",
    focus: "Espalda, hombro y core",
    kind: "strength",
    warmup: "Elíptica 15 min",
    tip: "Prioriza postura y control del core.",
    microcopy: "Postura primero; el peso acompaña, no manda.",
    exercises: [
      {
        id: "remo-mancuerna",
        name: "Remo mancuerna",
        sets: "4",
        reps: "10",
        rest: "75 s",
        priority: "alta"
      },
      {
        id: "jalon-cerrado",
        name: "Jalón cerrado",
        sets: "3",
        reps: "12",
        rest: "75 s",
        priority: "alta"
      },
      { id: "press-militar", name: "Press militar", sets: "3", reps: "12", rest: "75 s", priority: "base" },
      { id: "face-pull", name: "Face Pull", sets: "3", reps: "15", rest: "45 s", priority: "base" },
      { id: "curl-martillo", name: "Curl martillo", sets: "3", reps: "12", rest: "60 s", priority: "base" },
      { id: "triceps", name: "Tríceps", sets: "3", reps: "12", rest: "60 s", priority: "base" },
      { id: "plancha", name: "Plancha", sets: "3", reps: "40 s", rest: "45 s", priority: "base" }
    ]
  },
  {
    id: "friday",
    label: "Viernes",
    shortLabel: "Vie",
    title: "Pierna C",
    focus: "Glúteo y cierre fuerte de semana",
    kind: "strength",
    warmup: "Elíptica 15 min",
    tip: "Termina fuerte, pero sin dolor articular.",
    microcopy: "Cierra la semana con intención, no con desgaste de más.",
    exercises: [
      { id: "hip-thrust", name: "Hip Thrust", sets: "5", reps: "8", rest: "90 s", priority: "alta" },
      { id: "pull-through", name: "Pull Through", sets: "4", reps: "12", rest: "60 s", priority: "alta" },
      { id: "curl-femoral", name: "Curl femoral", sets: "4", reps: "12", rest: "60 s", priority: "base" },
      { id: "abduccion", name: "Abducción", sets: "4", reps: "20", rest: "45 s", priority: "alta" },
      { id: "pantorrillas", name: "Pantorrillas", sets: "4", reps: "20", rest: "45 s", priority: "base" }
    ]
  },
  {
    id: "saturday",
    label: "Sábado",
    shortLabel: "Sáb",
    title: "Caminata o descanso activo",
    focus: "Recuperación con movimiento",
    kind: "active",
    details: "Caminata de 45 a 60 min o una sesión ligera de movilidad.",
    tip: "Muévete para recuperar, no para agotarte.",
    microcopy: "Suma pasos, respira y deja que el cuerpo absorba el trabajo.",
    exercises: []
  },
  {
    id: "sunday",
    label: "Domingo",
    shortLabel: "Dom",
    title: "Descanso",
    focus: "Recuperación total",
    kind: "rest",
    details: "Día libre. Prioriza sueño, hidratación y comida suficiente.",
    tip: "Descansar también sostiene el progreso.",
    microcopy: "No es pausa del plan; es parte del plan.",
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
    emphasis: "Anota pesos útiles; todavía no persigas fallar."
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

export const getProgressionPhase = (week: number) =>
  progressionPhases.find((phase) => week >= phase.startWeek && week <= phase.endWeek) ??
  progressionPhases[0];
