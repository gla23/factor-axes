import { useEffect, useState } from "react";
import { Modal } from "content-modal";
import "./App.css";
import { factorable } from "./utils/factorable";
import { GridElement } from "./GridElement";
import estimationsData from "./estimations.json";
import { getItem, setItem } from "./utils/localStorage";

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

function urlCoordinates(param: string | null) {
  return param
    ?.split(" ")
    .map((pair) => pair.split(",").map((str) => parseInt(str)));
}
function App() {
  const params = new URLSearchParams(location.search);
  const [base, setBase] = useState(10);
  const [xAxis, setXAxis] = useState(2);
  const [yAxis, setYAxis] = useState(3);
  const axes = params
    .get("axes")
    ?.split(",")
    .map((str) => parseInt(str));
  const [axisLengths, setAxisLengths] = useState<(number | undefined)[]>(
    axes || [6, 5, 4, 3]
  );
  const [percentageError, setPercentageError] = useState(true);
  const [gridLines, setGridLines] = useState(params.get("grid") !== null);
  const simple = params.get("simple") !== null;
  const blind = params.get("blind") !== null;

  const hiddenBoxes = urlCoordinates(params.get("hidden"));
  const showingBoxes = urlCoordinates(params.get("showing"));

  const [estimation, setEstimation] = useState<null | Estimation>();
  const [estimations, setEstimations] = useState<Estimations>(() => {
    const storage = getItem("estimations");
    return storage ? JSON.parse(storage) : estimationsData;
  });

  useEffect(() => {
    setItem("estimations", JSON.stringify(estimations));
  });

  const [x = 6, xN = 5, y = 4, yN = 3] = axisLengths;
  const stuff: Data[][] = [];
  for (let i = 0; i < y + yN - 1; i++) {
    stuff[i] = [];
    for (let j = 0; j < x + xN - 1; j++) {
      const row = y - 1 - i;
      const column = j - xN + 1;
      const number = Math.pow(yAxis, row) * Math.pow(xAxis, column);
      stuff[i][j] = {
        number: number.toString(base).slice(0, 10),
        i: row,
        j: column,
      };
    }
  }

  const mainGrid = (
    <table
      style={{ width: "100vw", textAlign: "center", overflow: "hidden" }}
      className={blind ? "" : "notBlind"}
    >
      <tbody>
        {stuff.map((row, i) => (
          <tr key={i}>
            {row.map((data, j) => (
              <GridElement
                key={j}
                data={data}
                estimations={estimations}
                setEstimation={setEstimation}
                gridDimensions={axisLengths}
                gridLines={gridLines}
                blind={blind}
                hidden={hiddenBoxes?.some(
                  (box) => box[0] === data.j && box[1] === data.i
                )}
                startShowing={
                  (data.number === "1" ||
                    showingBoxes?.some(
                      (box) => box[0] === data.j && box[1] === data.i
                    )) ??
                  false
                }
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
  if (simple) return mainGrid;
  return (
    <div className="App">
      {mainGrid}
      <Modal
        isOpen={!!estimation}
        onClose={() => setEstimation(undefined)}
        darkMode={true}
      >
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
          <div
            className="control"
            style={{ marginRight: 8 }}
            onClick={() => setEstimations({})}
          >
            Clear
          </div>
          <div
            className="control"
            onClick={() => setEstimations(estimationsData)}
          >
            Reset
          </div>
          <div>
            <input
              id="gridLines"
              type="checkbox"
              checked={gridLines}
              onChange={(e) => setGridLines((v) => !v)}
            />
            <label
              style={{
                verticalAlign: "top",
                textAlign: "left",
                marginLeft: 8,
                marginTop: 8,
              }}
              htmlFor="gridLines"
            >
              Grid lines
            </label>
          </div>
          <div>
            <input
              id="percentage"
              type="checkbox"
              checked={percentageError}
              onChange={(e) => setPercentageError((v) => !v)}
            />
            <label
              style={{
                verticalAlign: "top",
                textAlign: "left",
                marginLeft: 8,
                marginTop: 8,
              }}
              htmlFor="percentage"
            >
              Percentage error
            </label>
          </div>
          <div>
            <label>Axis lengths:</label>
            <input
              type="text"
              value={axisLengths.join(" ")}
              onChange={(e) => {
                const value = e.target.value;
                const strings = value.split(" ");
                setAxisLengths(
                  strings.flatMap((string) =>
                    string === "" ? [undefined] : [parseInt(string)]
                  )
                );
              }}
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
            <label>Base:</label>
            <input
              type="text"
              value={base}
              onChange={(e) => setBase(parseInt(e.target.value))}
            />
          </div>
        </div>
        <Summary estimations={estimations} percentageError={percentageError} />
      </div>
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
};

export default App;
