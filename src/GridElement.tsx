import { useState } from "react";
import { Data, Estimations, Estimation, removeFluff } from "./App";

const lineHeight = 150;
const Line = (props: { horizontal?: boolean; color: string }) => {
  const { horizontal, color } = props;
  return (
    <div
      style={{
        position: "absolute",
        transform: `translate${horizontal ? "Y" : "X"}(-50%)`,
        [horizontal ? "bottom" : "left"]: "50%",
        [horizontal ? "right" : "bottom"]: -lineHeight / 2,
        [horizontal ? "height" : "width"]: "2px",
        [horizontal ? "width" : "height"]: lineHeight,
        backgroundColor: color,
        zIndex: 2,
      }}
    />
  );
};
export const GridElement = (props: {
  data: Data;
  estimations: Estimations;
  setEstimation: (estimation: Estimation) => void;
  gridDimensions: (number | undefined)[];
  gridLines: boolean;
}) => {
  const [hover, setHover] = useState(false);
  const { estimations, data, setEstimation } = props;
  const est = estimations[data.i]?.[data.j];

  const error = est ? est / parseFloat(data.number) : null;
  const [x = 6, xN = 5, y = 4, yN = 3] = props.gridDimensions;

  return (
    <td
      style={{ position: "relative" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`row${data.i} column${data.j} data${data.i}-${data.j}`}
      onClick={() =>
        setEstimation({
          ...data,
          estimation: est ? String(est) : "",
        })
      }
    >
      {props.gridLines &&
        data.i < y &&
        ((data.j % 4 === 0 && <Line color="#060" />) ||
          (data.j % 2 === 0 && <Line color="#404040" />))}
      {props.gridLines &&
        data.j < x - 1 &&
        ((data.i % 4 === 0 && <Line color="#060" horizontal />) ||
          (data.i % 2 === 0 && <Line color="#404040" horizontal />))}
      <span
        style={{
          zIndex: 4,
          position: "relative",
        }}
      >
        {data.number}
        {est && error ? (
          <>
            <br />
            <span style={{ marginLeft: 8, fontSize: 12 }}>{est}</span>
            <span style={{ marginLeft: 8, fontSize: 12 }}>
              {removeFluff(error)}
            </span>
          </>
        ) : null}
      </span>
    </td>
  );
};
