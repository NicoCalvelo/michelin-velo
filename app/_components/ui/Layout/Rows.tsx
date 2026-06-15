import React from "react";

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function Row({ className = "", children, ...props }: RowProps) {
  let finalClassName = className;
  if (!className.includes("items-")) {
    finalClassName += " items-center ";
  }
  return (
    <div {...props} className={"flex " + finalClassName}>
      {children}
    </div>
  );
}

export function RowCenter({ className = "", children, ...props }: RowProps) {
  let finalClassName = className;
  if (!className.includes("items-")) {
    finalClassName += " items-center ";
  }
  return (
    <div {...props} className={"flex justify-center " + finalClassName}>
      {children}
    </div>
  );
}

export function RowBetween({ className = "", children, ...props }: RowProps) {
  let finalClassName = className;
  if (!className.includes("items-")) {
    finalClassName += " items-center ";
  }
  return (
    <div {...props} className={"flex w-full justify-between " + finalClassName}>
      {children}
    </div>
  );
}

export function RowEnd({ className = "", children, ...props }: RowProps) {
  let finalClassName = className;
  if (!className.includes("items-")) {
    finalClassName += " items-center ";
  }
  return (
    <div {...props} className={"flex w-full justify-end " + finalClassName}>
      {children}
    </div>
  );
}
