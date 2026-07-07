import type { Exercise, ExerciseMediaResource } from "../types";

type AssetModules<T> = Record<string, T>;

type ExerciseDbExercise = {
  exerciseId: string;
  gifUrl?: string;
  imageUrl?: string;
  name: string;
  videoUrl?: string;
};

type ExerciseDbByIdResponse = {
  data?: ExerciseDbExercise;
  success?: boolean;
};

type ExerciseDbSearchResponse = {
  data?: ExerciseDbExercise[];
  success?: boolean;
};

type ExerciseMediaLookup = Pick<
  Exercise,
  "equipment" | "externalExerciseId" | "mediaKey" | "muscleGroup" | "name"
>;

type ResolveExerciseMediaOptions = {
  fetchImpl?: typeof fetch;
  registry?: ExerciseMediaRegistry;
};

export type ExerciseMediaRegistry = {
  gifByKey: Record<string, string>;
  mp4ByKey: Record<string, string>;
  previewByKey: Record<string, string>;
};

const EXERCISE_DB_API_BASE_URL = "https://oss.exercisedb.dev/api/v1";
const EXERCISE_DB_REQUEST_TIMEOUT_MS = 4500;

const legacyBrandedPreviewKeys = new Set([
  "hip-thrust",
  "lat-pulldown",
  "leg-press",
  "romanian-deadlift"
]);

const exerciseDbLookupHints: Record<string, string[]> = {
  "biceps-curl": ["dumbbell biceps curl", "biceps curl"],
  "calf-raise": ["standing calf raise", "seated calf raise", "calf raise"],
  "cable-pull-through": ["cable pull through", "pull through"],
  "chest-press": ["machine chest press", "lever chest press", "chest press"],
  "close-grip-pulldown": ["close grip lat pulldown", "close grip pulldown"],
  "dumbbell-row": ["one arm dumbbell row", "dumbbell row"],
  "face-pull": ["face pull"],
  "glute-kickback": ["cable glute kickback", "cable kickback", "glute kickback"],
  "hammer-curl": ["hammer curl", "dumbbell hammer curl"],
  "hip-abduction": ["machine hip abduction", "hip abduction"],
  "hip-thrust": ["barbell hip thrust", "hip thrust"],
  "lat-pulldown": ["lat pulldown", "cable lat pulldown"],
  "leg-curl": ["seated leg curl", "lying leg curl", "leg curl"],
  "leg-extension": ["machine leg extension", "leg extension"],
  "leg-press": ["45 degree leg press", "sled leg press", "leg press"],
  "lateral-raise": ["dumbbell lateral raise", "lateral raise"],
  "overhead-press": ["dumbbell overhead press", "overhead press"],
  plank: ["plank"],
  "romanian-deadlift": ["barbell romanian deadlift", "romanian deadlift"],
  "seated-row": ["cable seated row", "seated row"],
  "shoulder-press": ["machine shoulder press", "shoulder press"],
  "triceps-extension": ["lever triceps extension", "triceps extension"]
};

// ExerciseDB documents plan-specific caching rules, so we keep third-party media lookups
// in memory for the current session only and avoid persisting vendor responses locally.
const exerciseMediaCache = new Map<string, Promise<ExerciseMediaResource | null>>();

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

const mergeAssetModules = <T,>(...modules: Array<AssetModules<T>>) =>
  Object.assign({}, ...modules);

const normalizeSpace = (value: string) => value.replace(/\s+/g, " ").trim();

const unique = (values: string[]) => Array.from(new Set(values));

const getExerciseMediaCacheKey = (exercise: ExerciseMediaLookup) =>
  exercise.externalExerciseId ? `id:${exercise.externalExerciseId}` : `search:${exercise.mediaKey}`;

// These previews were legacy brand placeholders and must never render as exercise content.
const getPreviewSrc = (mediaKey: string, registry: ExerciseMediaRegistry) =>
  legacyBrandedPreviewKeys.has(mediaKey) ? null : registry.previewByKey[mediaKey] ?? null;

const createPlaceholderMedia = (exerciseName: string): ExerciseMediaResource => ({
  alt: `Animación disponible próximamente para ${exerciseName}`,
  kind: "placeholder",
  posterSrc: null,
  previewSrc: null,
  source: "placeholder"
});

