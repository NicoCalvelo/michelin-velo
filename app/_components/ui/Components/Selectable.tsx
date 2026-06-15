import React, { useState, ReactNode } from "react";

interface SelectableProps {
  className?: string;
  hasIcon?: boolean;
  defaultSelected?: boolean;
  onChange: (selected: boolean) => void;
  children?: ReactNode | ((selected: boolean) => ReactNode);
}

export default function Selectable({ className = "", hasIcon = false, defaultSelected = false, onChange, ...props }: SelectableProps) {
  const [selected, setSelected] = useState(defaultSelected);

  return (
    <ControlledSelectable
      className={className}
      hasIcon={hasIcon}
      selected={selected}
      setSelected={() => {
        onChange(!selected);
        setSelected(!selected);
      }}
      {...props}
    />
  );
}

interface ControlledSelectableProps {
  className?: string;
  hasIcon?: boolean;
  selected?: boolean;
  setSelected: () => void;
  children?: ReactNode | ((selected: boolean) => ReactNode);
}

export function ControlledSelectable({ className = "", hasIcon = false, selected = false, setSelected, ...props }: ControlledSelectableProps) {
  return (
    <button
      onClick={setSelected}
      className={
        "flex cursor-pointer text-sm items-center space-x-1 sm:space-x-2 transition-all disabled:opacity-75 focus:outline-none px-2.5 sm:px-3 last:!pr-5 py-1 rounded-full " +
        (hasIcon ? " pl-2.5 sm:pl-4" : "") +
        " " +
        className +
        " " +
        (selected
          ? " font-semibold bg-primary-color text-primary-on ease-out duration-150"
          : " hover:bg-gray-100 ease-in duration-75")
      }
    >
      {typeof props.children === "function" ? props.children(selected) : props.children}
    </button>
  );
}
