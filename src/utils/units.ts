import type { WeightUnit } from "../types";

const KG_TO_LB = 2.2046226218;

export const roundToIncrement = (value: number, increment: number) =>
  Math.round(value / increment) * increment;

export const roundWeightForUnit = (value: number, unit: WeightUnit) =>
  unit === "kg" ? roundToIncrement(value, 0.5) : roundToIncrement(value, 1);

export const formatEditableWeight = (value: number, unit: WeightUnit) => {
  const rounded = roundWeightForUnit(value, unit);
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
};

export const convertWeight = (value: number, from: WeightUnit, to: WeightUnit) => {
  if (from === to) {
    return value;
  }

  return from === "kg" ? value * KG_TO_LB : value / KG_TO_LB;
};

export const formatWeightNumber = (value: number, unit: WeightUnit) => {
  const rounded = roundWeightForUnit(value, unit);
  const decimals = rounded % 1 === 0 ? 0 : 1;
  return `${rounded.toFixed(decimals)} ${unit}`;
};

export const parseWeightValue = (value: string) => {
  const normalized = value.replace(",", ".").trim();
  const match = normalized.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
};

export const formatWeightPair = (value: number, unit: WeightUnit) => {
  const primary = formatWeightNumber(value, unit);
  const secondaryUnit: WeightUnit = unit === "kg" ? "lb" : "kg";
  const secondaryValue = convertWeight(value, unit, secondaryUnit);
  const secondary = formatWeightNumber(secondaryValue, secondaryUnit);
  return { primary, secondary, secondaryUnit, secondaryValue };
};

export const formatWeightPairLabel = (value: number, unit: WeightUnit) => {
  const pair = formatWeightPair(value, unit);
  return `${pair.primary} · ${pair.secondary}`;
};

export const formatLoggedWeightLabel = (value: string, unit: WeightUnit) => {
  const numericValue = parseWeightValue(value);
  if (numericValue == null) {
    return value.trim();
  }

  return formatWeightPairLabel(numericValue, unit);
};

export const convertWeightInputValue = (
  value: string,
  from: WeightUnit,
  to: WeightUnit
) => {
  const numericValue = parseWeightValue(value);
  if (numericValue == null) {
    return value.trim();
  }

  return formatEditableWeight(convertWeight(numericValue, from, to), to);
};

export const toWeightSummary = (value: string, unit: WeightUnit) =>
  value.trim() ? `${value.trim()} ${unit}` : "";