const createPreviewMedia = (
  exerciseName: string,
  previewSrc: string
): ExerciseMediaResource => ({
  alt: `Vista previa de ${exerciseName}`,
  kind: "image",
  posterSrc: previewSrc,
  previewSrc,
  source: "preview",
  src: previewSrc
});

const createRemoteMedia = (
  exercise: ExerciseMediaLookup,
  media: ExerciseDbExercise,
  registry: ExerciseMediaRegistry
): ExerciseMediaResource | null => {
  const previewSrc = getPreviewSrc(exercise.mediaKey, registry);

  if (media.videoUrl) {
    return {
      alt: `Demostración de ${exercise.name}`,
      kind: "mp4",
      posterSrc: previewSrc,
      previewSrc,
      source: "external",
      src: media.videoUrl
    };
  }

  if (media.gifUrl) {
    return {
      alt: `Demostración de ${exercise.name}`,
      kind: "gif",
      posterSrc: previewSrc,
      previewSrc,
      source: "external",
      src: media.gifUrl
    };
  }

  if (media.imageUrl) {
    return {
      alt: `Vista previa de ${exercise.name}`,
      kind: "image",
      posterSrc: media.imageUrl,
      previewSrc,
      source: "external",
      src: media.imageUrl
    };
  }

  return null;
};

const getDefaultFetch = () =>
  typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : null;

const fetchExerciseDbJson = async <T,>(
  url: string,
  fetchImpl: typeof fetch
): Promise<T | null> => {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), EXERCISE_DB_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};

const fetchExerciseById = async (
  externalExerciseId: string,
  fetchImpl: typeof fetch
): Promise<ExerciseDbExercise | null> => {
  const response = await fetchExerciseDbJson<ExerciseDbByIdResponse>(
    `${EXERCISE_DB_API_BASE_URL}/exercises/${externalExerciseId}`,
    fetchImpl
  );

  if (!response?.success || !response.data) {
    return null;
  }

  return response.data;
};

export const buildExerciseMediaSearchTerms = (exercise: ExerciseMediaLookup) => {
  const mediaKeyLabel = exercise.mediaKey.replace(/-/g, " ");
  const equipment = normalizeSpace(exercise.equipment);
  const hints = exerciseDbLookupHints[exercise.mediaKey] ?? [];
  const candidates = [
    ...hints,
    equipment ? `${equipment} ${mediaKeyLabel}` : "",
    equipment ? `${equipment} ${exercise.name}` : "",
    mediaKeyLabel,
    exercise.name
  ];

  return unique(candidates.map(normalizeSpace).filter(Boolean));
};

const searchExerciseDb = async (
  exercise: ExerciseMediaLookup,
  fetchImpl: typeof fetch
): Promise<ExerciseDbExercise | null> => {
  for (const searchTerm of buildExerciseMediaSearchTerms(exercise)) {
    const params = new URLSearchParams({
      search: searchTerm,
      threshold: "0.4"
    });

    const response = await fetchExerciseDbJson<ExerciseDbSearchResponse>(
      `${EXERCISE_DB_API_BASE_URL}/exercises/search?${params.toString()}`,
      fetchImpl
    );
    const firstMatch = response?.success ? response.data?.[0] ?? null : null;

    if (firstMatch) {
      return firstMatch;
    }
  }

  return null;
};

export const buildExerciseMediaRegistry = ({
  gifModules,
  mp4Modules,
  previewModules
}: {
  gifModules: AssetModules<string>;
  mp4Modules: AssetModules<string>;
  previewModules: AssetModules<string>;
}): ExerciseMediaRegistry => ({
  gifByKey: groupAssetModulesByKey(gifModules),
  mp4ByKey: groupAssetModulesByKey(mp4Modules),
  previewByKey: groupAssetModulesByKey(previewModules)
});

