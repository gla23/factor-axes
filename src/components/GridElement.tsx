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
  const mainColour = printable ? "rgba(119, 220, 119, 1)" : "#060";
  const mainThickness = printable ? 2 : 1;
  const secondColour = printable ? "#acacacff" : "#404040";
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
      {!printable && estimation && errFraction && !blind && showNumber ? (
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
  const { children } = props;
  const spring = useSpring({ to: { opacity: props.opacity ?? 1 } });
  const [printable] = useURLState("printable", false);
  const string = String(children);
  const number = typeof children === "string" ? parseFloat(children) : children;
  const fancyDecimals = limitRecurringDecimals(props.children);
  // Try up to 100 another time
  // const bigFont = printable && number < 100 && string.length <= 3;
  let ideaString = string.replace(".", "");
  while (ideaString.startsWith("0")) {
    ideaString = ideaString.slice(1);
  }
  const ideaInt = parseInt(ideaString);
  const ideaWithMinimisedRecurring = parseInt(String(ideaInt).slice(0, 4));
  // if (string.startsWith("0.333"))
  //   console.log(
  //     children,
  //     string,
  //     number,
  //     ideaString,
  //     ideaInt,
  //     ideaWithMinimisedRecurring
  //   );
  const fontSize = (() => {
    if (!printable) return undefined;
    if (number > 100) return undefined;
    if (ideaInt === 1) return 30;
    if (ideaInt <= 9) return 22;
    if (ideaInt <= 27) return 19;
    if (ideaString.length === 2) return 16;
  })();
  const opacity = (() => {
    if (fancyDecimals.endsWith("...")) {
      if (fancyDecimals.length <= 9) return 1;
      if (fancyDecimals.length <= 10) return 0.89;
      if (fancyDecimals.length <= 11) return 0.8;
      return 0.4;
    }

    if (ideaWithMinimisedRecurring > 200) return 0.5;
    // if (ideaInt > 1000) return 0.5;
    return 1;
  })();

  return (
    <animated.span
      style={{
        ...spring,
        zIndex: 4,
        position: "relative",
        fontWeight: printable ? "bold" : "initial",
        color: printable ? "black" : "white",
        fontSize,
        opacity: Math.min(props.opacity ?? 1, opacity),
      }}
    >
      {fancyDecimals}
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
        transform: `translate${horizontal ? "Y" : "X"}(50%) translate(-${
          -1 + 2 * thickness
        }px, 1px)`,
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
