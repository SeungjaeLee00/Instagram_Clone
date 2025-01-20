import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import io from "socket.io-client";

const socket = io("https://instagram-clone-vbmo.onrender.com");

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App socket={socket} />
  </React.StrictMode>
);
