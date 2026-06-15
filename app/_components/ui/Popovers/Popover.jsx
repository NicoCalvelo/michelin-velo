"use client";
import React, { useRef, useState } from "react";
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";

export default function PopOverMenu({
  className = "",
  buttonClassName = "",
  ...props
}) {
  if (!className.includes("bg-")) className += " bg-background-color";
  if (!className.includes("z-")) className += " z-10";
  if (!className.includes("shadow-")) className += " shadow-xl";

  const buttonRef = useRef(null);
  const [alignRight, setAlignRight] = useState(false);

  function handleButtonClick(e) {
    e.stopPropagation();
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setAlignRight(rect.left > window.innerWidth / 2);
    }
  }

  return (
    <Popover className="relative">
      <PopoverButton
        ref={buttonRef}
        onClick={handleButtonClick}
        className={
          "btn space-x-2 focus:outline-secondary-dark text-secondary-color font-normal !px-4 hover:underline " +
          buttonClassName
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-6"
        >
          <path
            fillRule="evenodd"
            d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
            clipRule="evenodd"
          />
        </svg>
      </PopoverButton>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-90 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-90 opacity-0"
      >
        <PopoverPanel
          as="ul"
          className={
            "absolute z-20 translate-y-2 bg-background-color rounded shadow overflow-clip " +
            (alignRight ? "right-0 origin-top-right" : "left-0 origin-top-left") +
            " " + className
          }
        >
          {props.children}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
