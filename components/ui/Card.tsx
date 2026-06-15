"use client";
import React from "react";

export default function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border rounded-[var(--radius-md)] shadow-sm overflow-hidden ${className} p-4`}
    >
      {children}
    </div>
  );
}
