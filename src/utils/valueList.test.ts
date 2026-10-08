import { test, expect } from "bun:test";
import {
  formatValue,
  migrateLegacyVisibility,
  parseValue,
  valueList,
} from "./valueList";

test("formats integers and fractions readably", () => {
  expect(formatValue(7)).toBe("7");
  expect(formatValue(Math.pow(3, 5))).toBe("243");
  expect(formatValue(4.5)).toBe("9/2");
  expect(formatValue(8 / 3)).toBe("8/3");
  expect(formatValue(Math.pow(3, -5) * Math.pow(2, -8))).toBe("1/62208");
  expect(formatValue(-2 / 3)).toBe("-2/3");
  expect(formatValue(Math.PI)).toBe(String(Math.PI));
});

test("parses fractions and decimals", () => {
  expect(parseValue("8/3")).toBeCloseTo(8 / 3);
  expect(parseValue("4.5")).toBe(4.5);
  expect(parseValue("12")).toBe(12);
});

test("round trips lists, keeping an empty list explicit", () => {
  expect(valueList.serialize([1, 4.5, 8 / 3])).toBe("1_9/2_8/3");
  expect(valueList.deserialize("1_9/2_8/3")).toEqual([1, 4.5, 8 / 3]);
  expect(valueList.serialize([])).toBe("none");
  expect(valueList.deserialize("none")).toEqual([]);
  expect(valueList.serialize(null)).toBe("");
  expect(valueList.deserialize("")).toBe(null);
});

test("leaves URLs without legacy params alone", () => {
  expect(migrateLegacyVisibility("?show=1_2&blind=true")).toBe(null);
});

test("converts visible and masked coordinates to values", () => {
  // Coordinates are row.column, rows use the y factor (3), columns the x (2)
  const search = migrateLegacyVisibility(
    "?visible=0.0_0.4_1.3_-1.0&masked=0.1&xP=10&blind=true",
  );
  const params = new URLSearchParams(search!);
  expect(params.get("visible")).toBe(null);
  expect(params.get("masked")).toBe(null);
  expect(params.get("show")).toBe("1_16_24_1/3");
  expect(params.get("hide")).toBe("2");
  expect(params.get("xP")).toBe("10");
  expect(search).toContain("1/3");
});

test("masked wins over visible and value lists", () => {
  const search = migrateLegacyVisibility(
    "?visible=0.1&masked=0.1_0.2&show=4_7&hide=2&centralNumber=1",
  );
  const params = new URLSearchParams(search!);
  expect(params.get("show")).toBe("7");
  expect(params.get("hide")).toBe("2_4");
});

test("an absent visible param still shows the centre", () => {
  const search = migrateLegacyVisibility("?masked=0.1&centralNumber=7");
  expect(new URLSearchParams(search!).get("show")).toBe("7");
});
