import { useState } from "react";
import { StatePair } from "../utils/StatePair";

export function Check(props: {
  children: React.ReactNode;
  state: StatePair<boolean>;
}) {
  const [checked, setChecked] = props.state;
  const [id] = useState(`check-${String(Math.random())}`);
  return (
    <div style={{ marginLeft: 50 }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked((v) => !v)}
        style={{ verticalAlign: "middle" }}
      />
      <label
        style={{
          verticalAlign: "middle",
          // textAlign: "left",
          marginLeft: 8,
          // marginTop: 8,
          // width: 250,
        }}
        htmlFor={id}
      >
        {props.children}
      </label>
    </div>
  );
}
