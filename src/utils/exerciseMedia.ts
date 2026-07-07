import type { ExerciseMediaResource } from "../types";

type AssetModules<T> = Record<string, T>;

type ExerciseMediaRegistry = {
  gifByKey: Record<string, string>;
  illustrationByKey: Record<string, string>;
  lottieByKey: Record<string, unknown>;
  mp4ByKey: Record<string, string>;
  previewByKey: Record<string, string>;
};

const toMediaKey = (assetPath: string) => {
  const normalizedPath = assetPath.replace(/\\/g, "/");
  const match = normalizedPath.match(/\/exercises\/([^/]+)\//);
  return match?.[1] ?? "";
};

const groupAssetModulesByKey = <T,>(modules: AssetModules<T>) =>
  Object.fromEntries(
    Object.entries(modules)
      .map(([assetPath, assetValue]) => [toMediaKey(assetPath), assetValue] as const)
      .filter(([mediaKey]) => mediaKey)
  );

export const buildExerciseMediaRegistry = ({
  gifModules,
  illustrationModules,
  lottieModules,
  mp4Modules,
  previewModules
}: {
  gifModules: AssetModules<string>;
  illustrationModules: AssetModules<string>;
  lottieModules: AssetModules<unknown>;
  mp4Modules: AssetModules<string>;
  previewModules: AssetModules<string>;
}): ExerciseMediaRegistry => ({
  gifByKey: groupAssetModulesByKey(gifModules),
  illustrationByKey: groupAssetModulesByKey(illustrationModules),
  lottieByKey: groupAssetModulesByKey(lottieModules),
  mp4ByKey: groupAssetModulesByKey(mp4Modules),
  previewByKey: groupAssetModulesByKey(previewModules)
});

const exerciseMediaRegistry = buildExerciseMediaRegistry({
  gifModules: import.meta.glob("../assets/exercises/*/animation.gif", {
    eager: true,
    import: "default"
  }) as AssetModules<string>,
  illustrationModules: import.meta.glob("../assets/exercises/*/illustration.svg", {
    eager: true,
    import: "default"
  }) as AssetModules<string>,
  lottieModules: import.meta.glob("../assets/exercises/*/animation.json", {
    eager: true,
    import: "default"
  }) as AssetModules<unknown>,
  mp4Modules: import.meta.glob("../assets/exercises/*/animation.mp4", {
    eager: true,
    import: "default"
  }) as AssetModules<string>,
  previewModules: import.meta.glob("../assets/exercises/*/preview.png", {
    eager: true,
    import: "default"
  }) as AssetModules<string>
});

export const resolveExerciseMediaFromRegistry = (
  mediaKey: string,
  exerciseName: string,
  registry: ExerciseMediaRegistry
): ExerciseMediaResource => {
  const previewSrc = registry.previewByKey[mediaKey] ?? null;
  const alt = `Guia visual de ${exerciseName}`;

  if (registry.lottieByKey[mediaKey]) {
    return {
      alt,
      animationData: registry.lottieByKey[mediaKey],
      kind: "lottie",
      previewSrc
    };
  }

  if (registry.mp4ByKey[mediaKey]) {
    return {
      alt,
      kind: "mp4",
      previewSrc,
      src: registry.mp4ByKey[mediaKey]
    };
  }

  if (registry.gifByKey[mediaKey]) {
    return {
      alt,
      kind: "gif",
      previewSrc,
      src: registry.gifByKey[mediaKey]
    };
  }

  if (registry.illustrationByKey[mediaKey]) {
    return {
      alt,
      kind: "svg",
      previewSrc,
      src: registry.illustrationByKey[mediaKey]
    };
  }

  return {
    alt: `Animacion de ${exerciseName} disponible proximamente`,
    kind: "placeholder",
    previewSrc
  };
};

export const resolveExerciseMedia = (mediaKey: string, exerciseName: string) =>
  resolveExerciseMediaFromRegistry(mediaKey, exerciseName, exerciseMediaRegistry);
