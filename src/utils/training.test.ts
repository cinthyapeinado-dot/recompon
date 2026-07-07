import { formatTimer } from "./training";

describe("training helpers", () => {
  it("formats the rest timer in mm:ss", () => {
    expect(formatTimer(0)).toBe("00:00");
    expect(formatTimer(75)).toBe("01:15");
    expect(formatTimer(125)).toBe("02:05");
  });
});
