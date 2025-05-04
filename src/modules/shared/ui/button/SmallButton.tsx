interface ButtonProps {
  buttonType?: "button" | "submit" | "reset";
  state?: boolean;
  buttonText: string;
  size: string;
  className?: string;
  onClick?: () => void;
}

const SmallButton: React.FC<ButtonProps> = ({
  buttonType = "submit",
  state = false,
  buttonText,
  size = "",
  className = "",
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      type={buttonType}
      disabled={state}
      className={`rounded-lg text-xs ${size} ${
        state ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {buttonText}
    </button>
  );
};

export default SmallButton;
