"use client";

import Spinner from "../Components/Spinner";
import IconButton from "../Buttons/IconButton";
import FilledButton from "../Buttons/FilledButton";
import { Fragment, useRef, useCallback, ReactNode, ReactElement } from "react";
import OutlinedButton from "../Buttons/OutlinedButton";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";

export const ModalSize = {
  SMALL: "sm",
  MEDIUM: "md",
  LARGE: "lg",
} as const;

export type ModalSizeType = typeof ModalSize[keyof typeof ModalSize];

interface GenericModalProps {
  title?: string;
  loading?: boolean;
  messageLoading?: string;
  showFooter?: boolean;
  showHeader?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  showActionButton?: boolean;
  textActionButton?: string;
  onActionButton?: () => void;
  actionButtonType?: "button" | "submit" | "reset";
  errorMessage?: string | null;
  modalSize?: ModalSizeType;
  className?: string;
  children?: ReactNode;
}

export default function GenericModal({
  title,
  loading = false,
  messageLoading = "Chargement en cours ...",
  showFooter = true,
  showHeader = true,
  open,
  setOpen,
  showActionButton = true,
  textActionButton = "Enregistrer",
  onActionButton,
  actionButtonType = "button",
  errorMessage = null,
  modalSize = ModalSize.MEDIUM,
  className = "",
  children,
}: GenericModalProps): ReactElement {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => setOpen(false), [setOpen]);
  const handleAction = useCallback(() => onActionButton && onActionButton(), [onActionButton]);

  const sizeClasses = {
    [ModalSize.SMALL]: "h-2/3 sm:max-w-2xl sm:rounded-xl",
    [ModalSize.MEDIUM]: "h-4/5 sm:max-w-4xl sm:rounded-2xl",
    [ModalSize.LARGE]: "h-5/6 sm:max-w-7xl sm:rounded-3xl",
  }[modalSize];

  const headerClasses = {
    [ModalSize.SMALL]: "rounded-t-xl",
    [ModalSize.MEDIUM]: "rounded-t-2xl",
    [ModalSize.LARGE]: "rounded-t-3xl",
  }[modalSize];

  const footerClasses = {
    [ModalSize.SMALL]: "px-3 py-2.5 sm:px-4 space-x-1.5 !text-sm rounded-b-xl",
    [ModalSize.MEDIUM]: "px-4 py-3 sm:px-6 space-x-2 rounded-b-2xl",
    [ModalSize.LARGE]: "px-5 py-3 sm:px-6 space-x-2 rounded-b-3xl",
  }[modalSize];

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40" initialFocus={cancelButtonRef} onClose={setOpen}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-75"
          leave="ease-in duration-200"
          leaveFrom="opacity-75"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800 opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-40 overflow-y-auto sm:px-2">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              className={`relative mx-auto max-h-screen flex flex-col transform bg-background-color shadow-xl transition-all sm:mt-6 sm:w-full ${sizeClasses}`}
            >
              {showHeader && (
                <div className={`bg-background-color border-b border-gray-200 flex items-center flex-grow ${headerClasses}`}>
                  <DialogTitle as="h3" className={`text-text-color font-semibold sm:font-bold flex-grow ${modalSize === ModalSize.SMALL ? "p-2 sm:p-3 text-base" : "p-3 sm:p-4 text-lg"}`}>
                    {title}
                  </DialogTitle>
                  <IconButton className="ml-auto mr-4" onClick={handleClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </IconButton>
                </div>
              )}
              <div className={`w-full h-full overflow-auto p-2 pt-4 sm:p-6 ${className}`}>
                {loading ? (
                  <div data-testid="modal_spinner" className="flex flex-col h-full w-full items-center justify-center p-10">
                    <p className="text-center text-text-light">{messageLoading}</p>
                    <Spinner />
                  </div>
                ) : (
                  children
                )}
              </div>
              {showFooter && (
                <div className={`bg-background-color border-t flex justify-end ${footerClasses}`}>
                  {errorMessage && <p className="text-red-500 text-xs sm:text-sm mr-auto my-auto">{errorMessage}</p>}
                  <OutlinedButton className="hidden sm:block" onClick={handleClose} reference={cancelButtonRef}>
                    Fermer
                  </OutlinedButton>
                  {showActionButton && (
                    <FilledButton disabled={loading} type={actionButtonType} onClick={handleAction}>
                      {textActionButton}
                    </FilledButton>
                  )}
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
