import React from "react";
import { Oval } from "react-loader-spinner";

const LoadingSpinner = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Oval color="#00BFFF" height={80} width={80} visible={loading} />{" "}
    </div>
  );
};

export default LoadingSpinner;
