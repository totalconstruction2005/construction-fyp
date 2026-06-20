import React from "react";

interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  onClick,
}) => {
  const base =
    // smaller on mobile, scales up gradually
    "rounded-full font-semibold cursor-pointer transition duration-300 " +
    "text-xs sm:text-sm md:text-base lg:text-sm " +
    "px-3 py-1.5 sm:px-5 sm:py-1.5 md:px-6 md:py-2";

  const styles =
    variant === "primary"
      ? "bg-lime-300 text-green-900 hover:bg-lime-400"
      : "border border-white/70 text-white bg-white/10 hover:bg-white/20 hover:border-white";

  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {label}
    </button>
  );
};

export default Button;
