import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface ElevatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  hasIcon?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disable?: boolean;
  children?: ReactNode;
}

export default function ElevatedButton({ 
  className = "", 
  hasIcon = false, 
  type = "button", 
  onClick, 
  disable = false, 
  children,
  ...props 
}: ElevatedButtonProps) {
  if (!className.includes("bg-")) className = "bg-background-color " + className;
  return (
    <button
      className={`btn shadow hover:shadow-lg text-primary-color ${className} ` + (hasIcon && " pl-4 ")}
      onClick={onClick}
      disabled={disable}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function DangerElevatedButton({ 
  className = "", 
  hasIcon = false, 
  type = "button", 
  onClick, 
  disable = false, 
  children,
  ...props 
}: ElevatedButtonProps) {
  return (
    <ElevatedButton 
      className={`bg-error-color text-error-on ${className}`} 
      hasIcon={hasIcon} 
      type={type} 
      onClick={onClick} 
      disable={disable} 
      {...props}
    >
      {children}
    </ElevatedButton>
  );
}

export function WarningElevatedButton({ 
  className = "", 
  hasIcon = false, 
  type = "button", 
  onClick, 
  disable = false, 
  children,
  ...props 
}: ElevatedButtonProps) {
  return (
    <ElevatedButton 
      className={`bg-warning-color text-warning-on ${className}`} 
      hasIcon={hasIcon} 
      type={type} 
      onClick={onClick} 
      disable={disable} 
      {...props}
    >
      {children}
    </ElevatedButton>
  );
}

export function SuccessElevatedButton({ 
  className = "", 
  hasIcon = false, 
  type = "button", 
  onClick, 
  disable = false, 
  children,
  ...props 
}: ElevatedButtonProps) {
  return (
    <ElevatedButton 
      className={`bg-success-color text-success-on ${className}`} 
      hasIcon={hasIcon} 
      type={type} 
      onClick={onClick} 
      disable={disable} 
      {...props}
    >
      {children}
    </ElevatedButton>
  );
}

export function InfoElevatedButton({ 
  className = "", 
  hasIcon = false, 
  type = "button", 
  onClick, 
  disable = false, 
  children,
  ...props 
}: ElevatedButtonProps) {
  return (
    <ElevatedButton 
      className={`bg-info-color text-info-on ${className}`} 
      hasIcon={hasIcon} 
      type={type} 
      onClick={onClick} 
      disable={disable} 
      {...props}
    >
      {children}
    </ElevatedButton>
  );
}
