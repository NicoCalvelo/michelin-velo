import React from "react";

interface FilledCardProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function FilledCard({ 
  className = "", 
  onClick, 
  disabled = false, 
  children,
  ...props 
}: FilledCardProps) {
  // on ajoute des styles si la card est désactivée
  if (disabled === true) {
    className += " cursor-default pointer-events-none opacity-50";
  }

  // on ajoute des styles si la card est cliquable
  if (onClick !== undefined && !className.includes("cursor-pointer")) {
    className += " cursor-pointer hover:shadow-lg transition-shadow duration-200";
  }

  return (
    <article {...props} onClick={onClick} className={"card bg-primary-light " + className}>
      {children}
    </article>
  );
}
