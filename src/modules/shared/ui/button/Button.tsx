import React from "react";

interface ButtonProps {
  buttonType?: "button" | "submit" | "reset";
  state?: boolean;
  buttonText: string;
}

const Button: React.FC<ButtonProps> = ({
  buttonType = "submit",
  state = false,
  buttonText,
}) => {
  return (
    <button
      type={buttonType}
      disabled={state}
      className={`w-full bg-gradient rounded-lg text-white text-sm p-3 ${state ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {buttonText}
    </button>
  );
};

export default Button;
