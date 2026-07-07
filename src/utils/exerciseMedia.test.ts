import { buildExerciseMediaRegistry, resolveExerciseMediaFromRegistry } from "./exerciseMedia";

const createRegistry = () =>
  buildExerciseMediaRegistry({
    gifModules: {
      "../assets/exercises/leg-press/animation.gif": "/leg-press.gif"
    },
    illustrationModules: {
      "../assets/exercises/hip-thrust/illustration.svg": "/hip-thrust.svg"
    },
    lottieModules: {
      "../assets/exercises/lat-pulldown/animation.json": { name: "lat-pulldown" }
    },
    mp4Modules: {
      "../assets/exercises/lat-pulldown/animation.mp4": "/lat-pulldown.mp4"
    },
    previewModules: {
      "../assets/exercises/lat-pulldown/preview.png": "/lat-pulldown.png",
      "../assets/exercises/leg-press/preview.png": "/leg-press.png"
    }
  });

describe("exercise media resolver", () => {
  it("prioritizes lottie over other available formats", () => {
    const media = resolveExerciseMediaFromRegistry(
      "lat-pulldown",
      "Jalon",
      createRegistry()
    );

    expect(media.kind).toBe("lottie");
    expect(media.previewSrc).toBe("/lat-pulldown.png");
  });

  it("falls back through gif and svg before placeholder", () => {
    const gifMedia = resolveExerciseMediaFromRegistry("leg-press", "Prensa", createRegistry());
    const svgMedia = resolveExerciseMediaFromRegistry("hip-thrust", "Hip Thrust", createRegistry());

    expect(gifMedia.kind).toBe("gif");
    expect(svgMedia.kind).toBe("svg");
  });

  it("returns an elegant placeholder when no animation exists", () => {
    const media = resolveExerciseMediaFromRegistry(
      "face-pull",
      "Face Pull",
      createRegistry()
    );

    expect(media.kind).toBe("placeholder");
    expect(media.alt).toContain("disponible proximamente");
  });
});
