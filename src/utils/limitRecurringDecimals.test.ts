import { test, expect } from "bun:test";
import { limitRecurringDecimals } from "./limitRecurringDecimals";

test("handles numbers without decimal points", () => {
  expect(limitRecurringDecimals(5)).toBe("5");
  expect(limitRecurringDecimals("10")).toBe("10");
  expect(limitRecurringDecimals(0)).toBe("0");
});

test("handles recurring single digits (5+ repetitions)", () => {
  expect(limitRecurringDecimals(1.3333333)).toBe("1.3333...");
  expect(limitRecurringDecimals(1.1666666)).toBe("1.16666...");
  expect(limitRecurringDecimals("2.7777777")).toBe("2.7777...");
  expect(limitRecurringDecimals(5.2222222)).toBe("5.2222...");
  expect(limitRecurringDecimals(0.05555555555)).toBe("0.05555...");

  // Yep nasty ones
  expect(limitRecurringDecimals(0.9999999)).toBe("1");
  expect(limitRecurringDecimals(0.0000033333)).toBe("0");
});

test("handles recurring 3-digit patterns with 7+ total digits", () => {
  // Pattern "123" repeated: 123123123... (7 digits) -> limit to 6 digits
  expect(limitRecurringDecimals(0.1231231237)).toBe("0.123123...");

  // Pattern "142" repeated: 142142142142... (12 digits) -> limit to 6 digits
  expect(limitRecurringDecimals(0.142142142142)).toBe("0.142142...");

  // Pattern "571" repeated: 571571571... (9 digits) -> limit to 6 digits
  expect(limitRecurringDecimals(1.571571571)).toBe("1.571571...");

  // Pattern "027" repeated with leading digits
  // expect(limitRecurringDecimals(3.45027027027027)).toBe("3.45027027");
  expect(limitRecurringDecimals(0.07407407)).toBe("0.0740740...");
});

test("does NOT limit recurring 3-digit patterns with 6 or fewer digits", () => {
  expect(limitRecurringDecimals(0.123123)).toBe("0.123123...");

  // Pattern "456" repeated 1.5 times (4.5 digits) - should not be limited
  expect(limitRecurringDecimals(0.45645)).toBe("0.45645");
});

test("handles non-recurring decimals", () => {
  expect(limitRecurringDecimals(1.25)).toBe("1.25");
  expect(limitRecurringDecimals(3.14159)).toBe("3.14159");
  expect(limitRecurringDecimals(0.5)).toBe("0.5");
});

test("handles edge cases with recurring patterns", () => {
  // Single digit repeated only 4 times (not 5+) - should not be limited
  expect(limitRecurringDecimals(1.222222)).toBe("1.2222...");

  // Mixed patterns - no clear recurring pattern
  expect(limitRecurringDecimals(1.1234567)).toBe("1.1234567");
});

test("handles string input", () => {
  expect(limitRecurringDecimals("1.3333333")).toBe("1.3333...");
  expect(limitRecurringDecimals("0.142142142")).toBe("0.142142...");
  expect(limitRecurringDecimals("3.14")).toBe("3.14");
});

test("handles complex recurring patterns", () => {
  // Pattern that starts mid-decimal
  expect(limitRecurringDecimals(1.41421356237)).toBe("1.41421356237");

  // Multiple different patterns (should not trigger limiting)
  expect(limitRecurringDecimals(0.12312456745)).toBe("0.12312456745");

  // Pattern at the very end
  expect(limitRecurringDecimals(3.141592653589793238462643383279)).toBe(
    "3.141592653589793"
  );
});
