import { useEffect, useState } from "react";
import "./App.css";
import { factorable } from "./factorable";
import { GridElement } from "./GridElement";
import { Modal } from "./Modal";
import estimationsData from "./estimations.json";

export interface Data {
  number: string;
  i: number;
  j: number;
}
export interface Estimation extends Data {
  estimation: string;
}
export interface Estimations {
  [i: number]: { [j: number]: number | null };
}

export const removeFluff = (number: number): string => {
  const string = "" + parseFloat(String(number)).toPrecision(12);
  if (string.length < 6) return string;
  const index = string.indexOf("0000");
  const ans = string.slice(0, index);
  const shorter = ans.slice(0, 5);
  return shorter.endsWith(".") ? shorter.slice(0, -1) : shorter;
};

const colorOf = (number: number) => {
  if (number > 5 || number <= 0) return "#000";
  const unbound = Math.abs(number - 1) * 12 + 0.2;
  const error = Math.max(0, Math.min(1, unbound));
  const g = [50, 255, 50];
  const r = [255, 50, 50];
  const e = g.map((n, i) => n * (1 - error) + error * r[i]);
  const a = number === 1 ? g : e;
  return `rgba(${a[0]}, ${a[1]}, ${a[2]}, 0.25)`;
};
function App() {
  const [base, setBase] = useState(10);
  const [xAxis, setXAxis] = useState(2);
  const [yAxis, setYAxis] = useState(3);
  const [tableWidth, setTableWidth] = useState(9);
  const [percentageError, setPercentageError] = useState(true);

  const [estimation, setEstimation] = useState<null | Estimation>();
  const [estimations, setEstimations] = useState<Estimations>(() => {
    const storage = localStorage.getItem("estimations");
    return storage ? JSON.parse(storage) : estimationsData;
  });

  useEffect(() => {
    localStorage.setItem("estimations", JSON.stringify(estimations));
  });

  const stuff: Data[][] = [];
  for (let i = 0; i < tableWidth; i++) {
    stuff[i] = [];
    for (let j = 0; j < tableWidth; j++) {
      const row = -i + Math.floor(tableWidth / 2);
      const column = j - Math.floor(tableWidth / 2);
      const number = Math.pow(yAxis, row) * Math.pow(xAxis, column);
      stuff[i][j] = {
        number: number.toString(base).slice(0, 10),
        i: row,
        j: column,
      };
    }
  }
  return (
    <div className="App">
      <table style={{ width: "100vw", textAlign: "center" }}>
        <tbody>
          {stuff.map((row, i) => (
            <tr key={i}>
              {row.map((data, j) => (
                <GridElement
                  key={j}
                  data={data}
                  estimations={estimations}
                  setEstimation={setEstimation}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Modal open={!!estimation} close={() => setEstimation(null)}>
        <div style={{ paddingLeft: "24px" }}>
          <h2>Add estimation</h2>
          Estimate {estimation?.number} as{" "}
          <input
            type="text"
            autoFocus
            value={estimation?.estimation || ""}
            onChange={(e) =>
              estimation &&
              setEstimation({
                ...estimation,
                estimation: e.target.value,
              })
            }
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              if (!estimation) return;
              setEstimation(null);
              const { i, j, estimation: value } = estimation;
              const newEstimations = { ...estimations };
              newEstimations[i] = estimations[i] ? { ...estimations[i] } : [];
              newEstimations[i][j] = parseFloat(value);
              setEstimations(newEstimations);
            }}
          />
        </div>
      </Modal>
      <br />
      <div className="wrapper">
        <div className="controls">
          <div>
            <label>Base:</label>
            <input
              type="text"
              value={base}
              onChange={(e) => setBase(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label>X-axis:</label>
            <input
              type="text"
              value={xAxis}
              onChange={(e) => setXAxis(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label>Y-axis:</label>
            <input
              type="text"
              value={yAxis}
              onChange={(e) => setYAxis(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label>Table width:</label>
            <input
              type="text"
              value={tableWidth}
              onChange={(e) => setTableWidth(parseInt(e.target.value))}
            />
          </div>
          <div>
            <input
              id="percentage"
              type="checkbox"
              checked={percentageError}
              onChange={(e) => setPercentageError((v) => !v)}
            />
            <label
              style={{ verticalAlign: "top", marginTop: 8 }}
              htmlFor="percentage"
            >
              Percentage error
            </label>
          </div>
        </div>
        <Summary estimations={estimations} percentageError={percentageError} />
      </div>
    </div>
  );
}

const decimalPlaces = (num: number) => {
  let i = 0;
  while (i < 50) {
    if (num * Math.pow(10, i) > 1) return i;
    i += 1;
  }
  console.error("uh oh", num);
  return num;
};

const Summary = (props: {
  estimations: Estimations;
  percentageError: boolean;
}) => {
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
      {new Array(80).fill(null).map((_, i) => {
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
};

export default App;
