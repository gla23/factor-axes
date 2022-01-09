import ReactDOM from "react-dom";
import { animated, useTransition } from "react-spring";

interface ModalProps {
  children: React.ReactNode | string;
  title?: React.ReactNode | string;
  close: () => void;
  open?: boolean;
}
export const Modal = (props: ModalProps) => {
  const backgroundTransition = useTransition(props.open, {
    from: { opacity: 0 },
    enter: { opacity: 0.5 },
    leave: { opacity: 0 },
  });
  const modalTransition = useTransition(props.open, {
    from: { opacity: 0, top: -1000 },
    enter: { opacity: 1, top: 50 },
    leave: { opacity: 0, top: -1000 },
  });

  const modalRoot = document.querySelector("#modalRoot");
  if (!modalRoot) return "failed to find modalRoot" as unknown as JSX.Element;
  return ReactDOM.createPortal(
    <>
      {backgroundTransition((style, item) =>
        !item ? null : (
          <animated.div
            style={{
              ...style,
              position: "fixed",
              top: "0px",
              left: "0px",
              width: "100vw",
              height: "100vh",
              backgroundColor: "black",
              zIndex: "100",
            }}
            onClick={props.close}
          />
        )
      )}
      {modalTransition((style, item) =>
        !item ? null : (
          <animated.div
            className="modal"
            style={{
              zIndex: "100",
              position: "fixed",
              ...style,
              maxWidth: "80vw",
              minWidth: "min(80vw, 500px)",
              margin: "auto",
              minHeight: "240px",
              left: "50vw",
              transform: "translateX(-50%)",
              borderRadius: "8px",
            }}
          >
            {props.title && (
              <div
                style={{
                  display: "flex",
                  height: 80,
                  padding: 28,
                  borderBottom: "solid grey 1px",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h1>{props.title}</h1>
                <button style={{ fontSize: 24 }} onClick={props.close}>
                  ×
                </button>
              </div>
            )}
            {props.children}
          </animated.div>
        )
      )}
    </>,
    modalRoot
  );
};
