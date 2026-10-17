import type { ButtonHTMLAttributes } from "react";
export function Button({
  className = "",
  variant = "pill",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "pill" | "ghost" | "icon" | "plain" }) {
  return (
    <button
      {...props}
      className={`${variant === "pill" ? "pill-button" : variant === "ghost" ? "ghost-button" : variant === "icon" ? "icon-button" : "plain-button"} ${className}`}
    />
  );
}
