"use client";

import React from "react";
import ReactDOM from "react-dom/client";
import { Toasts } from "../Components/Toasts";

// In your Index.js file make an import of this file
// import "./_base/Providers/ToastsProvider";

// Wait for DOM to be ready before creating the root
if (typeof window !== 'undefined') {
  const initializeToasts = () => {
    const toastsContainer = document.getElementById("toasts");
    if (toastsContainer) {
      const toasts = ReactDOM.createRoot(toastsContainer);
      toasts.render(
        <React.StrictMode>
          <Toasts />
        </React.StrictMode>
      );
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeToasts);
  } else {
    initializeToasts();
  }
}
