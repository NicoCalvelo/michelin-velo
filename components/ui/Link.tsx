"use client";
import React from "react";
import NextLink from "next/link";

export default function Link({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NextLink
      href={href}
      className={`text-[var(--color-primary)] no-underline hover:underline ${className}`}
    >
      {children}
    </NextLink>
  );
}
