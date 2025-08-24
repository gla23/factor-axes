import { useState } from "react";
import { StatePair } from "../utils/StatePair";

export function NumberInput(props: {
  children: React.ReactNode;
  state: StatePair<number>;
}) {
  const [value, setValue] = props.state;
  const [id] = useState(`check-${String(Math.random())}`);
  return (
    <div>
      <label htmlFor={id} style={{ width: 200, display: "inline-block" }}>
        {props.children}
      </label>
      <input
        id={id}
        style={{ width: 120, height: 24 }}
        onFocus={(e) => e.target.select()}
        type="text"
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
      />
    </div>
  );
}
