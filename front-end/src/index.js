import React from "react";
import ReactDOM from "react-dom";
import { Dapp } from "./Dapp";
import "./styles/Dapp.css";

// bootstrap framework for styling
// import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.render(
  <React.StrictMode>
    <Dapp />
  </React.StrictMode>,
  document.getElementById("root")
);
