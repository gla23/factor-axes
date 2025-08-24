import { useState } from "react";
import { animated, useSpring } from "react-spring";
import { Data, Estimations, Estimation } from "./MainGrid";
import { useURLState } from "../utils/useURLState";
import { removeFluff } from "./Summary";
import { useURLCoordinates } from "./Coordinates";
import { limitRecurringDecimals } from "../utils/limitRecurringDecimals";

interface GridElementProps {
  data: Data;
  estimations: Estimations;
  setEstimation: (estimation: Estimation) => void;
  gridLines: boolean;
  blind: boolean;
}

export const GridElement = (props: GridElementProps) => {
  const { estimations, data, setEstimation, blind } = props;

  const [xP] = useURLState("xP", 6);
  const [xN] = useURLState("xN", 5);
  const [yP] = useURLState("yP", 4);
  const [yN] = useURLState("yN", 3);
  const [hover, setHover] = useState(false);
  const [printable] = useURLState("printable", false);
  const mainColour = printable ? "rgba(97, 194, 97, 1)" : "#060";
  const mainThickness = printable ? 2 : 1;
  const secondColour = printable ? "#ccc" : "#404040";
  const secondThickness = 1;

  const [clicked, toggleClicked] = useURLCoordinates(
    "visible",
    { x: data.i, y: data.j },
    data.number === "1"
  );
  const [masked, toggleMasked] = useURLCoordinates(
    "masked",
    { x: data.i, y: data.j },
    false
  );

  const showNumber = clicked || (!blind && !hover);
  const showMask = masked && !showNumber;
  const showHover = hover && !masked;

  const estimation = estimations?.[data.i]?.[data.j];
  const errFraction = estimation ? estimation / parseFloat(data.number) : null;
  if (!estimations) return null;

  return (
    <td
      style={{ position: "relative" }}
      className={`row${data.i} column${data.j} data${data.i}-${data.j}`}
      onMouseEnter={(e) =>
        e.target.constructor.name !== "HTMLDivElement" && setHover(true)
      }
      onMouseLeave={(e) => setHover(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!blind) return;
        toggleMasked();
        if (clicked) toggleClicked();
      }}
      onClick={(e) => {
        if (e.target.constructor.name === "HTMLDivElement")
          return e.preventDefault();
        if (blind) {
          toggleClicked();
          // Masked should stay so you can unmask again with a click
        }
        if (!blind)
          setEstimation({
            ...data,
            estimation: estimation ? String(estimation) : "",
          });
      }}
    >
      {props.gridLines &&
        data.i < yP &&
        ((data.j % 4 === 0 && (
          <Line color={mainColour} thickness={mainThickness} />
        )) ||
          (data.j % 2 === 0 && (
            <Line color={secondColour} thickness={secondThickness} />
          )))}
      {props.gridLines &&
        data.j < xP - 1 &&
        ((data.i % 4 === 0 && (
          <Line color={mainColour} thickness={mainThickness} horizontal />
        )) ||
          (data.i % 2 === 0 && (
            <Line color={secondColour} thickness={secondThickness} horizontal />
          )))}
      <Text opacity={showNumber ? 1 : showHover ? 0.6 : 0}>{data.number}</Text>
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
      {estimation && errFraction && !blind && showNumber ? (
        <>
          <br />
          <span style={{ marginLeft: 8, fontSize: 12 }}>
            <Text>{estimation}</Text>
          </span>
          <span style={{ marginLeft: 8, fontSize: 12 }}>
            <Text>{removeFluff(errFraction)}</Text>
          </span>
        </>
      ) : null}
    </td>
  );
};

function Text(props: { opacity?: number; children: string | number }) {
  const spring = useSpring({ to: { opacity: props.opacity ?? 1 } });
  const [printable] = useURLState("printable", false);
  return (
    <animated.span
      style={{
        ...spring,
        zIndex: 4,
        position: "relative",
        fontWeight: printable ? "bold" : "initial",
        color: printable ? "black" : "white",
        // font:
      }}
    >
      {limitRecurringDecimals(props.children)}
    </animated.span>
  );
}

const lineHeight = 350;

const Line = (props: {
  horizontal?: boolean;
  color: string;
  thickness: number;
}) => {
  const { horizontal, color, thickness } = props;
  return (
    <div
      className="line"
      style={{
        position: "absolute",
        transform: `translate${
          horizontal ? "Y" : "X"
        }(50%) translate(-2px, 1px)`,
        [horizontal ? "bottom" : "left"]: "50%",
        [horizontal ? "right" : "bottom"]: -lineHeight / 2,
        [horizontal ? "height" : "width"]: "0px",
        [horizontal ? "width" : "height"]: lineHeight,
        backgroundColor: color,
        border: `${thickness}px solid ${color}`,
        zIndex: 2,
        WebkitPrintColorAdjust: "exact",
      }}
    />
  );
};
