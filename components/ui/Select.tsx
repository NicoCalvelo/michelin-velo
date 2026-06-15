"use client";
import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export default function Select({
  label,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <label className="block">
      {label && <span className="text-sm font-medium mb-1 block">{label}</span>}
      <select
        className={`form-control w-full px-4 py-3 border rounded-[var(--radius-sm)] bg-white text-base text-[var(--color-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] border-gray-200 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
