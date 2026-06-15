import React from "react";

interface ColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function Column({ className = "", children, ...props }: ColumnProps) {
  return (
    <div {...props} className={`flex flex-col ${className}`}>
      {children}
    </div>
  );
}

export function ColumnCenter({ className = "", children, ...props }: ColumnProps) {
  const finalClassName = className.includes("items-") ? className : `${className} items-center`;
  return (
    <div {...props} className={`flex flex-col text-center justify-center h-full ${finalClassName}`}>
      {children}
    </div>
  );
}

export function ColumnEnd({ className = "", children, ...props }: ColumnProps) {
  const finalClassName = className.includes("items-") ? className : `${className} items-end`;
  return (
    <div {...props} className={`flex flex-col h-full justify-end ${finalClassName}`}>
      {children}
    </div>
  );
}

export function ColumnBetween({ className = "", children, ...props }: ColumnProps) {
  const finalClassName = className.includes("items-") ? className : `${className} items-center`;
  return (
    <div {...props} className={`flex flex-col h-full justify-between ${finalClassName}`}>
      {children}
    </div>
  );
}
