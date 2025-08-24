import { useEffect, useState } from "react";
import "./App.css";
import estimationsData from "./estimations.json";
import { getItem, setItem } from "./utils/localStorage";
import { useURLState } from "./utils/useURLState";
import {
  Estimation,
  Estimations,
  MainGrid,
  MainGridProps,
} from "./components/MainGrid";
import { Summary } from "./components/Summary";
import { NumberInput } from "./components/NumberInput";
import { Check } from "./components/Check";
import { EstimationModal } from "./components/EstimationModal";

function App() {
  const [justGrid, setJustGrid] = useURLState<boolean>("just-grid", false);
  const [blind, setBlind] = useURLState("blind", false);
  const gridLinesState = useURLState("grid-lines", true);
  const printingState = useURLState("printable", false);
  const percentageErrorState = useState(true);
  const xPState = useURLState("xP", 6);
  const xNState = useURLState("xN", 5);
  const yPState = useURLState("yP", 4);
  const yNState = useURLState("yN", 3);
  const xAxisFactorState = useURLState("xAxisFactor", 2);
  const yAxisFactorState = useURLState("yAxisFactor", 3);
  const baseState = useURLState("base", 10);

  const estimationModalState = useState<null | Estimation>(null);
  const [estimations, setEstimations] = useState<Estimations>(() => {
    const storage = getItem("estimations");
    return storage ? JSON.parse(storage) : estimationsData;
  });
  const estimationStuff: MainGridProps = {
    estimationModalState: estimationModalState,
    estimationsState: [estimations, setEstimations],
  };

  useEffect(() => {
    setItem("estimations", JSON.stringify(estimations));
  });

  function reset() {
    setEstimations(estimationsData);
    const oldURL = new URL(window.location.href);
    const newURL = new URL(window.location.href);
    newURL.search = "";
    if (oldURL.searchParams.get("blind"))
      newURL.searchParams.set("blind", "true");
    window.history.replaceState({}, document.title, newURL.toString());
  }

  if (justGrid)
    return (
      <div className={`${printingState[0] ? "printable" : ""}`}>
        <MainGrid {...estimationStuff} />
      </div>
    );

  return (
    <div className={`App ${printingState[0] ? "printable" : ""} `}>
      <MainGrid {...estimationStuff} />
      <EstimationModal {...estimationStuff} />
      <br />
      <div className="wrapper">
        <div className="controls">
          <button onClick={() => setEstimations({})}>Clear</button>
          <button onClick={reset}>Reset</button>
          <button onClick={() => setJustGrid(true)}>Just grid</button>
          <div style={{ textAlign: "left", paddingBottom: 8 }}>
            <Check state={[blind, setBlind]}>Hide numbers</Check>
            {/* <Check state={gridLinesState}>Grid lines</Check> */}
            <Check state={percentageErrorState}>Show percentage error</Check>
            <Check state={printingState}>For printing</Check>
          </div>
          <NumberInput state={xPState}>X-axis positive length</NumberInput>
          <NumberInput state={xNState}>X-axis negative length</NumberInput>
          <NumberInput state={yPState}>Y-axis positive length</NumberInput>
          <NumberInput state={yNState}>Y-axis negative length</NumberInput>
          <NumberInput state={xAxisFactorState}>X-axis factor:</NumberInput>
          <NumberInput state={yAxisFactorState}>Y-axis factor:</NumberInput>
          <NumberInput state={baseState}>Display base:</NumberInput>
          <div
            style={{
              textAlign: "left",
              fontSize: 12,
              margin: `${blind ? 12 : 0}px 14px 0px 20px`,
              color: "darkgray",
            }}
          >
            {blind
              ? "Left click to show a number, right click to mask."
              : "Click on a number in the top grid to add an estimation. The right grid shows which numbers can be composed of your factors and the corerresponding error fractions."}
          </div>
        </div>
        <Summary
          estimations={estimations}
          percentageError={percentageErrorState[0]}
        />
      </div>
    </div>
  );
}

export default App;
