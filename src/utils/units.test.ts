import {
  convertWeightInputValue,
  formatWeightPairLabel,
  parseWeightValue
} from "./units";

describe("units", () => {
  it("converts the editable weight when switching units", () => {
    expect(convertWeightInputValue("18", "kg", "lb")).toBe("40");
    expect(convertWeightInputValue("40", "lb", "kg")).toBe("18");
  });

  it("formats both units together", () => {
    expect(formatWeightPairLabel(18, "kg")).toBe("18 kg · 40 lb");
    expect(formatWeightPairLabel(40, "lb")).toBe("40 lb · 18 kg");
  });

  it("parses weight values with commas or free text", () => {
    expect(parseWeightValue("12,5 kg")).toBe(12.5);
    expect(parseWeightValue("peso: 40 lb")).toBe(40);
  });
});
