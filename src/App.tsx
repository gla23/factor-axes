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
  const gridLinesState = useURLState("grid-lines", true);
  const percentageErrorState = useState(true);
  const xPState = useURLState("xP", 6);
  const xNState = useURLState("xN", 5);
  const yPState = useURLState("yP", 4);
  const yNState = useURLState("yN", 3);
  const xAxisFactorState = useURLState("xAxisFactor", 2);
  const yAxisFactorState = useURLState("yAxisFactor", 3);
  const baseState = useURLState("base", 10);

  const [justGrid, setJustGrid] = useURLState<boolean>("just-grid", false);
  const estimationModalState = useState<null | Estimation>(null);
  const [estimations, setEstimations] = useState<Estimations>(() => {
    const storage = getItem("estimations");
    console.log("from storage", storage);
    return storage ? JSON.parse(storage) : estimationsData;
  });
  const estimationStuff: MainGridProps = {
    estimationModalState: estimationModalState,
    estimationsState: [estimations, setEstimations],
  };

  useEffect(() => {
    setItem("estimations", JSON.stringify(estimations));
  });

  if (justGrid) return <MainGrid {...estimationStuff} />;
  return (
    <div className="App">
      <MainGrid {...estimationStuff} />
      <EstimationModal {...estimationStuff} />
      <br />
      <div className="wrapper">
        <div className="controls">
          <button onClick={() => setEstimations({})}>Clear</button>
          <button onClick={() => setEstimations(estimationsData)}>Reset</button>
          <button onClick={() => setJustGrid(true)}>Just grid</button>
          <Check state={gridLinesState}>Grid lines</Check>
          <Check state={percentageErrorState}>Show percentage error</Check>
          <NumberInput state={xPState}>X-axis positive length</NumberInput>
          <NumberInput state={xNState}>X-axis negative length</NumberInput>
          <NumberInput state={yPState}>Y-axis positive length</NumberInput>
          <NumberInput state={yNState}>Y-axis negative length</NumberInput>
          <NumberInput state={xAxisFactorState}>X-axis factor:</NumberInput>
          <NumberInput state={yAxisFactorState}>Y-axis factor:</NumberInput>
          <NumberInput state={baseState}>Display base:</NumberInput>
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
