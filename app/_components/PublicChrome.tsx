"use client";

import React from "react";
import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function PublicChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const shouldOffsetHeader = pathname !== "/";

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <NavBar key={pathname} />
      <div
        className={
          shouldOffsetHeader ? "app-shell-content pt-20" : "app-shell-content"
        }
      >
        {children}
      </div>
    </>
  );
}
