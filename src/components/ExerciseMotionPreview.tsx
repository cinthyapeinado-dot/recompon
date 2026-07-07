import type { Exercise } from "../types";

type ExerciseMotionPreviewProps = {
  exercise: Exercise;
};

const motionCopy: Record<Exercise["motion"], string> = {
  thrust: "Empuja la cadera y termina con glúteo activo.",
  hinge: "Bisagra de cadera con columna larga.",
  press: "Empuja con control, sin bloquear con violencia.",
  pull: "Tira hacia ti manteniendo hombros estables.",
  abduction: "Abre desde la cadera, no desde la espalda.",
  extension: "Extiende sin golpear la articulación.",
  curl: "Controla subida y bajada con el músculo objetivo.",
  calf: "Pausa arriba y baja lento.",
  plank: "Sostén tensión sin hundir la zona lumbar.",
  walk: "Ritmo cómodo, respiración sostenida.",
  rest: "Recupera, hidrata y respira."
};

export const ExerciseMotionPreview = ({ exercise }: ExerciseMotionPreviewProps) => {
  if (exercise.media.type === "gif" && exercise.media.src) {
    return (
      <img
        src={exercise.media.src}
        alt={exercise.media.alt}
        className="motion-stage h-[210px] w-full rounded-[28px] object-cover"
      />
    );
  }

  if (exercise.media.type === "mp4" && exercise.media.src) {
    return (
      <video
        src={exercise.media.src}
        poster={exercise.media.poster}
        autoPlay
        loop
        muted
        playsInline
        className="motion-stage h-[210px] w-full rounded-[28px] object-cover"
      />
    );
  }

  return (
    <section className="motion-stage relative h-[210px] overflow-hidden rounded-[28px] p-5">
      <div className="motion-grid absolute inset-0" />
      <div className={`motion-orbit motion-${exercise.motion}`} />
      <div className="relative z-[1] flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Guía visual</p>
            <h3 className="mt-2 text-[1.15rem] font-semibold text-fog-100">
              {exercise.media.type === "lottie"
                ? "Espacio listo para Lottie"
                : "Arquitectura lista para animación"}
            </h3>
          </div>
          <span className="badge-soft">Sin copyright</span>
        </div>

        <p className="max-w-[16rem] text-sm leading-6 text-fog-300">
          {motionCopy[exercise.motion]}
        </p>
      </div>
    </section>
  );
};
