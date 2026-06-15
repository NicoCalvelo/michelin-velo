"use client";
import React from "react";

export function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed bottom-6 right-6 bg-[var(--color-fg)] text-white px-4 py-2 rounded-md shadow-md">
      {children}
    </div>
  );
}

export default Toast;
