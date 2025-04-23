import React from "react";

interface ButtonProps {
  buttonType?: "button" | "submit" | "reset";
  state?: boolean;
  buttonText: string;
  size: string;
  onClick?: () => void;
}

const SmallButton: React.FC<ButtonProps> = ({
  buttonType = "submit",
  state = false,
  buttonText,
  size = "",
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      type={buttonType}
      disabled={state}
      className={`bg-gradient rounded-lg text-white ${size} text-xs ${state ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {buttonText}
    </button>
  );
};

export default SmallButton;
