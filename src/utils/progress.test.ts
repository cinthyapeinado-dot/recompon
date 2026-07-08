import { createDefaultProgress, normalizeProgress } from "./progress";

describe("progress helpers", () => {
  it("creates a default progress object with training mode fields", () => {
    const progress = createDefaultProgress();

    expect(progress.trainingModePreference).toBeNull();
    expect(progress.trainingModeByWeek).toEqual({});
  });

  it("normalizes persisted training mode preference and per-session overrides", () => {
    const progress = normalizeProgress({
      currentWeek: 3,
      trainingModePreference: "alternated",
      trainingModeByWeek: {
        "3": {
          monday: "circuit",
          tuesday: "traditional",
          invalid: "broken"
        }
      }
    });

    expect(progress.trainingModePreference).toBe("alternated");
    expect(progress.trainingModeByWeek).toEqual({
      "3": {
        monday: "circuit",
        tuesday: "traditional"
      }
    });
  });
});
