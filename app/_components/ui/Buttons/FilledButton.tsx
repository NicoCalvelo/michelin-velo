import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface FilledButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  hasIcon?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export default function FilledButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  ...props
}: FilledButtonProps) {
  if (!className.includes("bg-"))
    className = "bg-secondary-color text-secondary-on" + className;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
      className={`btn transition-all ${className} ` + (hasIcon ? " !pl-4 " : " ")}
    >
      {children}
    </button>
  );
}

export function SecondaryFilledButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  ...props
}: FilledButtonProps) {
  return (
    <FilledButton
      className={"bg-primary-color text-primary-on" + className}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </FilledButton>
  );
}

export function DangerFilledButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  ...props
}: FilledButtonProps) {
  return (
    <FilledButton
      className={"bg-error-color text-error-on hover:bg-error-color/90 " + className}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </FilledButton>
  );
}

export function WarningFilledButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  ...props
}: FilledButtonProps) {
  return (
    <FilledButton
      className={"bg-warning-color text-warning-on hover:bg-warning-color/90 " + className}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </FilledButton>
  );
}

export function InfoFilledButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  ...props
}: FilledButtonProps) {
  return (
    <FilledButton
      className={"bg-info-color text-info-on hover:bg-info-color/90 " + className}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </FilledButton>
  );
}

export function SuccessFilledButton({
  className = "",
  hasIcon = false,
  type = "button",
  onClick,
  disabled = false,
  children,
  ...props
}: FilledButtonProps) {
  return (
    <FilledButton
      className={"bg-success-color text-success-on " + className}
      hasIcon={hasIcon}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </FilledButton>
  );
}
