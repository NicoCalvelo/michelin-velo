import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface TextButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  hasIcon?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export default function TextButton({ className = "", hasIcon = false, type = "button", onClick, disabled = false, children, ...props }: TextButtonProps) {
  if (!className.includes("text-")) className = "text-text-color hover:bg-text-color/10 " + className;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
      className={(hasIcon ? " pl-4 " : " ") + `btn disabled:text-opacity-50 transition-all ${className}`}
    >
      {children}
    </button>
  );
}

export function PrimaryTextButton({ className = "", hasIcon = false, type = "button", onClick, disabled = false, children, ...props }: TextButtonProps) {
  return (
    <TextButton
      className={`text-primary-color hover:bg-primary-light ${className}`}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </TextButton>
  );
}

export function DangerTextButton({ className = "", hasIcon = false, type = "button", onClick, disabled = false, children, ...props }: TextButtonProps) {
  return (
    <TextButton className={`text-error-color hover:bg-error-light ${className}`} hasIcon={hasIcon} type={type} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </TextButton>
  );
}

export function WarningTextButton({ className = "", hasIcon = false, type = "button", onClick, disabled = false, children, ...props }: TextButtonProps) {
  return (
    <TextButton
      className={`text-warning-color hover:bg-warning-light ${className}`}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </TextButton>
  );
}

export function SuccessTextButton({ className = "", hasIcon = false, type = "button", onClick, disabled = false, children, ...props }: TextButtonProps) {
  return (
    <TextButton
      className={`text-success-color hover:bg-success-light ${className}`}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </TextButton>
  );
}

export function InfoTextButton({ className = "", hasIcon = false, type = "button", onClick, disabled = false, children, ...props }: TextButtonProps) {
  return (
    <TextButton className={`text-info-color hover:bg-info-light ${className}`} hasIcon={hasIcon} type={type} onClick={onClick} disabled={disabled} {...props}>
      {children}
    </TextButton>
  );
}
