import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  hasIcon?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
}

export default function FloatingActionButton({ 
  className = "", 
  hasIcon = false, 
  onClick, 
  children,
  ...props 
}: FloatingActionButtonProps) {
  if (!className.includes("bg-")) className = "bg-secondary-light hover:bg-secondary-color text-secondary-on " + className;

  return (
    <button
      className={
        `btn fixed z-20 right-4 bottom-4 items-center duration-300 shadow-lg font-bold rounded-2xl xl:rounded-3xl p-4 md:p-5 xl:p-6 ${className}` +
        (hasIcon ? " !pl-3 md:!pl-4 xl:!pl-5" : "")
      }
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
