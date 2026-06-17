import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export default function Dropdown({
  title = "Dropdown",
  className = "",
  showArrow = false,
  ...props
}) {
  return (
    <Menu as="div" className={"relative z-10 " + className}>
      <MenuButton className="font-medium text-sm space-x-3 rounded bg-[var(--yellow-ref)] hover:bg-[var(--yellow-ref)] py-2 px-2 disable:bg-background-dark disabled:opacity-50 cursor-pointer flex items-center">
        <span className="flex items-center">{title}</span>
        {showArrow && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-8 h-8"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </MenuButton>
      <MenuItems
        as="ul"
        className="absolute overflow-clip w-fit rounded bg-background-color shadow-lg right-0 top-10"
      >
        {props.children}
      </MenuItems>
    </Menu>
  );
}

export function DropdownItem({
  className = "",
  disabled = false,
  onClick,
  ...props
}) {
  return (
    <MenuItem
      disabled={disabled}
      as="li"
      onClick={onClick}
      className={
        "px-4 py-1.5 ui-disabled:text-text-light cursor-pointer ui-disabled:bg-background-dark ui-active:text-primary-on ui-active:bg-primary-light " +
        className
      }
    >
      {props.children}
    </MenuItem>
  );
}
