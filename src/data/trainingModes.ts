import type { TrainingMode } from "../types";

export type TrainingModeDiagramStep = {
  label: string;
  tone?: "rest" | "round";
};

export type TrainingModeDefinition = {
  compactDescription: string;
  description: string;
  diagram: TrainingModeDiagramStep[];
  icon: "traditional" | "alternated" | "circuit";
  id: TrainingMode;
  isRecommended?: boolean;
  title: string;
};

export const trainingModeDefinitions: TrainingModeDefinition[] = [
  {
    id: "traditional",
    title: "Tradicional",
    compactDescription: "Termina un ejercicio y sigue con el siguiente.",
    description: "Completa todas las series antes de cambiar de ejercicio.",
    icon: "traditional",
    isRecommended: true,
    diagram: [
      { label: "Hip Thrust 1" },
      { label: "Hip Thrust 2" },
      { label: "Hip Thrust 3" },
      { label: "Prensa 1" }
    ]
  },
  {
    id: "alternated",
    title: "Alternado",
    compactDescription: "Una serie por ejercicio. Descanso al cerrar la ronda.",
    description: "Haz una serie de cada ejercicio y descansa al final de la ronda.",
    icon: "alternated",
    diagram: [
      { label: "Ronda 1", tone: "round" },
      { label: "Hip 1" },
      { label: "Prensa 1" },
      { label: "Descanso", tone: "rest" }
    ]
  },
  {
    id: "circuit",
    title: "Circuito",
    compactDescription: "Un ejercicio, descanso y cambio inmediato.",
    description: "Alterna ejercicios con descanso entre cada bloque.",
    icon: "circuit",
    diagram: [
      { label: "Hip 1" },
      { label: "Descanso", tone: "rest" },
      { label: "Prensa 1" },
      { label: "Descanso", tone: "rest" }
    ]
  }
];

export const trainingModeById = Object.fromEntries(
  trainingModeDefinitions.map((mode) => [mode.id, mode])
) as Record<TrainingMode, TrainingModeDefinition>;
