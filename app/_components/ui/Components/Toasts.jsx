"use client";

import { Transition } from "@headlessui/react";
import React, { useState, useEffect } from "react";

// Liste des types de toast et leurs propriétés
const TOAST_TYPES = {
  error: {
    bg: "bg-error-color",
    text: "text-error-on",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
  },
  info: {
    bg: "bg-info-color",
    text: "text-info-on",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
    ),
  },
  success: {
    bg: "bg-green-600",
    text: "text-white",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6"
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  warning: {
    bg: "bg-warning-color",
    text: "text-warning-on",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
    ),
  },
  clipboard: {
    bg: "bg-primary-color",
    text: "text-primary-on",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
        />
      </svg>
    ),
  },
};

let setToastParamsGlobal = null;

export function Toasts() {
  const [toastParams, setToastParams] = useState(null);

  useEffect(() => {
    setToastParamsGlobal = setToastParams;
  }, []);

  useEffect(() => {
    if (!toastParams) return;
    let timeout = setTimeout(
      () => setToastParams(null),
      (toastParams.duration || 6) * 1000
    );
    return () => clearTimeout(timeout);
  }, [toastParams]);

  if (!toastParams) return null;

  const { type, text } = toastParams;
  const { bg, text: textColor, icon } = TOAST_TYPES[type] || TOAST_TYPES.info;

  return (
    <Transition
      show={toastParams !== null}
      as="div"
      enter="transition ease-in duration-300"
      enterFrom="opacity-0 translate-y-full"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-out duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-full"
      className="fixed z-50 left-0 right-0 transition-all duration-300 pointer-events-none bottom-5"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`rounded-xl shadow-xl p-5 w-full max-w-3xl flex pointer-events-auto justify-between font-medium items-center mx-auto ${bg} ${textColor}`}
        role="alert"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <p>{text}</p>
        </div>
        <button
          className="bg-none border-0 focus:outline-none focus:ring-0"
          onClick={() => setToastParams(null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </Transition>
  );
}

// Fonctions utilitaires pour afficher les différents types de toast
export function addToastError(text, duration = 10) {
  setToastParamsGlobal &&
    setToastParamsGlobal({ type: "error", text, duration });
}
export function addToastInfo(text, duration = 6) {
  setToastParamsGlobal &&
    setToastParamsGlobal({ type: "info", text, duration });
}
export function addToastSuccess(text, duration = 6) {
  setToastParamsGlobal &&
    setToastParamsGlobal({ type: "success", text, duration });
}
export function addToastWarning(text, duration = 6) {
  setToastParamsGlobal &&
    setToastParamsGlobal({ type: "warning", text, duration });
}
export function addCopyToClipboardToast(text, duration = 5) {
  setToastParamsGlobal &&
    setToastParamsGlobal({ type: "clipboard", text, duration });
}
