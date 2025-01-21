import React from "react";

const CustomConfirm = ({ message }) => {
  return new Promise((resolve, reject) => {
    const confirmBox = document.createElement("div");
    confirmBox.style.position = "fixed";
    confirmBox.style.top = "50%";
    confirmBox.style.left = "50%";
    confirmBox.style.transform = "translate(-50%, -50%)";
    confirmBox.style.padding = "20px";
    confirmBox.style.backgroundColor = "white";
    confirmBox.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    confirmBox.style.zIndex = "1000";
    confirmBox.innerHTML = `
      <p>${message}</p>
      <button id="confirm-yes">예</button>
      <button id="confirm-no">아니오</button>
    `;

    document.body.appendChild(confirmBox);

    const yesButton = document.getElementById("confirm-yes");
    const noButton = document.getElementById("confirm-no");

    yesButton.addEventListener("click", () => {
      resolve(true);
      document.body.removeChild(confirmBox);
    });

    noButton.addEventListener("click", () => {
      resolve(false);
      document.body.removeChild(confirmBox);
    });
  });
};

export default CustomConfirm;
