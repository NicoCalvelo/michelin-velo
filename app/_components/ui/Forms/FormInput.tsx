import React, { useState, useCallback, useMemo, useRef, useId, InputHTMLAttributes } from "react";
import { Column } from "../Layout/Columns";

export const FormInputVariant = Object.freeze({
  FILLED: "filled",
  OUTLINED: "outlined",
} as const);

type FormInputVariantType = (typeof FormInputVariant)[keyof typeof FormInputVariant];

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "title"> {
  variant?: FormInputVariantType;
  minLength?: number;
  maxLength?: number;
  className?: string;
  value?: string | number;
  setValue?: (value: string | number) => void;
  title?: string | null;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  pattern?: string;
  errorMessage?: string;
  supportingText?: string;
  disabled?: boolean;
  messageDisabled?: string;
  id?: string;
  type?: string;
}

export default function FormInput({
  variant = FormInputVariant.FILLED,
  minLength,
  maxLength,
  className = "",
  value,
  setValue,
  title = null,
  required = false,
  defaultValue = "",
  placeholder = "",
  pattern,
  errorMessage = "",
  supportingText = "",
  disabled = false,
  messageDisabled = "",
  id,
  type = "text",
  ...props
}: FormInputProps): React.JSX.Element {
  const [isFocus, setFocus] = useState<boolean>(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxLengthRef = useRef<HTMLElement>(null);

  // ID unique pour l'input
  const generatedId = useId();
  const inputId = id || generatedId;

  // ID pour les éléments associés
  const helperId = useMemo(() => `${inputId}-helper`, [inputId]);

  // Validation du maxLength
  const isOverMaxLength = useMemo(() => {
    if (!maxLength) return false;
    const currentValue = value?.toString() || defaultValue || "";
    return currentValue.length > maxLength;
  }, [maxLength, value, defaultValue]);

  // Gestion du focus avec callback optimisé
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocus(true);
      if (props.onFocus) {
        props.onFocus(e);
      }
    },
    [props]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocus(false);
      if (props.onBlur) {
        props.onBlur(e);
      }
    },
    [props]
  );

  // Gestion du clic avec callback optimisé
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (props.onClick) {
        props.onClick(e);
      }
    },
    [props]
  );

  // Gestion des erreurs personnalisées
  const handleInvalid = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setHasBeenSubmitted(true);
      const target = e.target as HTMLInputElement;
      if (errorMessage) {
        target.setCustomValidity(errorMessage);
        setCurrentError(errorMessage);
      }
    },
    [errorMessage]
  );

  // Logique complexe pour les nombres décimaux
  const handleBeforeInput = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement;
      const inputEvent = e.nativeEvent as InputEvent;

      if (type === "number" && inputEvent.data === "." && !target.value.includes(",")) {
        e.preventDefault();
        target.value = target.value + ".0";
        target.type = "text";
        target.setSelectionRange(target.value.length - 1, target.value.length);
        target.type = "number";
      }
    },
    [type]
  );

  // Gestion du changement avec validation
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const target = e.target;
      const newValue = target.value;

      // Réinitialiser les erreurs
      setCurrentError(null);

      // Validation maxLength
      if (maxLength) {
        if (newValue.length > maxLength) {
          const errorMsg = `Le champ ne peut pas dépasser ${maxLength} caractères.`;
          target.setCustomValidity(errorMsg);
          target.title = errorMsg;
          setCurrentError(errorMsg);

          // Style d'erreur via ref au lieu de DOM
          if (maxLengthRef.current) {
            maxLengthRef.current.classList.add("text-error-color");
          }
          if (inputRef.current) {
            inputRef.current.classList.add("!ring-error-color");
          }
        } else {
          target.setCustomValidity("");
          target.title = "";

          // Retirer le style d'erreur
          if (maxLengthRef.current && maxLengthRef.current.classList.contains("text-error-color")) {
            maxLengthRef.current.classList.remove("text-error-color");
          }
          if (inputRef.current) {
            inputRef.current.classList.remove("!ring-error-color");
          }
        }
      }

      // Appel du callback parent avec la valeur appropriée
      if (setValue) {
        try {
          // Pour les nombres, renvoyer valueAsNumber si c'est un nombre valide
          if (type === "number") {
            const numValue = target.valueAsNumber;
            setValue(isNaN(numValue) ? newValue : numValue);
          } else {
            setValue(newValue);
          }
        } catch (error) {
          console.error("Error in FormInput setValue callback:", error);
        }
      }
    },
    [maxLength, setValue, type]
  );

  // Classes CSS avec gestion d'erreur
  const inputClasses = useMemo(() => {
    let classes = `input !w-full peer text-text-color ${getInputStyle(variant, title !== null)}`;
    if (type === "file") classes += " file-input";
    if (currentError || isOverMaxLength) classes += " !ring-error-color";
    return classes;
  }, [variant, title, type, currentError, isOverMaxLength]);

  // Message d'aide/erreur à afficher
  const helperMessage = useMemo(() => {
    if (currentError || errorMessage) return currentError || errorMessage;
    return supportingText;
  }, [currentError, errorMessage, supportingText]);

  // Détermine si on affiche un message d'erreur
  const hasError = Boolean(currentError || errorMessage || isOverMaxLength);

  return (
    <Column className={`relative w-fit group ${getGroupStyle(variant, disabled)} ${className}`}>
      {title && (
        <label
          className={
            `absolute pointer-events-none transition-colors text-xs truncate ${getTitleStyle(variant)} ` +
            (isFocus ? "text-text-light font-medium" : "text-text-light") +
            (required ? " after:content-['*'] after:text-red-500 after:ml-1" : "")
          }
          htmlFor={inputId}
        >
          {title}
        </label>
      )}
      <input
        {...props}
        ref={inputRef}
        id={inputId}
        minLength={minLength}
        maxLength={maxLength ? maxLength : undefined}
        title={disabled && messageDisabled ? messageDisabled : title || undefined}
        {...(value !== undefined ? { value } : { defaultValue })}
        pattern={pattern}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        className={inputClasses}
        type={type}
        onInvalid={handleInvalid}
        required={required}
        placeholder={placeholder}
        onBeforeInput={handleBeforeInput}
        onChange={handleChange}
        aria-describedby={helperMessage ? helperId : undefined}
        aria-invalid={hasError}
        name={props.name}
      />

      {/* Icône d'erreur */}
      {(!maxLength || !isFocus) && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`pointer-events-none text-sm absolute top-6 right-1 text-error-color w-5 h-5 transition-opacity ${
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

      {/* Compteur de caractères */}
      {maxLength && isFocus && (
        <small
          ref={maxLengthRef}
          className={`absolute font-semibold top-6 right-1.5 transition-colors ${
            isOverMaxLength ? "text-error-color" : "text-text-light"
          }`}
          aria-live="polite"
        >
          {value ? value.toString().length : defaultValue ? defaultValue.length : `max ${maxLength}`}
        </small>
      )}

      {/* Message d'aide/erreur */}
      {helperMessage && (
        <small
          id={helperId}
          className={`px-2 pt-1 text-xs ${hasError ? "text-red-600 flex items-center" : "text-text-light italic"}`}
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

function getGroupStyle(variant: FormInputVariantType, disabled: boolean): string {
  if (variant === FormInputVariant.FILLED) {
    return " bg-background-dark rounded-t-lg" + (disabled ? "opacity-75" : "");
  } else if (variant === FormInputVariant.OUTLINED) {
    return "" + (disabled ? "opacity-75" : "");
  }
  return "";
}

function getTitleStyle(variant: FormInputVariantType): string {
  if (variant === FormInputVariant.FILLED) {
    return " top-1 left-2 leading-none ";
  } else if (variant === FormInputVariant.OUTLINED) {
    return " -top-2.5 left-2 px-2 bg-background-color ";
  }
  return "";
}

function getInputStyle(variant: FormInputVariantType, hasTitle: boolean): string {
  if (variant === FormInputVariant.FILLED) {
    return " focus:border-b pl-3 pr-5  " + (hasTitle ? "pt-5 pb-1" : " py-3");
  } else if (variant === FormInputVariant.OUTLINED) {
    return (
      " rounded-lg border focus:outline-text-light focus:outline-2 pl-3 pr-5 " + (hasTitle ? "pt-3 pb-2.5" : "py-3")
    );
  }
  return "";
}
