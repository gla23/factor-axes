import { Modal } from "content-modal";
import { Estimation, Estimations } from "./MainGrid";
import { StatePair } from "../utils/StatePair";

export function EstimationModal(props: {
  estimationsState: StatePair<Estimations>;
  estimationModalState: StatePair<null | Estimation>;
}) {
  const [estimations, setEstimations] = props.estimationsState;
  const [modalEstimation, setModalEstimation] = props.estimationModalState;
  return (
    <Modal
      isOpen={!!modalEstimation}
      onClose={() => setModalEstimation(null)}
      darkMode={true}
    >
      <div style={{ paddingLeft: "24px" }}>
        <h2>Add estimation</h2>
        Estimate {modalEstimation?.number} as{" "}
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
      </div>
    </Modal>
  );
}
