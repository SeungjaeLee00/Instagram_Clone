import React, { useState, useEffect } from "react";

const CustomAlert = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "10px 20px",
        color: "#fff",
        backgroundColor: type === "success" ? "#4caf50" : "#f44336",
        borderRadius: "5px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
        zIndex: "1000",
      }}
    >
      {message}
    </div>
  );
};

export default CustomAlert;
