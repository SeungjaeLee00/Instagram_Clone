const CustomConfirm = ({ message }) => {
  return new Promise((resolve, reject) => {
    const confirmBox = document.createElement("div");
    confirmBox.style.position = "fixed";
    confirmBox.style.top = "50%";
    confirmBox.style.left = "50%";
    confirmBox.style.transform = "translate(-50%, -50%)";
    confirmBox.style.padding = "30px";
    confirmBox.style.backgroundColor = "white";
    confirmBox.style.boxShadow = "0 0 15px rgba(0,0,0,0.5)";
    confirmBox.style.zIndex = "1000";
    confirmBox.style.width = "300px";
    confirmBox.style.textAlign = "center";
    confirmBox.style.borderRadius = "8px";
    confirmBox.style.boxSizing = "border-box";
    confirmBox.innerHTML = `
      <p style="font-size: 18px; margin-bottom: 20px;">${message}</p>
      <div style="display: flex; justify-content: center; gap: 20px;">
        <button id="confirm-yes" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">예</button>
        <button id="confirm-no" style="padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">아니오</button>
      </div>
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
