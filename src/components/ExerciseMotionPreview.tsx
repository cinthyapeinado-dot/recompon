import { useEffect, useState } from "react";
import { resolveExerciseMedia } from "../services/exerciseMedia";
import type { Exercise, ExerciseMediaResource } from "../types";

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
  walk: "Ritmo cómodo, respiración sostenida.",
  rest: "Recupera, hidrata y respira."
};

export const ExerciseMotionPreview = ({ exercise }: ExerciseMotionPreviewProps) => {
  const [media, setMedia] = useState<ExerciseMediaResource | null>(null);

  useEffect(() => {
    let isMounted = true;

    setMedia(null);

    resolveExerciseMedia(exercise).then((resolvedMedia) => {
      if (isMounted) {
        setMedia(resolvedMedia);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [exercise.equipment, exercise.externalExerciseId, exercise.mediaKey, exercise.name]);

  if (!media) {
    return (
      <section className="motion-stage relative h-[228px] overflow-hidden rounded-[28px]">
        <div className="motion-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(38,221,255,0.16),transparent_24%),radial-gradient(circle_at_82%_78%,rgba(10,87,248,0.12),transparent_28%)]" />
        <div className="absolute inset-y-0 left-[-32%] w-[32%] bg-gradient-to-r from-transparent via-white/12 to-transparent animate-[sheen_1.6s_ease-in-out_infinite]" />
        <div className="relative z-[1] flex h-full flex-col justify-end gap-3 p-5">
          <p className="eyebrow">Demostración</p>
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-full bg-white/8" />
            <div className="h-4 w-44 rounded-full bg-white/8" />
          </div>
        </div>
      </section>
    );
  }

  const overlay = (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-graphite-950 via-graphite-950/84 to-transparent px-5 pb-5 pt-12">
      <p className="eyebrow">Guía visual</p>
      <p className="mt-2 text-sm leading-6 text-fog-300">{motionCopy[exercise.motion]}</p>
    </div>
  );

  const previewBackdrop = media.previewSrc && media.kind !== "image" ? (
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
          poster={media.posterSrc ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {overlay}
      </section>
    );
  }

  if (media.kind === "image" && media.src) {
    return (
      <section className="motion-stage relative h-[228px] overflow-hidden rounded-[28px]">
        <img
          src={media.src}
          alt={media.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {overlay}
      </section>
    );
  }

  return (
    <section className="motion-stage relative h-[228px] overflow-hidden rounded-[28px]">
      <div className="motion-grid absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(38,221,255,0.14),transparent_24%),radial-gradient(circle_at_82%_78%,rgba(10,87,248,0.12),transparent_28%)]" />
      <div className="relative z-[1] flex h-full items-center justify-center px-8 text-center">
        <p className="text-[1rem] font-semibold text-fog-100">Animación disponible próximamente</p>
      </div>
    </section>
  );
};
