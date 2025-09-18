import { StatePair } from "../utils/StatePair";

export function Slider(props: {
  children?: React.ReactNode;
  state: StatePair<number>;
  max: number;
  transform?: string;
}) {
  const { children, state, max, transform } = props;
  const [value, setValue] = state;
  return (
    <>
      <span
        style={{
          display: "inline-block",
          transform,
        }}
      >
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          style={{
            position: "absolute",
            width: max * 9,
          }}
        />
        <span style={{ position: "relative", top: -10, left: 5 }}>
          {children}
        </span>
      </span>
    </>
  );
}
