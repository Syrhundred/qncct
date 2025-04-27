import React from "react";

interface ButtonProps {
  buttonType?: "button" | "submit" | "reset";
  state?: boolean;
  buttonText: string;
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  buttonType = "submit",
  className,
  state = false,
  buttonText,
  onClick,
}) => {
  return (
    <button
      type={buttonType}
      disabled={state}
      onClick={onClick}
      className={`w-full bg-gradient rounded-xl text-white text-sm font-semibold p-3 ${className} ${state ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {buttonText}
    </button>
  );
};

export default Button;