const exerciseMediaRegistry = buildExerciseMediaRegistry({
  gifModules: mergeAssetModules(
    import.meta.glob("../assets/exercises/*/demo.gif", {
      eager: true,
      import: "default"
    }) as AssetModules<string>,
    import.meta.glob("../assets/exercises/*/animation.gif", {
      eager: true,
      import: "default"
    }) as AssetModules<string>
  ),
  mp4Modules: mergeAssetModules(
    import.meta.glob("../assets/exercises/*/demo.mp4", {
      eager: true,
      import: "default"
    }) as AssetModules<string>,
    import.meta.glob("../assets/exercises/*/animation.mp4", {
      eager: true,
      import: "default"
    }) as AssetModules<string>
  ),
  previewModules: mergeAssetModules(
    import.meta.glob("../assets/exercises/*/preview.png", {
      eager: true,
      import: "default"
    }) as AssetModules<string>,
    import.meta.glob("../assets/exercises/*/preview.jpg", {
      eager: true,
      import: "default"
    }) as AssetModules<string>,
    import.meta.glob("../assets/exercises/*/preview.webp", {
      eager: true,
      import: "default"
    }) as AssetModules<string>
  )
});

export const resolveLocalExerciseMediaFromRegistry = (
  mediaKey: string,
  exerciseName: string,
  registry: ExerciseMediaRegistry
): ExerciseMediaResource | null => {
  const previewSrc = getPreviewSrc(mediaKey, registry);

  if (registry.mp4ByKey[mediaKey]) {
    return {
      alt: `Demostración de ${exerciseName}`,
      kind: "mp4",
      posterSrc: previewSrc,
      previewSrc,
      source: "local",
      src: registry.mp4ByKey[mediaKey]
    };
  }

  if (registry.gifByKey[mediaKey]) {
    return {
      alt: `Demostración de ${exerciseName}`,
      kind: "gif",
      posterSrc: previewSrc,
      previewSrc,
      source: "local",
      src: registry.gifByKey[mediaKey]
    };
  }

  return null;
};

export const resolvePreviewMediaFromRegistry = (
  mediaKey: string,
  exerciseName: string,
  registry: ExerciseMediaRegistry
): ExerciseMediaResource | null => {
  const previewSrc = getPreviewSrc(mediaKey, registry);
  return previewSrc ? createPreviewMedia(exerciseName, previewSrc) : null;
};

const resolveExternalExerciseMedia = async (
  exercise: ExerciseMediaLookup,
  registry: ExerciseMediaRegistry,
  fetchImpl: typeof fetch
) => {
  const cacheKey = getExerciseMediaCacheKey(exercise);
  const cachedMedia = exerciseMediaCache.get(cacheKey);

  if (cachedMedia) {
    return cachedMedia;
  }

  const pendingMedia = (async () => {
    const externalExercise =
      (exercise.externalExerciseId
        ? await fetchExerciseById(exercise.externalExerciseId, fetchImpl)
        : null) ?? (await searchExerciseDb(exercise, fetchImpl));

    if (!externalExercise) {
      return null;
    }

    return createRemoteMedia(exercise, externalExercise, registry);
  })();

  exerciseMediaCache.set(cacheKey, pendingMedia);

  const resolvedMedia = await pendingMedia;

  if (!resolvedMedia) {
    exerciseMediaCache.delete(cacheKey);
  }

  return resolvedMedia;
};

export const resetExerciseMediaCache = () => {
  exerciseMediaCache.clear();
};

export const resolveExerciseMedia = async (
  exercise: ExerciseMediaLookup,
  options: ResolveExerciseMediaOptions = {}
): Promise<ExerciseMediaResource> => {
  const registry = options.registry ?? exerciseMediaRegistry;
  const localMedia = resolveLocalExerciseMediaFromRegistry(
    exercise.mediaKey,
    exercise.name,
    registry
  );

  if (localMedia) {
    return localMedia;
  }

  const fetchImpl = options.fetchImpl ?? getDefaultFetch();

  if (fetchImpl) {
    const externalMedia = await resolveExternalExerciseMedia(exercise, registry, fetchImpl);

    if (externalMedia) {
      return externalMedia;
    }
  }

  const previewMedia = resolvePreviewMediaFromRegistry(exercise.mediaKey, exercise.name, registry);
  return previewMedia ?? createPlaceholderMedia(exercise.name);
};
