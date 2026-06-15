"use client";

import { RowEnd } from "../Layout/Rows";
import OutlinedButton from "../Buttons/OutlinedButton";
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";

// Types pour les différents types de modals
type ModalType = 'danger' | 'warning' | 'info' | 'success';

// Interface pour les informations du modal
interface ModalInfo {
  title: string;
  message: string;
  textCancelButton: string;
  textConfirmButton: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode | null;
  onConfirm: (result?: unknown) => void;
  onCancel: (result?: unknown) => void;
}

// Interface pour les props du modal global
interface ModalProps {
  title: string;
  message: string;
  textCancelButton?: string;
  textConfirmButton?: string;
  bgColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
  onConfirm?: (result?: unknown) => void;
  onCancel?: (result?: unknown) => void;
}

// Interface pour les types de modals prédéfinis
interface ModalTypeConfig {
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
}

// Variable globale pour ouvrir le modal
let setModalGlobal: ((props: ModalProps) => void) | undefined;

export default function ConfirmationModal() {
  const [open, setOpen] = useState<boolean>(false);
  const [info, setInfo] = useState<ModalInfo>({
    title: "",
    message: "",
    textCancelButton: "Annuler",
    textConfirmButton: "Confirmer",
    bgColor: "",
    textColor: "",
    icon: null,
    onConfirm: () => {},
    onCancel: () => {},
  });
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setModalGlobal = (props: ModalProps) => {
      setInfo(prevInfo => ({
        ...prevInfo,
        ...props,
      }));
      setOpen(true);
    };
  }, []);

  const handleClose = (confirmed: boolean): void => {
    setOpen(false);
    if (confirmed) info.onConfirm(true);
    else info.onCancel(false);
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-40" 
        initialFocus={cancelButtonRef} 
        onClose={() => handleClose(false)}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-60"
          leave="ease-in duration-100"
          leaveFrom="opacity-60"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800 opacity-60 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-40 overflow-y-auto">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel className="relative mx-auto transform overflow-hidden rounded-lg bg-background-color text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-opacity-20 sm:mx-0 sm:h-10 sm:w-10">
                    {info.icon}
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h1 className="text-base font-bold leading-6" id="modal-title">
                      {info.title}
                    </h1>
                    <div className="mt-2">
                      <p className="text-sm text-text-light">{info.message}</p>
                    </div>
                  </div>
                </div>
              </div>
              <RowEnd className="bg-background-dark px-4 py-3 sm:px-6 space-x-2 mt-5">
                <OutlinedButton 
                  className="!border-gray-400" 
                  onClick={() => handleClose(false)} 
                  reference={cancelButtonRef}
                >
                  {info.textCancelButton}
                </OutlinedButton>
                <button 
                  onClick={() => handleClose(true)} 
                  className={`btn ${info.bgColor} ${info.textColor}`}
                >
                  {info.textConfirmButton}
                </button>
              </RowEnd>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

const MODAL_TYPES: Record<ModalType, ModalTypeConfig> = {
  success: {
    bgColor: "bg-success-color",
    textColor: "text-success-on",
    icon: (
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-opacity-50 sm:h-10 sm:w-10 bg-success-light">
        <svg className="size-6 text-success-color" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
  },
  danger: {
    bgColor: "bg-error-color",
    textColor: "text-error-on",
    icon: (
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full sm:h-10 sm:w-10 bg-error-light">
        <svg className="size-6 text-error-color" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
    ),
  },
  warning: {
    bgColor: "bg-warning-color",
    textColor: "text-warning-on",
    icon: (
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-opacity-50 sm:h-10 sm:w-10 bg-warning-light">
        <svg className="size-6 text-warning-color" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
    ),
  },
  info: {
    bgColor: "bg-info-color",
    textColor: "text-info-on",
    icon: (
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-opacity-50 sm:h-10 sm:w-10 bg-info-light">
        <svg className="size-6 text-info-color" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </div>
    ),
  },
};

// Fonction utilitaire pour factoriser l'ouverture
function showConfirmationModal(
  type: ModalType, 
  title: string, 
  message: string, 
  textCancelButton: string = "Annuler", 
  textConfirmButton: string = "Confirmer"
): Promise<void> {
  if (!setModalGlobal) {
    throw new Error("showConfirmationModal is not imported. Make sure to import ConfirmationDialogsProvider.js file in your main index.js or App.js file.");
  }

  const { bgColor, textColor, icon } = MODAL_TYPES[type];
  return new Promise((resolve, reject) => {
    setModalGlobal!({
      title,
      message,
      textCancelButton,
      textConfirmButton,
      bgColor,
      textColor,
      icon,
      onConfirm: () => resolve(),
      onCancel: () => reject(),
    });
  });
}

export function showDangerConfirmationModal(
  title: string, 
  message: string, 
  textCancelButton: string = "Annuler", 
  textConfirmButton: string = "Confirmer"
): Promise<void> {
  return showConfirmationModal("danger", title, message, textCancelButton, textConfirmButton);
}

export function showWarningConfirmationModal(
  title: string, 
  message: string, 
  textCancelButton: string = "Annuler", 
  textConfirmButton: string = "Confirmer"
): Promise<void> {
  return showConfirmationModal("warning", title, message, textCancelButton, textConfirmButton);
}

export function showInfoConfirmationModal(
  title: string, 
  message: string, 
  textCancelButton: string = "Annuler", 
  textConfirmButton: string = "Confirmer"
): Promise<void> {
  return showConfirmationModal("info", title, message, textCancelButton, textConfirmButton);
}


export function showSuccessConfirmationModal(
  title: string, 
  message: string,
  textCancelButton: string = "Annuler",
  textConfirmButton: string = "Confirmer"
): Promise<void> {
  return showConfirmationModal("success", title, message, textCancelButton, textConfirmButton);
}