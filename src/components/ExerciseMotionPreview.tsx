import Lottie from "lottie-react";
import type { Exercise } from "../types";
import { resolveExerciseMedia } from "../utils/exerciseMedia";

type ExerciseMotionPreviewProps = {
  exercise: Exercise;
};

const motionCopy: Record<Exercise["motion"], string> = {
  thrust: "Empuja la cadera y termina con el gluteo activo.",
  hinge: "Bisagra de cadera con columna larga y peso cerca del cuerpo.",
  press: "Empuja con control, sin bloquear con violencia.",
  pull: "Tira hacia ti con hombros estables y cuello relajado.",
  abduction: "Abre desde la cadera, no desde la espalda.",
  extension: "Extiende sin golpear la articulacion.",
  curl: "Controla subida y bajada con el musculo objetivo.",
  calf: "Pausa arriba y baja lento.",
  plank: "Sosten tension sin hundir la zona lumbar.",
  walk: "Ritmo comodo, respiracion sostenida.",
  rest: "Recupera, hidrata y respira."
};

export const ExerciseMotionPreview = ({ exercise }: ExerciseMotionPreviewProps) => {
  const media = resolveExerciseMedia(exercise.mediaKey, exercise.name);

  const overlay = (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-graphite-950 via-graphite-950/84 to-transparent px-5 pb-5 pt-12">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Guia visual</p>
          <p className="mt-2 text-sm leading-6 text-fog-300">{motionCopy[exercise.motion]}</p>
        </div>
        {media.kind === "placeholder" && <span className="badge-soft">Proximamente</span>}
      </div>
      {media.kind === "placeholder" && (
        <p className="mt-3 text-[0.95rem] font-semibold text-fog-100">
          Animacion disponible proximamente
        </p>
      )}
    </div>
  );

  const previewBackdrop = media.previewSrc ? (
    <img
      src={media.previewSrc}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover opacity-[0.14]"
    />
  ) : null;

  if (media.kind === "gif" && media.src) {
    return (
      <section className="motion-stage relative h-[228px] overflow-hidden rounded-[28px]">
        {previewBackdrop}
        <img
          src={media.src}
          alt={media.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {overlay}
      </section>
    );
  }

  if (media.kind === "mp4" && media.src) {
    return (
      <section className="motion-stage relative h-[228px] overflow-hidden rounded-[28px]">
        {previewBackdrop}
        <video
          src={media.src}
          autoPlay
          loop
          muted
          playsInline
          poster={media.previewSrc ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {overlay}
      </section>
    );
  }

  if (media.kind === "svg" && media.src) {
    return (
      <section className="motion-stage relative h-[228px] overflow-hidden rounded-[28px]">
        {previewBackdrop}
        <img
          src={media.src}
          alt={media.alt}
          className="absolute inset-0 h-full w-full object-contain p-6"
        />
        {overlay}
      </section>
    );
  }

  if (media.kind === "lottie" && media.animationData) {
    return (
      <section className="motion-stage relative h-[228px] overflow-hidden rounded-[28px]">
        {previewBackdrop}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(38,221,255,0.18),transparent_26%),radial-gradient(circle_at_82%_78%,rgba(10,87,248,0.16),transparent_28%)]" />
        <div className="relative z-[1] h-full p-4">
          <Lottie
            animationData={media.animationData}
            loop
            autoplay
            aria-label={media.alt}
            className="h-full w-full"
          />
        </div>
        {overlay}
      </section>
    );
  }

  return (
    <section className="motion-stage relative h-[228px] overflow-hidden rounded-[28px] p-5">
      {previewBackdrop}
      <div className="motion-grid absolute inset-0" />
      <div className={`motion-orbit motion-${exercise.motion}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-graphite-950/40" />
      <div className="relative z-[1] flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Guia visual</p>
            <h3 className="mt-2 text-[1.15rem] font-semibold text-fog-100">
              Animacion disponible proximamente
            </h3>
          </div>
          <span className="badge-soft">Proximamente</span>
        </div>

        <p className="max-w-[18rem] text-sm leading-6 text-fog-300">{motionCopy[exercise.motion]}</p>
      </div>
    </section>
  );
};
