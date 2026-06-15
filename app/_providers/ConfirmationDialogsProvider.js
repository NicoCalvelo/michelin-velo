"use client";

import React from "react";
import ReactDOM from "react-dom/client";
import ConfirmationModal from "../Dialogs/ConfirmationModal";
import AskForInputModal from "../Dialogs/AskForInputModal";

// In your Index.js file make an import of this file
// import "./_base/Providers/ConfirmationDialogsProvider";

// Wait for DOM to be ready before creating the root
if (typeof window !== 'undefined') {
  const initializeDialogs = () => {
    const dialogsContainer = document.getElementById("confirmation_dialogs");
    if (dialogsContainer) {
      const dialogs = ReactDOM.createRoot(dialogsContainer);
      dialogs.render(
        <React.StrictMode>
          <ConfirmationModal />
          <AskForInputModal />
        </React.StrictMode>
      );
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDialogs);
  } else {
    initializeDialogs();
  }
}
