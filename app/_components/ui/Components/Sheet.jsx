"use client";

import React, { Fragment, useRef, useCallback, createContext, useContext, useState } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import IconButton from "../Buttons/IconButton";
import { X } from "lucide-react";

const SheetContext = createContext();

export function Sheet({ children, ...props }) {
  const [open, setOpen] = useState(false);

  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ asChild, children, ...props }) {
  const { setOpen } = useContext(SheetContext);

  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => setOpen(true),
      ...props,
    });
  }

  return (
    <button onClick={() => setOpen(true)} {...props}>
      {children}
    </button>
  );
}

export function SheetContent({ side = "right", className = "", children, ...props }) {
  const { open, setOpen } = useContext(SheetContext);

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  const slideClasses = {
    right: "right-0 h-full",
    left: "left-0 h-full",
    top: "top-0 w-full",
    bottom: "bottom-0 w-full",
  }[side];

  const slideTransition = {
    right: {
      enter: "transform transition ease-in-out duration-300",
      enterFrom: "translate-x-full",
      enterTo: "translate-x-0",
      leave: "transform transition ease-in-out duration-300",
      leaveFrom: "translate-x-0",
      leaveTo: "translate-x-full",
    },
    left: {
      enter: "transform transition ease-in-out duration-300",
      enterFrom: "-translate-x-full",
      enterTo: "translate-x-0",
      leave: "transform transition ease-in-out duration-300",
      leaveFrom: "translate-x-0",
      leaveTo: "-translate-x-full",
    },
  }[side] || {
    enter: "transform transition ease-in-out duration-300",
    enterFrom: "translate-x-full",
    enterTo: "translate-x-0",
    leave: "transform transition ease-in-out duration-300",
    leaveFrom: "translate-x-0",
    leaveTo: "translate-x-full",
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-50"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-50"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black opacity-50" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className={`pointer-events-none fixed ${slideClasses} flex max-w-full ${side === "left" ? "pr-10" : "pl-10"}`}>
              <TransitionChild as={Fragment} {...slideTransition}>
                <DialogPanel className={`pointer-events-auto relative flex ${side === "right" || side === "left" ? "w-screen max-w-md" : "h-screen max-h-md"}`}>
                  <div className={`flex ${side === "right" || side === "left" ? "h-full w-full" : "w-full h-full"} flex-col bg-white shadow-xl ${className}`}>
                    <div className="absolute right-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                      <IconButton tooltip="Fermer" onClick={handleClose}>
                        <X />
                      </IconButton>
                    </div>
                    {children}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function SheetHeader({ className = "", children, ...props }) {
  return (
    <div className={`px-4 py-6 sm:px-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SheetTitle({ className = "", children, ...props }) {
  return (
    <h2 className={`text-lg font-medium text-gray-900 ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function SheetDescription({ className = "", children, ...props }) {
  return (
    <p className={`mt-1 text-sm text-gray-600 ${className}`} {...props}>
      {children}
    </p>
  );
}
