import { useState } from "react";
import { Estimations } from "../App";
import { factorable } from "../utils/factorable";
import { useURLState } from "../utils/useURLState";

export function Summary(props: {
  estimations: Estimations;
  percentageError: boolean;
}) {
  const precalc: { [number: number]: { estimation: string; error: string } } =
    {};
  for (let keyI in props.estimations) {
    const i = parseInt(keyI);
    const obj = props.estimations[i];
    for (let keyJ in obj) {
      const j = parseInt(keyJ);
      const actual = Math.pow(2, j) * Math.pow(3, i);
      const estimation = obj[j];
      if (estimation === null) continue;
      const error = removeFluff(estimation / actual);
      const data = {
        estimation: String(estimation),
        error,
      } as const;

      const upscale = Math.pow(10, decimalPlaces(estimation));

      const addFactor = (num: number) => {
        const multiple = estimation * num * upscale;
        if (Math.abs(multiple - Math.round(multiple)) > 0.0001) return;
        precalc[Math.round(multiple)] = data;
      };
      addFactor(1);
      factorable.forEach(addFactor);
    }
  }
  return (
    <div className="summary">
      {new Array(100).fill(null).map((_, i) => {
        const num = i + 1;
        const estimation = precalc[num];
        const percentage = estimation
          ? (parseFloat(estimation.error) - 1) * 100
          : null;
        return (
          <div
            key={num}
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <span
              className="summaryNumber"
              style={{
                backgroundColor: colorOf(
                  parseFloat(estimation?.error) ||
                    (factorable.has(num) || num === 1 ? 1 : 0)
                ),
              }}
              key={num}
            >
              {estimation && percentage ? (
                <>
                  <span style={{ marginLeft: 8 }}></span>
                  <span>{estimation?.estimation}</span>
                  <span style={{ marginLeft: 8 }}></span>
                  <span>
                    {props.percentageError
                      ? removeFluff(percentage) + "%"
                      : estimation?.error.slice(0, 7)}
                  </span>
                </>
              ) : (
                <span>{num}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
const decimalPlaces = (num: number) => {
  let i = -5;
  while (i < 50) {
    if (num * Math.pow(10, i) > 1) return i;
    i += 1;
  }
  console.error("uh oh", num);
  return num;
};
export const colorOf = (number: number) => {
  if (number > 5 || number <= 0) return "#000";
  const unbound = Math.abs(number - 1) * 12 + 0.2;
  const error = Math.max(0, Math.min(1, unbound));
  const g = [50, 255, 50];
  const r = [255, 50, 50];
  const e = g.map((n, i) => n * (1 - error) + error * r[i]);
  const a = number === 1 ? g : e;
  return `rgba(${a[0]}, ${a[1]}, ${a[2]}, 0.25)`;
};
export const removeFluff = (number: number): string => {
  const string = "" + parseFloat(String(number)).toPrecision(12);
  if (string.length < 6) return string;
  const index = string.indexOf("0000");
  const ans = string.slice(0, index);
  const shorter = ans.slice(0, 5);
  return shorter.endsWith(".") ? shorter.slice(0, -1) : shorter;
};
