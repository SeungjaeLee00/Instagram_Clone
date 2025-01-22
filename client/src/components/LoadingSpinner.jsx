import React from "react";
import Loader from "react-loader-spinner";

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
      <Loader type="Oval" color="#00BFFF" height={80} width={80} />
    </div>
  );
};

export default LoadingSpinner;
