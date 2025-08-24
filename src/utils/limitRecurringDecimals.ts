export function limitRecurringDecimals(num: string | number): string {
  const number = typeof num === "string" ? parseFloat(num) : num;

  const str = number.toString();
  const decimalIndex = str.indexOf(".");

  if (decimalIndex === -1) return String(num); // No decimal point

  const decimalPart = str.slice(decimalIndex + 1);

  // Check if there's a recurring single digit (same digit repeated 5+ times)
  const recurringMatch = decimalPart.match(/(\d)\1{4,}/);

  if (recurringMatch) {
    const recurringDigit = recurringMatch[1];
    const startIndex = recurringMatch.index;

    // Special case: if it's recurring 9s starting at beginning, round up to avoid 0.9999
    if (recurringDigit === "9" && startIndex === 0) {
      return String(Math.round(number));
    }

    // Special case: if it's recurring 0s starting at beginning, round to avoid 0.0000
    if (recurringDigit === "0" && startIndex === 0) {
      return String(Math.round(number));
    }

    // Found recurring digit, show prefix + exactly 4 of the recurring digit
    const integerPart = str.slice(0, decimalIndex);
    const beforeRecurring = decimalPart.slice(0, startIndex);
    const recurringPart = recurringDigit.repeat(4);
    return integerPart + "." + beforeRecurring + recurringPart + "...";
  }

  // Check if there's a recurring 3-digit pattern, prioritizing patterns that don't start with 0
  let bestMatch = null;

  for (let i = 0; i <= decimalPart.length - 6; i++) {
    const pattern = decimalPart.slice(i, i + 3);

    let matchCount = 0;
    let pos = i;

    // Count how many times this 3-digit pattern repeats consecutively
    while (
      pos + 3 <= decimalPart.length &&
      decimalPart.slice(pos, pos + 3) === pattern
    ) {
      matchCount++;
      pos += 3;
    }

    // Check if there are partial matches that would indicate the pattern continues
    let totalPatternChars = matchCount * 3;
    if (pos < decimalPart.length) {
      const remaining = decimalPart.slice(pos);
      let partialMatch = 0;
      for (let j = 0; j < Math.min(remaining.length, pattern.length); j++) {
        if (remaining[j] === pattern[j]) {
          partialMatch++;
        } else {
          break;
        }
      }
      totalPatternChars += partialMatch;
    }

    // If we have a valid recurring pattern (2+ complete matches)
    if (matchCount >= 2) {
      // If we have 7+ total chars, we limit it. If we have exactly 6 (2 complete patterns), we still show ellipsis
      if (!bestMatch || (pattern[0] !== "0" && bestMatch.pattern[0] === "0")) {
        bestMatch = {
          i,
          pattern,
          totalPatternChars,
          shouldLimit: totalPatternChars >= 7,
        };
      }
    }
  }

  if (bestMatch) {
    const integerPart = str.slice(0, decimalIndex);
    const beforePattern = decimalPart.slice(0, bestMatch.i);

    if (bestMatch.shouldLimit) {
      // Limit to 2 complete patterns (6 digits)
      const limitedPattern = bestMatch.pattern + bestMatch.pattern;
      return integerPart + "." + beforePattern + limitedPattern + "...";
    } else {
      // Just 2 complete patterns, but still show ellipsis to indicate repetition
      return (
        integerPart +
        "." +
        beforePattern +
        bestMatch.pattern +
        bestMatch.pattern +
        "..."
      );
    }
  }

  return String(number); // No recurring pattern found, return original
}
