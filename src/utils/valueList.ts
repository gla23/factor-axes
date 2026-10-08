import { urlStateDefaults } from "../defaults";

const maxDenominator = 1_000_000;
const listSeparator = "_";
const emptyList = "none";

// Relative, so tiny values like 1/62208 aren't confused with their neighbours
const isClose = (a: number, b: number, tolerance = 1e-9) =>
  a === b || Math.abs(a - b) <= Math.abs(b) * tolerance;
// Only treat a value as a fraction if it matches to floating point precision
const isExact = (a: number, b: number) => isClose(a, b, 1e-13);

// Writes a grid value as an integer or exact fraction where possible, e.g. 8/3
export function formatValue(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  const rounded = Math.round(value);
  if (isExact(rounded, value)) return String(rounded);

  // Continued fraction expansion, keeping the convergents h/k
  const sign = value < 0 ? "-" : "";
  const target = Math.abs(value);
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  let remainder = target;
  while (true) {
    const a = Math.floor(remainder);
    [h0, h1] = [h1, a * h1 + h0];
    [k0, k1] = [k1, a * k1 + k0];
    if (k1 > maxDenominator) break;
    if (isExact(h1 / k1, target)) return `${sign}${h1}/${k1}`;
    remainder = 1 / (remainder - a);
    if (!Number.isFinite(remainder)) break;
  }
  return String(value);
}

export function parseValue(string: string): number {
  const [numerator, denominator] = string.trim().split("/");
  if (denominator === undefined) return parseFloat(numerator);
  return parseFloat(numerator) / parseFloat(denominator);
}

export const matchesValue = (values: ValueList, value: number) =>
  values?.some((candidate) => isClose(candidate, value)) ?? false;

export const withValue = (values: ValueList, value: number): number[] =>
  matchesValue(values, value) ? values ?? [] : [...(values ?? []), value];

export const withoutValue = (values: ValueList, value: number): number[] =>
  values?.filter((candidate) => !isClose(candidate, value)) ?? [];

// null means the param is absent, [] is written as "none" so it stays explicit
export type ValueList = number[] | null;
export const valueList = {
  serialize: (values: ValueList) => {
    if (!values) return "";
    if (values.length === 0) return emptyList;
    return values.map(formatValue).join(listSeparator);
  },
  deserialize: (string: string): ValueList => {
    if (!string || string.trim() === "") return null;
    if (string.trim() === emptyList) return [];
    const values = string
      .split(/[,_]/)
      .map(parseValue)
      .filter((value) => !Number.isNaN(value));
    return values.length > 0 ? values : null;
  },
};

/**
 * Converts the old coordinate-based `visible` and `masked` params into values
 * in `show` and `hide`, so old links (e.g. in Anki decks) keep working.
 * Coordinates were `row.column`, and masked won over visible for the same cell.
 */
export function migrateLegacyVisibility(search: string): string | null {
  const params = new URLSearchParams(search);
  const visible = params.get("visible");
  const masked = params.get("masked");
  if (visible === null && masked === null) return null;

  const numberParam = (key: keyof typeof urlStateDefaults) => {
    const parsed = parseFloat(params.get(key) ?? "");
    return Number.isNaN(parsed) ? (urlStateDefaults[key] as number) : parsed;
  };
  const centralNumber = numberParam("centralNumber");
  const xAxisFactor = numberParam("xAxisFactor");
  const yAxisFactor = numberParam("yAxisFactor");

  const coordinateValues = (string: string) =>
    string
      .split("_")
      .map((coordinate) => coordinate.split(".").map((n) => parseInt(n)))
      .filter(([row, column]) => !Number.isNaN(row) && !Number.isNaN(column))
      .map(
        ([row, column]) =>
          centralNumber *
          Math.pow(yAxisFactor, row) *
          Math.pow(xAxisFactor, column),
      );

  let show = valueList.deserialize(params.get("show") ?? "");
  let hide = valueList.deserialize(params.get("hide") ?? "");

  // An absent `visible` used to mean the centre was shown
  for (const value of coordinateValues(visible ?? "0.0")) {
    show = withValue(show, value);
    hide = withoutValue(hide, value);
  }
  for (const value of coordinateValues(masked ?? "")) {
    hide = withValue(hide, value);
    show = withoutValue(show, value);
  }

  params.delete("visible");
  params.delete("masked");
  params.set("show", valueList.serialize(show));
  if (hide && hide.length > 0) params.set("hide", valueList.serialize(hide));
  else params.delete("hide");

  return readableSearch(params.toString());
}

// URLSearchParams escapes slashes, but they're valid in a query string
export const readableSearch = (search: string) => search.replaceAll("%2F", "/");
