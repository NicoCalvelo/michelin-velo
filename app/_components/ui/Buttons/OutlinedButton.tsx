import React, { ButtonHTMLAttributes, ReactNode, Ref } from "react";

interface OutlinedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  hasIcon?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children?: ReactNode;
  reference?: Ref<HTMLButtonElement>;
}

export default function OutlinedButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  reference,
  ...props
}: OutlinedButtonProps) {
  if (!className.includes("bg-"))
    className = "text-primary-color border-primary-color hover:bg-primary-color/5 " + className;
  return (
    <button
      className={`btn border transition-all ${className} ` + (hasIcon && " pl-4 ")}
      onClick={onClick}
      disabled={disabled}
      type={type}
      ref={reference}
      {...props}
    >
      {children}
    </button>
  );
}

export function DangerOutlinedButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  reference,
  ...props
}: OutlinedButtonProps) {
  return (
    <OutlinedButton
      className={"border-error-color text-error-color hover:bg-error-color/5 bg-background-color " + className}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      reference={reference}
      {...props}
    >
      {children}
    </OutlinedButton>
  );
}

export function WarningOutlinedButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  reference,
  ...props
}: OutlinedButtonProps) {
  return (
    <OutlinedButton
      className={"border-warning-color text-warning-color hover:bg-warning-color/5 bg-background-color " + className}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      reference={reference}
      {...props}
    >
      {children}
    </OutlinedButton>
  );
}

export function InfoOutlinedButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  reference,
  ...props
}: OutlinedButtonProps) {
  return (
    <OutlinedButton
      className={"border-info-color text-info-color hover:bg-info-color/5 bg-background-color " + className}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      reference={reference}
      {...props}
    >
      {children}
    </OutlinedButton>
  );
}

export function SuccessOutlinedButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  reference,
  ...props
}: OutlinedButtonProps) {
  return (
    <OutlinedButton
      className={"border-success-color text-success-color hover:bg-success-color/5 bg-background-color " + className}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      reference={reference}
      {...props}
    >
      {children}
    </OutlinedButton>
  );
}
