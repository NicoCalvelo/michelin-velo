import React, { useState, useCallback, useMemo, useRef, useId, SelectHTMLAttributes } from "react";
import { Column } from "../Layout/Columns";
import Spinner from "../Components/Spinner";

export const FormSelectVariant = Object.freeze({
  FILLED: "filled",
  OUTLINED: "outlined",
} as const);

type FormSelectVariantType = (typeof FormSelectVariant)[keyof typeof FormSelectVariant];

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  key?: string;
  "bg-color"?: string;
}

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange" | "title"> {
  className?: string;
  variant?: FormSelectVariantType;
  loading?: boolean;
  options?: SelectOption[];
  allowEmpty?: boolean;
  isMulti?: boolean;
  required?: boolean;
  value?: string | number;
  defaultValue?: string;
  onChange?: (value: string | number) => void;
  title?: string | null;
  placeholder?: string;
  errorMessage?: string;
  supportingText?: string;
  disabled?: boolean;
  messageDisabled?: string;
  id?: string;
}

export default function FormSelect({
  className = "",
  variant = FormSelectVariant.FILLED,
  loading = false,
  options = [],
  allowEmpty = false,
  isMulti = false,
  required = false,
  value,
  defaultValue = "",
  onChange,
  title = null,
  placeholder = "",
  errorMessage = "",
  supportingText = "",
  disabled = false,
  messageDisabled = "",
  id,
  ...props
}: FormSelectProps): React.JSX.Element {
  const [isFocus, setFocus] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState<boolean>(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  // ID unique pour le select
  const generatedId = useId();
  const selectId = id || generatedId;

  // ID pour les éléments associés
  const helperId = useMemo(() => `${selectId}-helper`, [selectId]);

  // Validation des options
  const validOptions = useMemo(() => {
    if (!options || !Array.isArray(options)) {
      console.warn("FormSelect: options should be an array");
      return [];
    }
    return options.filter((option) => option && typeof option === "object");
  }, [options]);

  // Vérification si une valeur est sélectionnée
  const hasSelection = useMemo(() => {
    const currentValue = value !== undefined ? value : defaultValue;
    return currentValue !== undefined && currentValue !== null && currentValue !== "";
  }, [value, defaultValue]);

  // Gestion du focus avec callback optimisé
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocus(true);
      if (props.onFocus) {
        props.onFocus(e);
      }
    },
    [props]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLSelectElement>) => {
      setFocus(false);
      if (props.onBlur) {
        props.onBlur(e);
      }
    },
    [props]
  );

  // Gestion des erreurs personnalisées
  const handleInvalid = useCallback(
    (e: React.InvalidEvent<HTMLSelectElement>) => {
      setHasBeenSubmitted(true);
      if (errorMessage) {
        (e.target as HTMLSelectElement).setCustomValidity(errorMessage);
        setCurrentError(errorMessage);
      }
    },
    [errorMessage]
  );

  // Gestion du changement avec validation
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      // Réinitialiser les erreurs
      setCurrentError(null);
      e.target.setCustomValidity("");

      // Retirer le style placeholder si une valeur est sélectionnée
      if (e.target.classList.contains("!text-gray-400")) {
        e.target.classList.remove("!text-gray-400");
      }

      // Appel du callback parent
      if (onChange) {
        try {
          onChange(e.target.value);
        } catch (error) {
          console.error("Error in FormSelect onChange callback:", error);
          setCurrentError("Erreur lors de la sélection");
        }
      }
    },
    [onChange]
  );

  // Classes CSS avec gestion d'erreur
  const selectClasses = useMemo(() => {
    let classes = `input peer !pr-16 ${getInputStyle(variant, title != null)}`;
    const currentValue = value !== undefined ? value : defaultValue;
    if (placeholder !== "" && !currentValue && !hasSelection) {
      classes += " !text-gray-400";
    }
    if (currentError) {
      classes += " !ring-error-color";
    }
    return `${classes} ${className}`;
  }, [variant, title, placeholder, value, defaultValue, hasSelection, currentError, className]);

  // Message d'aide/erreur à afficher
  const helperMessage = useMemo(() => {
    if (currentError || errorMessage) return currentError || errorMessage;
    return supportingText;
  }, [currentError, errorMessage, supportingText]);

  // Détermine si on affiche un message d'erreur
  const hasError = Boolean(currentError || errorMessage);

  return (
    <Column className={`relative group ${getGroupStyle(variant, disabled)}`}>
      {title && (
        <label
          className={
            `absolute pointer-events-none transition-colors text-xs truncate ${getTitleStyle(variant)} ` +
            (isFocus ? "text-primary-color font-medium" : "text-text-light") +
            (required ? " after:content-['*'] after:text-red-500 after:ml-1" : "")
          }
          htmlFor={selectId}
        >
          {title}
        </label>
      )}

      {!loading && (
        <select
          {...props}
          ref={selectRef}
          id={selectId}
          title={disabled && messageDisabled ? messageDisabled : title || undefined}
          multiple={isMulti}
          required={required}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={selectClasses}
          onInvalid={handleInvalid}
          onChange={handleChange}
          value={value !== undefined ? value : defaultValue}
          aria-describedby={helperMessage ? helperId : undefined}
          aria-invalid={hasError}
          name={props.name}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {allowEmpty && <option value="">-- Aucun --</option>}
          {validOptions.map((option, k) => (
            <option
              key={option.key || `option_${k}`}
              value={option.value}
              disabled={option.disabled}
              className={`text-text-color ${option["bg-color"] || ""}`}
            >
              {option.label}
            </option>
          ))}
        </select>
      )}

      {loading && (
        <div className="w-36 h-12 mt-0.5 border-b border-gray-300" role="status" aria-label="Chargement des options">
          <Spinner className="h-5 w-5 absolute right-2 bottom-2" />
        </div>
      )}

      {/* Icône d'erreur */}
      {!isFocus && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`pointer-events-none text-sm absolute bottom-2 right-8 text-error-color w-5 h-5 transition-opacity ${
            hasError ? "opacity-100" : hasBeenSubmitted ? "opacity-0 peer-invalid:opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            clipRule="evenodd"
          />
        </svg>
      )}

      {/* Icône de dropdown */}
      {!loading && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 absolute right-2 pointer-events-none transition-colors ${
            title ? "bottom-2.5" : "bottom-3"
          } ${disabled ? "text-gray-400" : "text-gray-600"}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      )}

      {/* Message d'aide/erreur */}
      {helperMessage && (
        <small
          id={helperId}
          className={`absolute left-1 -bottom-4 text-xs ${
            hasError ? "text-red-600 flex items-center" : "text-text-light italic"
          }`}
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
        </small>
      )}
    </Column>
  );
}

function getGroupStyle(variant: FormSelectVariantType, disabled: boolean): string {
  if (variant === FormSelectVariant.FILLED) {
    return " bg-background-dark rounded h-fit " + (disabled ? "opacity-75" : "");
  } else if (variant === FormSelectVariant.OUTLINED) {
    return "" + (disabled ? "opacity-75" : "");
  }
  return "";
}

function getTitleStyle(variant: FormSelectVariantType): string {
  if (variant === FormSelectVariant.FILLED) {
    return " top-1.5 left-2 leading-none ";
  } else if (variant === FormSelectVariant.OUTLINED) {
    return " -top-2 left-2 px-2 bg-background-color ";
  }
  return "";
}

function getInputStyle(variant: FormSelectVariantType, hasTitle: boolean): string {
  if (variant === FormSelectVariant.FILLED) {
    return " border-b rounded focus:border pl-3 pr-5 " + (hasTitle ? "pt-5 pb-1" : "py-2 !text-sm");
  } else if (variant === FormSelectVariant.OUTLINED) {
    return " rounded-lg border focus:outline-2 pl-3 pr-5 pt-3 pb-2.5  ";
  }
  return "";
}
