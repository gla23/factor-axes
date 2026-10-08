import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { migrateLegacyVisibility } from "./utils/valueList";

const migratedSearch = migrateLegacyVisibility(window.location.search);
if (migratedSearch !== null) {
  const url = new URL(window.location.href);
  url.search = migratedSearch;
  window.history.replaceState({}, "", url.toString());
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
