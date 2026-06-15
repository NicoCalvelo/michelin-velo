import React from "react";

interface OutlinedCardProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function OutlinedCard({ 
  className = "", 
  onClick, 
  disabled, 
  children,
  ...props 
}: OutlinedCardProps) {
  // on ajoute des styles si la card est désactivée
  if (disabled === true) {
    className += " cursor-default pointer-events-none opacity-50";
  }

  // on ajoute des styles si la card est cliquable
  if (onClick !== undefined && !className.includes("cursor-pointer")) {
    className += " cursor-pointer hover:shadow-inner transition-shadow duration-200";
  }

  return (
    <article {...props} onClick={onClick} className={"card rounded-xl border border-gray-300 " + className}>
      {children}
    </article>
  );
}
