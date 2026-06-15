"use client";

import { UserIcon } from "lucide-react";
import React, { useState } from "react";

export function Avatar({ src, alt = "Avatar", fallbackClassName = "", displayName, className = "", width = 40, height = 40, ...props }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const shouldShowFallback = !src || imageError || !imageLoaded;

  return (
    <div
      style={{ width: width, height: height }}
      className={`relative inline-flex items-center bg-gray-100 justify-center overflow-hidden rounded-full ${className}`}
      {...props}
    >
      {shouldShowFallback && (
        <div className={`flex h-full w-full items-center justify-center text-sm font-medium ${fallbackClassName}`}>
          {displayName ? displayName.charAt(0).toUpperCase() : <UserIcon size={24} />}
        </div>
      )}

      {src && !imageError && (
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${imageLoaded ? "" : "hidden"}`}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
        />
      )}
    </div>
  );
}
