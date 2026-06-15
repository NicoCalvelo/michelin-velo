"use client";
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | boolean;
};

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="text-xs font-medium mb-2 block uppercase tracking-wider text-gray-600">
          {label}
        </span>
      )}
      <input
        className={`form-control w-full px-4 py-3 border rounded-[var(--radius-sm)] bg-white text-base text-[var(--color-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${error ? "border-red-500" : "border-gray-200"} ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      {error && typeof error === "string" && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </label>
  );
}
