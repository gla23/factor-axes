import { Modal } from "content-modal";
import { Estimation, Estimations } from "./MainGrid";
import { SimpleStatePair, StatePair } from "../utils/StatePair";
import { numberObject, NumberObject, useURLState } from "../utils/useURLState";
import { Slider } from "./Slider";

export function EstimationModal(props: {
  estimationsState: StatePair<Estimations>;
  estimationModalState: StatePair<null | Estimation>;
}) {
  const [estimations, setEstimations] = props.estimationsState;
  const [modalEstimation, setModalEstimation] = props.estimationModalState;

  const [numberSizes, setNumberSizes] = useURLState<NumberObject>(
    "number-sizes",
    null,
    numberObject,
  );
  const thisNumberString = modalEstimation?.number;
  if (!thisNumberString) return ""; // When modal is closed
  const thisNumber = parseFloat(thisNumberString);
  const sizeState: SimpleStatePair<number | null> = [
    numberSizes ? numberSizes[thisNumber] : null,
    (newSize: number | null) => {
      if (newSize === null) return;
      setNumberSizes({ ...numberSizes, [thisNumber]: newSize });
    },
  ];
  const clear = () => {
    if (!numberSizes) return;
    const newNumberSizes = { ...numberSizes };
    delete newNumberSizes[thisNumber];
    setNumberSizes(newNumberSizes);
    setModalEstimation(null);
  };

  return (
    <Modal
      isOpen={!!modalEstimation}
      onClose={() => setModalEstimation(null)}
      darkMode={true}
    >
      <div style={{ paddingLeft: "24px" }}>
        <h2>Add estimation</h2>
        Estimate {thisNumber} as{" "}
        <input
          type="text"
          autoFocus
          value={modalEstimation?.estimation || ""}
          onChange={(e) =>
            modalEstimation &&
            setModalEstimation({
              ...modalEstimation,
              estimation: e.target.value,
            })
          }
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (!modalEstimation) return;
            setModalEstimation(null);
            const { i, j, estimation: value } = modalEstimation;
            const newEstimations = { ...estimations };
            newEstimations[i] = estimations[i] ? { ...estimations[i] } : [];
            newEstimations[i][j] = parseFloat(value);
            setEstimations(newEstimations);
          }}
        />
        <div style={{ marginTop: 24 }}>
          <label htmlFor="sizeSlider">Number size</label>
        </div>
        <div>
          <Slider
            id="sizeSlider"
            style={{ width: "200px" }}
            state={sizeState as any}
            max={50}
          ></Slider>
        </div>
        <button onClick={clear}>Clear</button>
      </div>
    </Modal>
  );
}
