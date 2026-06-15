"use client";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "b2b-cta border-0 rounded-[0.4rem] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] shadow-none cursor-pointer";

  const variantClass =
    variant === "primary"
      ? "bg-[var(--yellow-ref)] text-[var(--gray-dark-70)]"
      : variant === "secondary"
        ? "text-white"
        : variant === "link"
          ? "bg-transparent text-[var(--color-primary)] underline-offset-2 no-underline hover:underline p-0 h-auto rounded-none"
          : "bg-transparent text-[var(--color-fg)] hover:bg-[var(--gray-05)]";

  const sizeClass =
    variant === "link"
      ? "text-sm"
      : size === "sm"
        ? "text-sm px-3 py-3"
        : size === "lg"
          ? "text-lg px-3 py-3"
          : "text-base px-3 py-3";

  return (
    <button
      className={`b2b-cta--${variant} ${base} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
