import Spinner from "../Components/Spinner";
import React, { ReactNode, useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { getHighlightedText } from "../Components/SearchBar";

export const SearchSelectVariant = Object.freeze({
  OUTLINED: "outlined",
  FILLED: "filled",
} as const);

export const SearchSelectSize = Object.freeze({
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
} as const);

export type SearchSelectVariantType = (typeof SearchSelectVariant)[keyof typeof SearchSelectVariant];
export type SearchSelectSizeType = (typeof SearchSelectSize)[keyof typeof SearchSelectSize];

interface SearchSelectItem {
  id: string | number;
  label?: string;
  value?: string | number;
  name?: string;
  disabled?: boolean;
  description?: string;
  isCustom?: boolean;
  [key: string]: unknown;
}

interface SearchSelectProps {
  title?: string;
  className?: string;
  items?: SearchSelectItem[];
  isMulti?: boolean;
  allowCustomValue?: boolean;
  selected?: SearchSelectItem | SearchSelectItem[] | string | number | null;
  setSelected?: (value: SearchSelectItem | SearchSelectItem[] | null) => void;
  supportingText?: string;
  errorMessage?: string;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  variant?: SearchSelectVariantType;
  size?: SearchSelectSizeType;
  maxResults?: number;
  minQueryLength?: number;
  debounceMs?: number;
  clearable?: boolean;
  id?: string;
  name?: string;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onQueryChange?: (query: string) => void;
  filterFunction?: (items: SearchSelectItem[], query: string) => SearchSelectItem[];
  displayFunction?: (value: SearchSelectItem | SearchSelectItem[]) => string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  customValuePrefix?: string;
  children?: ReactNode;
}

/*
  itemsExample = [
      { id: 1, label: "Durward Reynolds", disabled: false, description: "Optional description" },
      { id: 2, label: "Kenton Towne", disabled: false },
      { id: 3, label: "Therese Wunsch", disabled: false },
      { id: 4, label: "Benedict Kessler", disabled: true },
      { id: 5, label: "Katelyn Rohan", disabled: false },
    ];
*/

export default function SearchSelect({
  title,
  className = "",
  items = [],
  isMulti = false,
  allowCustomValue = false,
  selected,
  setSelected,
  supportingText,
  errorMessage,
  placeholder = "Rechercher...",
  loading = false,
  disabled = false,
  required = false,
  variant = SearchSelectVariant.OUTLINED,
  size = SearchSelectSize.MEDIUM,
  maxResults = 25,
  minQueryLength = 0,
  debounceMs = 150,
  clearable = true,
  id,
  name,
  onFocus,
  onBlur,
  onQueryChange,
  filterFunction,
  displayFunction,
  noOptionsMessage = "Aucune option trouvée",
  loadingMessage = "Chargement...",
  customValuePrefix = "Ajouter",
  ...props
}: SearchSelectProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ID unique pour le composant
  const selectId = useMemo(() => {
    return id || `search-select-${Math.random().toString(36).substring(2, 11)}`;
  }, [id]);

  // IDs pour les éléments associés
  const helperId = useMemo(() => `${selectId}-helper`, [selectId]);
  const errorId = useMemo(() => `${selectId}-error`, [selectId]);

  // Validation des items
  const validatedItems = useMemo(() => {
    if (!Array.isArray(items)) {
      console.warn("SearchSelect: items should be an array");
      return [];
    }

    return items
      .filter((item) => {
        if (!item || typeof item !== "object") {
          console.warn("SearchSelect: Each item should be an object");
          return false;
        }
        if (item.id === undefined) {
          console.warn('SearchSelect: Each item should have an "id" property');
          return false;
        }
        if (!item.label && !item.value && !item.name) {
          console.warn('SearchSelect: Each item should have a "label", "value", or "name" property');
          return false;
        }
        return true;
      })
      .map((item) => ({
        ...item,
        label: item.label || String(item.value) || item.name,
        disabled: item.disabled || false,
      })) as SearchSelectItem[];
  }, [items]);

  // Debounce de la query
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      if (onQueryChange) {
        onQueryChange(query);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs, onQueryChange]);

  // Reset query quand selected change
  useEffect(() => {
    setQuery("");
    setCurrentError(null);
  }, [selected]);

  // Fonction d'affichage personnalisable
  const getDisplayValue = useCallback(
    (item: SearchSelectItem | SearchSelectItem[] | string | number | null): string => {
      if (loading) return "";
      if (!item) return "";

      if (displayFunction && typeof item === "object" && !Array.isArray(item)) {
        return displayFunction(item as SearchSelectItem);
      }

      if (displayFunction && Array.isArray(item)) {
        return displayFunction(item);
      }

      if (isMulti && Array.isArray(item)) {
        return item.map((i) => i?.label || String(i?.value) || i?.name).join(", ");
      }

      if (typeof item === "string" || typeof item === "number") {
        return String(item);
      }

      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        return item.label || String(item.value) || item.name || "";
      }

      return String(item);
    },
    [loading, isMulti, displayFunction]
  );

  // Normalize primitive values to SearchSelectItem so Combobox always receives the right type
  const normalizedSelected = useMemo((): SearchSelectItem | SearchSelectItem[] | null => {
    if (selected === null || selected === undefined) return null;
    if (Array.isArray(selected)) return selected as SearchSelectItem[];
    if (typeof selected === "object") return selected as SearchSelectItem;
    // primitive string | number → find matching item
    return validatedItems.find((item) => item.id === selected || item.value === selected) ?? null;
  }, [selected, validatedItems]);

  // Ajouter les items sélectionnés si multi
  const allItems = useMemo(() => {
    if (isMulti && Array.isArray(selected) && selected.length > 0) {
      const selectedItems = selected.filter((item: SearchSelectItem) => !validatedItems.find((i) => i.id === item.id));
      return [...validatedItems, ...selectedItems];
    }
    return validatedItems;
  }, [validatedItems, selected, isMulti]);

  const filteredItems = useMemo(() => {
    if (loading) return [];
    if (debouncedQuery.length < minQueryLength) {
      return allItems.slice(0, maxResults);
    }

    if (filterFunction) {
      return filterFunction(allItems, debouncedQuery).slice(0, maxResults);
    }

    const lowerQuery = debouncedQuery.toLowerCase();
    const filtered = allItems.filter((item) => {
      const searchText = `${item.label} ${item.description || ""}`.toLowerCase();
      return searchText.includes(lowerQuery);
    });

    return filtered.slice(0, maxResults);
  }, [allItems, debouncedQuery, minQueryLength, maxResults, loading, filterFunction]);

  // Gestion des événements
  const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    setCurrentError(null);
  }, []);

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) {
        onFocus(event);
      }
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) {
        onBlur(event);
      }
    },
    [onBlur]
  );

  const handleSelectionChange = useCallback(
    (newValue: SearchSelectItem | SearchSelectItem[] | null) => {
      setCurrentError(null);

      // Validation required
      if (required && (!newValue || (Array.isArray(newValue) && newValue.length === 0))) {
        const errorMsg = "Veuillez sélectionner une option.";
        setCurrentError(errorMsg);
      }

      // Appel du callback parent
      if (setSelected) {
        try {
          setSelected(newValue);
        } catch (error) {
          console.error("Error in SearchSelect setSelected callback:", error);
          setCurrentError("Erreur lors de la sélection.");
        }
      }
    },
    [setSelected, required]
  );

  const handleClear = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setQuery("");
      handleSelectionChange(isMulti ? [] : null);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [isMulti, handleSelectionChange]
  );

  // Messages d'aide/erreur
  const helperMessage = useMemo(() => {
    if (currentError || errorMessage) return currentError || errorMessage;
    return supportingText;
  }, [currentError, errorMessage, supportingText]);

  const hasError = Boolean(currentError || errorMessage);

  // Classes CSS basées sur la variante et la taille
  const getInputClasses = useCallback(() => {
    let baseClasses = "peer input !w-full transition-all duration-200";

    // Taille
    switch (size) {
      case SearchSelectSize.SMALL:
        baseClasses += title ? " pt-2.5 pb-1.5 px-2 text-sm" : " py-1.5 px-2 text-sm";
        break;
      case SearchSelectSize.LARGE:
        baseClasses += title ? " pt-4 pb-3 px-3 text-lg" : " py-3 px-3 text-lg";
        break;
      default: // MEDIUM
        baseClasses += title ? " pt-3 pb-2.5 px-2" : " py-2 px-2";
    }

    // Variante
    switch (variant) {
      case SearchSelectVariant.FILLED:
        baseClasses += " !border-0 !border-b-2 !rounded-t-lg !rounded-b-none bg-gray-100";
        if (hasError) {
          baseClasses += " !border-red-500";
        } else if (isFocused) {
          baseClasses += " !border-primary-color";
        } else {
          baseClasses += " !border-gray-400";
        }
        break;
      default: // OUTLINED
        baseClasses += " border rounded-lg";
        if (hasError) {
          baseClasses += " !border-red-500 !ring-red-500";
        } else if (isFocused) {
          baseClasses += " !border-primary-color !ring-primary-color";
        } else {
          baseClasses += " border-gray-300";
        }
    }

    // État disabled
    if (disabled) {
      baseClasses += " opacity-50 cursor-not-allowed";
    }

    return baseClasses;
  }, [variant, size, title, hasError, isFocused, disabled]);

  const getLabelClasses = useCallback(() => {
    let baseClasses = "absolute pointer-events-none transition-all duration-200 text-xs truncate";

    if (variant === SearchSelectVariant.FILLED) {
      baseClasses += " top-1 left-2";
    } else {
      baseClasses += " -top-2 left-2 px-2 bg-background-color";
    }

    if (hasError) {
      baseClasses += " text-red-600";
    } else if (isFocused) {
      baseClasses += " text-primary-color font-medium";
    } else {
      baseClasses += " text-text-light";
    }

    if (required) {
      baseClasses += " after:content-['*'] after:text-red-500 after:ml-1";
    }

    return baseClasses;
  }, [variant, hasError, isFocused, required]);

  // Valeur à afficher pour l'option custom
  const customValueQuery = useMemo(() => {
    if (!allowCustomValue || !query.trim()) return "";
    return isMulti ? query.split(", ").pop()?.trim() : query.trim();
  }, [allowCustomValue, query, isMulti]);

  const shouldShowCustomOption = useMemo(() => {
    return (
      allowCustomValue &&
      customValueQuery &&
      !filteredItems.find((item) => (item.label || "").toLowerCase() === customValueQuery.toLowerCase())
    );
  }, [allowCustomValue, customValueQuery, filteredItems]);

  return (
    <Combobox
      value={normalizedSelected}
      onChange={(v) => handleSelectionChange(v as SearchSelectItem | SearchSelectItem[] | null)}
      multiple={isMulti}
      onClose={() => setQuery("")}
      disabled={disabled}
      name={name}
      {...props}
    >
      <div className={`flex flex-col relative ${disabled ? "opacity-50" : ""} ${className}`}>
        <div className="relative">
          {title && <label className={getLabelClasses()}>{title}</label>}

          <ComboboxInput
            ref={inputRef}
            id={selectId}
            onChange={handleQueryChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            displayValue={getDisplayValue}
            className={getInputClasses()}
            style={{ paddingRight: clearable && selected ? "4rem" : "2.5rem" }}
            aria-describedby={helperMessage ? helperId : undefined}
            aria-invalid={hasError}
            aria-required={required}
            autoComplete="off"
          />

          {/* Bouton clear */}
          {clearable && normalizedSelected && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Effacer la sélection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Bouton dropdown ou spinner */}
          {!loading ? (
            <ComboboxButton className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </ComboboxButton>
          ) : (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Spinner className="w-4 h-4" />
            </div>
          )}

          {/* Icône d'erreur */}
          {hasError && (
            <svg
              className="absolute right-12 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* Message d'aide/erreur */}
        {helperMessage && (
          <div
            id={hasError ? errorId : helperId}
            className={`text-xs mt-1 px-2 ${hasError ? "text-red-600 flex items-center" : "text-gray-600 italic"}`}
            role={hasError ? "alert" : undefined}
            aria-live={hasError ? "polite" : undefined}
          >
            {hasError && (
              <svg className="w-3 h-3 mr-1 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {helperMessage}
          </div>
        )}

        {/* Options dropdown */}
        <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {loading ? (
            <div className="flex items-center justify-center py-4 text-gray-500">
              <Spinner className="w-4 h-4 mr-2" />
              {loadingMessage}
            </div>
          ) : (
            <>
              {filteredItems.length === 0 && !shouldShowCustomOption ? (
                <div className="py-3 px-4 text-gray-500 text-center">
                  {debouncedQuery.length < minQueryLength
                    ? `Tapez au moins ${minQueryLength} caractères pour rechercher`
                    : noOptionsMessage}
                </div>
              ) : (
                <>
                  {filteredItems.map((item, index) => (
                    <ComboboxOption
                      key={`${item.id}-${index}`}
                      value={item}
                      disabled={item.disabled}
                      className={({ active }: { active: boolean; selected: boolean }) =>
                        `relative cursor-pointer select-none py-2 px-4 transition-colors ${
                          active ? "bg-primary-color text-white" : "text-gray-900"
                        } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`
                      }
                    >
                      {({ active, selected }: { active: boolean; selected: boolean }) => (
                        <div className="flex items-start space-x-3">
                          {/* Icône de sélection */}
                          <div className="shrink-0 w-5 h-5 flex items-center justify-center">
                            {selected && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                <path
                                  fillRule="evenodd"
                                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>

                          {/* Contenu de l'option */}
                          <div className="flex-grow min-w-0">
                            <div className={`block truncate ${selected ? "font-semibold" : ""}`}>
                              {getHighlightedText(item.label || "", debouncedQuery)}
                            </div>
                            {item.description && (
                              <div className={`text-sm mt-1 ${active ? "text-gray-200" : "text-gray-500"}`}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </ComboboxOption>
                  ))}

                  {/* Option pour valeur personnalisée */}
                  {shouldShowCustomOption && (
                    <ComboboxOption
                      value={{
                        id: customValueQuery,
                        label: customValueQuery,
                        isCustom: true,
                      }}
                      className={({ active }: { active: boolean }) =>
                        `relative cursor-pointer select-none py-2 px-4 border-t border-gray-200 transition-colors ${
                          active ? "bg-primary-color text-white" : "text-gray-900"
                        }`
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span>
                          {customValuePrefix} &quot;<strong>{customValueQuery}</strong>&quot;
                        </span>
                      </div>
                    </ComboboxOption>
                  )}
                </>
              )}
            </>
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
