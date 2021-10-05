import { useState } from "react";
import { Data, Estimations, Estimation, removeFluff } from "./App";

export const GridElement = (props: {
  data: Data;
  estimations: Estimations;
  setEstimation: (estimation: Estimation) => void;
}) => {
  const [hover, setHover] = useState(false);
  const { estimations, data, setEstimation } = props;
  const est = estimations[data.i]?.[data.j];
  const error = est / parseFloat(data.number);

  return (
    <td
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
      {data.number}
      {est ? (
        <>
          <br />
          <span style={{ marginLeft: 8, fontSize: 12 }}>{est}</span>
          <span style={{ marginLeft: 8, fontSize: 12 }}>
            {removeFluff(error)}
          </span>
        </>
      ) : null}
    </td>
  );
};
