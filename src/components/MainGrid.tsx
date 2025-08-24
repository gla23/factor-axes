import { GridElement } from "./GridElement";
import { StatePair } from "../utils/StatePair";
import { useURLState } from "../utils/useURLState";

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

export interface MainGridProps {
  estimationsState: StatePair<Estimations>;
  estimationModalState: StatePair<null | Estimation>;
}

interface Coordinate {
  x: number;
  y: number;
}
const serialiseCoordinate = (coords: null | Coordinate[]) =>
  coords?.map((coord) => `${coord.x}-${coord.y}`).join(",") ?? "";

const unserialiseCoordinate = (str: string): null | Coordinate[] =>
  str.split(",").map((inner) => {
    const [x, y] = inner.split("-");
    return { x: parseInt(x), y: parseInt(y) };
  });
const coordinate = {
  serialize: serialiseCoordinate,
  deserialize: unserialiseCoordinate,
};

export function MainGrid(props: MainGridProps) {
  const [estimations] = props.estimationsState;
  const [, setEstimation] = props.estimationModalState;

  const [xAxisFactor] = useURLState("xAxisFactor", 2);
  const [yAxisFactor] = useURLState("yAxisFactor", 3);
  const [base] = useURLState("base", 10);
  const [gridLines] = useURLState("grid-lines", true);
  const [xP] = useURLState("xP", 6);
  const [xN] = useURLState("xN", 5);
  const [yP] = useURLState("yP", 4);
  const [yN] = useURLState("yN", 3);
  const [blind] = useURLState("blind", false);
  const [hiddenCoordinates] = useURLState<null | Coordinate[]>(
    "hidden",
    null,
    coordinate
  );
  const [showingCoordinates] = useURLState<null | Coordinate[]>(
    "showing",
    null,
    coordinate
  );

  const precalc: Data[][] = [];
  for (let i = 0; i < yP + yN - 1; i++) {
    precalc[i] = [];
    for (let j = 0; j < xP + xN - 1; j++) {
      const row = yP - 1 - i;
      const column = j - xN + 1;
      const number = Math.pow(yAxisFactor, row) * Math.pow(xAxisFactor, column);
      precalc[i][j] = {
        number: number.toString(base).slice(0, 10),
        i: row,
        j: column,
      };
    }
  }

  return (
    <table
      style={{ width: "100vw", textAlign: "center", overflow: "hidden" }}
      className={blind ? "" : "notBlind"}
    >
      <tbody>
        {precalc.map((row, i) => (
          <tr key={i}>
            {row.map((data, j) => (
              <GridElement
                key={j}
                data={data}
                estimations={estimations}
                setEstimation={setEstimation}
                gridLines={gridLines}
                blind={blind}
                hidden={hiddenCoordinates?.some(
                  (box) => box.x === data.j && box.y === data.i
                )}
                startShowing={
                  (data.number === "1" ||
                    showingCoordinates?.some(
                      (box) => box.x === data.j && box.y === data.i
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
}
