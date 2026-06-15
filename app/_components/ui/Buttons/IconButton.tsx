"use client";

import React, { useState, useCallback } from "react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  tooltip?: string;
  children?: React.ReactNode;
}

export default function IconButton({ className = "", type = "button", onClick, disabled = false, tooltip, children, ...props }: IconButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (tooltip && !disabled) {
      setShowTooltip(true);
    }
  }, [tooltip, disabled]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  if (className === "") className = "bg-transparent hover:text-text-light hover:bg-primary-light/50";

  return (
    <>
      <button
        onClick={onClick}
        disabled={disabled}
        type={type}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`icon-btn ${className}`}
        {...props}
      >
        {children}

        {/* Tooltip */}
        {tooltip && showTooltip && (
          <div className="absolute z-30 px-4 py-1 text-sm font-bold text-white bg-black/75 rounded whitespace-nowrap -top-8 right-0 origin-right">
            {tooltip}
          </div>
        )}
      </button>
    </>
  );
}

export function OutlinedIconButton({ className = "", type = "button", onClick, disabled = false, tooltip, ...props }: IconButtonProps) {
  return (
    <IconButton
      className={`border text-secondary-dark border-secondary-color hover:bg-text-light hover:bg-opacity-10 ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      tooltip={tooltip}
      {...props}
    />
  );
}

export function FilledIconButton({ className = "", type = "button", onClick, disabled = false, tooltip, ...props }: IconButtonProps) {
  return (
    <IconButton
      className={`bg-primary-color hover:bg-opacity-75 text-primary-on ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      tooltip={tooltip}
      {...props}
    />
  );
}

export function DangerFilledIconButton({ className = "", type = "button", onClick, disabled = false, tooltip, ...props }: IconButtonProps) {
  return (
    <IconButton
      className={`bg-error-color hover:bg-error-light text-error-on ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      tooltip={tooltip}
      {...props}
    />
  );
}

export function SuccessFilledIconButton({ className = "", type = "button", onClick, disabled = false, tooltip, ...props }: IconButtonProps) {
  return (
    <IconButton
      className={`bg-success-color hover:bg-success-light text-success-on ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      tooltip={tooltip}
      {...props}
    />
  );
}
