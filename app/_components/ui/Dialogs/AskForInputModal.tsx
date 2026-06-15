"use client";

import { RowEnd } from "../Layout/Rows";
import FormInput from "../Forms/FormInput";
import FormSelect from "../Forms/FormSelect";
import FormTextarea from "../Forms/FormTextarea";
import { addToastError } from "../Components/Toasts";
import { Fragment, useEffect, useState, ReactElement } from "react";
import OutlinedButton from "../Buttons/OutlinedButton";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";

interface InputOptions {
  type?: string;
  defaultValue?: string;
  required?: boolean;
  [key: string]: unknown;
}

interface ModalInfo {
  title: string;
  message: string;
  inputOptions: InputOptions;
  inputType: string;
  textCancelButton?: string;
  textConfirmButton?: string;
  onConfirm?: (value: unknown) => void;
  onCancel?: (value: boolean) => void;
  value?: unknown;
}

export default function AskForInputModal(): ReactElement {
  const [value, setValue] = useState<unknown>();
  const [open, setOpen] = useState<boolean>(false);
  const [info, setInfo] = useState<ModalInfo>({
    title: "",
    message: "",
    inputOptions: { type: "input" },
    inputType: AskForInputTypes.INPUT,
  });

  useEffect(() => {
    setModal = (props: ModalInfo) => {
      setInfo(props);
      if (props?.inputOptions?.defaultValue) setValue(props.inputOptions.defaultValue);
      setOpen(true);
    };
  }, []);

  const handleCancel = (): void => {
    setOpen(false);
    info.onCancel?.(false);
    setValue(undefined);
  };

  const handleConfirm = (): void => {
    if (info.inputOptions.required && !value) return addToastError("Veuillez remplir le champ requis.");

    setOpen(false);
    info.onConfirm?.(value);
    setValue(undefined);
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={handleCancel}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-800/50 transition-opacity" />
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
                    <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-opacity-50 sm:mx-0 sm:h-10 sm:w-10 bg-yellow-100">
                      <svg
                        className="h-6 w-6 text-yellow-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        />
                      </svg>
                    </div>
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
                <div className="p-5 mx-auto w-3/4">
                  {info.inputType === AskForInputTypes.INPUT && (
                    <FormInput {...info.inputOptions} setValue={(value) => setValue(value)} />
                  )}
                  {info.inputType === AskForInputTypes.SELECT && (
                    <FormSelect {...info.inputOptions} onChange={(value: string | number) => setValue(value)} />
                  )}
                  {info.inputType === AskForInputTypes.TEXTAREA && (
                    <FormTextarea {...info.inputOptions} setValue={(value) => setValue(value)} />
                  )}
                </div>
              </div>
              <RowEnd className="bg-background-dark px-4 py-3 sm:px-6 space-x-2 mt-5">
                <OutlinedButton className="!border-gray-400" onClick={handleCancel}>
                  {info.textCancelButton}
                </OutlinedButton>
                <button
                  disabled={info.inputOptions.required && value === undefined}
                  onClick={handleConfirm}
                  className="btn bg-yellow-500 text-slate-800"
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

export const AskForInputTypes = {
  INPUT: "input",
  SELECT: "select",
  TEXTAREA: "textarea",
} as const;

export type AskForInputType = (typeof AskForInputTypes)[keyof typeof AskForInputTypes];

let setModal: ((props: ModalInfo) => void) | undefined;

export function showAskForInputModal(
  title: string,
  message: string,
  inputOptions: InputOptions,
  inputType: AskForInputType = AskForInputTypes.INPUT,
  textConfirmButton: string = "Confirmer",
  textCancelButton: string = "Annuler"
): Promise<unknown> {
  if (!setModal) {
    throw new Error(
      "showConfirmationModal is not imported. Make sure to import ConfirmationDialogsProvider.js file in your main index.js or App.js file."
    );
  }

  if (Object.values(AskForInputTypes).find((type) => type === inputType) === undefined)
    throw new Error("Invalid input type provided. Expected one of: " + Object.values(AskForInputTypes).join(", "));

  return new Promise((resolve, reject) => {
    setModal!({
      title: title,
      message: message,
      textCancelButton: textCancelButton,
      textConfirmButton: textConfirmButton,
      inputOptions: inputOptions,
      inputType: inputType,
      onConfirm: resolve,
      onCancel: reject,
    });
  });
}
