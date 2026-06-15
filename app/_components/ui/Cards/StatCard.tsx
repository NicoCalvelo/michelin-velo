import React from "react";
import { LucideIcon } from "lucide-react";
import FilledCard from "./FilledCard";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "error" | "info" | "purple" | "gradient";
  className?: string;
  layoutVariant?: 1 | 2; // 1 for default, 2 for alternative layout
  onClick?: () => void;
}

const variantClasses = {
  default: "!bg-primary-light text-text-color",
  success: "!bg-success-light text-success-dark",
  warning: "!bg-warning-light text-warning-dark",
  error: "!bg-error-light text-error-on",
  info: "!bg-info-light text-info-dark",
  purple: "!bg-purple-100 text-purple-800",
  gradient: "!bg-linear-to-br from-cyan-200 via-yellow-100 to-purple-300",
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "default",
  className = "",
  layoutVariant = 1,
  onClick,
}: StatCardProps): React.JSX.Element {
  const variantClass = variantClasses[variant];

  if (layoutVariant === 2) {
    return (
      <FilledCard className={`p-6 ${variantClass} ${className} ${onClick ? "cursor-pointer group" : ""}`} onClick={onClick}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={"text-sm font-medium opacity-90 " + (onClick ? "group-hover:underline" : "")}>{title}</h3>
          <Icon size={20} className="text-gray-400" />
        </div>
        <div className="text-2xl font-semibold">{value}</div>
        {description && <p className="text-xs opacity-75 mt-1">{description}</p>}
      </FilledCard>
    );
  }

  // Default layout
  return (
    <FilledCard className={`p-6 ${variantClass} ${className} ${onClick ? "cursor-pointer group" : ""}`} onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={"text-sm font-medium opacity-90 " + (onClick ? "group-hover:underline" : "")}>{title}</h4>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs opacity-75 mt-1">{description}</p>}
    </FilledCard>
  );
}
