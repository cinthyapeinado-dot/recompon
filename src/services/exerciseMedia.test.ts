import {
  buildExerciseMediaRegistry,
  buildExerciseMediaSearchTerms,
  resetExerciseMediaCache,
  resolveExerciseMedia,
  resolveLocalExerciseMediaFromRegistry
} from "./exerciseMedia";

const createRegistry = () =>
  buildExerciseMediaRegistry({
    gifModules: {
      "../assets/exercises/leg-press/demo.gif": "/leg-press.gif"
    },
    mp4Modules: {
      "../assets/exercises/hip-thrust/demo.mp4": "/hip-thrust.mp4"
    },
    previewModules: {
      "../assets/exercises/face-pull/preview.png": "/face-pull.png",
      "../assets/exercises/lat-pulldown/preview.png": "/lat-pulldown.png"
    }
  });

describe("exercise media service", () => {
  beforeEach(() => {
    resetExerciseMediaCache();
  });

  it("prioritizes local video and gif files before any remote lookup", () => {
    const registry = createRegistry();

    const hipThrustMedia = resolveLocalExerciseMediaFromRegistry(
      "hip-thrust",
      "Hip Thrust",
      registry
    );
    const legPressMedia = resolveLocalExerciseMediaFromRegistry("leg-press", "Prensa", registry);

    expect(hipThrustMedia?.kind).toBe("mp4");
    expect(hipThrustMedia?.source).toBe("local");
    expect(legPressMedia?.kind).toBe("gif");
  });

  it("builds stable ExerciseDB search terms from media metadata", () => {
    const searchTerms = buildExerciseMediaSearchTerms({
      equipment: "cable",
      externalExerciseId: undefined,
      mediaKey: "lat-pulldown",
      muscleGroup: "Espalda",
      name: "Jalon"
    });

    expect(searchTerms).toContain("lat pulldown");
    expect(searchTerms).toContain("cable lat pulldown");
    expect(searchTerms).toContain("cable Jalon");
  });

  it("resolves external media by stable ExerciseDB id and reuses the in-memory cache", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: {
            exerciseId: "LEprlgG",
            gifUrl: "https://static.exercisedb.dev/media/LEprlgG.gif",
            name: "cable lat pulldown full range of motion"
          }
        }),
        {
          headers: {
            "Content-Type": "application/json"
          },
          status: 200
        }
      )
    ) as typeof fetch;

    const exercise = {
      equipment: "cable",
      externalExerciseId: "LEprlgG",
      mediaKey: "lat-pulldown",
      muscleGroup: "Espalda",
      name: "Jalon"
    };

    const first = await resolveExerciseMedia(exercise, {
      fetchImpl,
      registry: createRegistry()
    });
    const second = await resolveExerciseMedia(exercise, {
      fetchImpl,
      registry: createRegistry()
    });

    expect(first.kind).toBe("gif");
    expect(first.source).toBe("external");
    expect(first.src).toContain("LEprlgG.gif");
    expect(second.src).toBe(first.src);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("falls back to a local preview when remote media is unavailable", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("<html>temporarily unavailable</html>", {
        headers: {
          "Content-Type": "text/html"
        },
        status: 503
      })
    ) as typeof fetch;

    const media = await resolveExerciseMedia(
      {
        equipment: "cable",
        externalExerciseId: undefined,
        mediaKey: "face-pull",
        muscleGroup: "Espalda alta",
        name: "Face Pull"
      },
      {
        fetchImpl,
        registry: createRegistry()
      }
    );

    expect(media.kind).toBe("image");
    expect(media.source).toBe("preview");
    expect(media.src).toBe("/face-pull.png");
  });

  it("returns a clean professional placeholder when no media source resolves", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ success: true, data: [] }), {
        headers: {
          "Content-Type": "application/json"
        },
        status: 200
      })
    ) as typeof fetch;

    const media = await resolveExerciseMedia(
      {
        equipment: "body weight",
        externalExerciseId: undefined,
        mediaKey: "bird-dog",
        muscleGroup: "Core",
        name: "Bird Dog"
      },
      {
        fetchImpl,
        registry: createRegistry()
      }
    );

    expect(media.kind).toBe("placeholder");
    expect(media.source).toBe("placeholder");
    expect(media.alt).toContain("disponible próximamente");
  });
});
