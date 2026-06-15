import React, { ButtonHTMLAttributes, ReactNode } from "react";

interface OutlinedIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disable?: boolean;
  tooltip?: string;
  children?: ReactNode;
}

export default function OutlinedIconButton({ 
  className = "", 
  type = "button", 
  onClick, 
  disable = false, 
  tooltip, 
  children,
  ...props 
}: OutlinedIconButtonProps) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        disabled={disable}
        type={type}
        {...props}
        className={"icon-btn border hover:bg-text-light hover:bg-opacity-10 " + className}
      >
        {children}
      </button>
      {tooltip && (
        <div className="bg-black bg-opacity-60 pointer-events-none opacity-0 group-hover:opacity-100 absolute  z-10 right-5 -top-4 transition-all duration-100 group-hover:delay-1000 rounded px-4 py-1">
          <p className="truncate text-sm text-white font-bold">{tooltip}</p>
        </div>
      )}
    </div>
  );
}
