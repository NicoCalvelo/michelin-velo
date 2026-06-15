import React, { ReactNode } from "react";
import { Row } from "../Layout/Rows";

interface SearchBarProps {
  id?: string;
  className?: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  showIcon?: boolean;
  defaultValue?: string;
  caseSensitive?: boolean;
  small?: boolean;
  children?: ReactNode;
}

export default function SearchBar({
  id = "search",
  className = "",
  onChange,
  onSubmit,
  placeholder = "Rechercher...",
  showIcon = true,
  defaultValue = "",
  caseSensitive = false,
  small = false,
  children,
}: SearchBarProps) {
  return (
    <Row
      className={
        "search-bar has-[:focus]:shadow-inner relative transition-colors border border-gray-200 w-full max-w-sm " +
        className +
        (small ? " space-x-4 pl-10 pr-5 rounded-xl" : " space-x-5 pl-12 pr-6 rounded-2xl")
      }
    >
      <input
        type="search"
        placeholder={placeholder}
        id={id}
        autoComplete="off"
        defaultValue={defaultValue}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) {
            onSubmit(caseSensitive ? e.currentTarget.value : e.currentTarget.value.toLowerCase());
          }
        }}
        onChange={(e) => onChange(caseSensitive ? e.target.value : e.target.value.toLowerCase())}
        className={
          "peer bg-transparent !mr-0 h-full flex-grow placeholder-text-light/50 focus:text-text-color placeholder-opacity-50 focus:outline-none" +
          (small ? " text-sm py-2" : " text-base py-4")
        }
      />
      {showIcon && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className={
            "stroke-1.5 peer-focus:stroke-2 transition-all text-gray-400 peer-focus:text-primary-color absolute left-2.5 " + (small ? "size-5" : "size-6")
          }
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      )}
      {children}
    </Row>
  );
}

export function getHighlightedText(text: string, highlight: string): React.ReactNode {
  if (!highlight || !text) return text;
  // Split text on highlight term, include term itself into parts, ignore case
  const regex = new RegExp(`(${highlight})`, "gi");
  return text.split(regex).map((part, i) => (regex.test(part) ? <mark key={i}>{part}</mark> : part));
}
