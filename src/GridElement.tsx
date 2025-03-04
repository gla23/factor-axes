import { useState } from "react";
import { animated, useSpring } from "react-spring";
import { Data, Estimations, Estimation, removeFluff } from "./App";

const lineHeight = 350;
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

interface GridElementProps {
  data: Data;
  estimations: Estimations;
  setEstimation: (estimation: Estimation) => void;
  gridDimensions: (number | undefined)[];
  gridLines: boolean;
  blind: boolean;
  hidden?: boolean;
  startShowing: boolean;
}

export const GridElement = (props: GridElementProps) => {
  const { estimations, data, setEstimation, blind, hidden, startShowing } =
    props;
  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(startShowing);
  const est = estimations[data.i]?.[data.j];

  const error = est ? est / parseFloat(data.number) : null;
  const [x = 6, xN = 5, y = 4, yN = 3] = props.gridDimensions;

  const showNumber = !blind || clicked;
  const showMask = hidden && !(showNumber || hover);

  return (
    <td
      style={{ position: "relative" }}
      className={`row${data.i} column${data.j} data${data.i}-${data.j}`}
      onMouseEnter={(e) =>
        e.target.constructor.name !== "HTMLDivElement" && setHover(true)
      }
      onMouseLeave={(e) => setHover(false)}
      onClick={(e) => {
        if (e.target.constructor.name === "HTMLDivElement")
          return e.preventDefault();
        setClicked((c) => !c);
        return setEstimation({
          ...data,
          estimation: est ? String(est) : "",
        });
      }}
    >
      {props.gridLines &&
        data.i < y &&
        ((data.j % 4 === 0 && <Line color="#060" />) ||
          (data.j % 2 === 0 && <Line color="#404040" />))}
      {props.gridLines &&
        data.j < x - 1 &&
        ((data.i % 4 === 0 && <Line color="#060" horizontal />) ||
          (data.i % 2 === 0 && <Line color="#404040" horizontal />))}
      <Text opacity={showNumber ? 1 : hover ? 0.6 : 0}>{data.number}</Text>
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 4,
        }}
      >
        <Text opacity={showMask ? 1 : 0}>???</Text>
      </span>
      {est && error && !blind && showNumber ? (
        <>
          <br />
          <span style={{ marginLeft: 8, fontSize: 12 }}>
            <Text>{est}</Text>
          </span>
          <span style={{ marginLeft: 8, fontSize: 12 }}>
            <Text>{removeFluff(error)}</Text>
          </span>
        </>
      ) : null}
    </td>
  );
};

function Text(props: { opacity?: number; children: string | number }) {
  const spring = useSpring({ to: { opacity: props.opacity ?? 1 } });
  return (
    <animated.span
      style={{
        ...spring,
        zIndex: 4,
        position: "relative",
      }}
    >
      {props.children}
    </animated.span>
  );
}
