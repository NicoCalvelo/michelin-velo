import React, { useCallback, useEffect, useState, useMemo } from "react";

// Enum pour les variantes de validation
export const CheckboxValidationState = {
  NONE: "none",
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
} as const;

// Enum pour les tailles
export const CheckboxSize = {
  SM: "sm",
  MD: "md",
  LG: "lg",
} as const;

type CheckboxValidationStateType = (typeof CheckboxValidationState)[keyof typeof CheckboxValidationState];
type CheckboxSizeType = (typeof CheckboxSize)[keyof typeof CheckboxSize];

interface CheckboxProps {
  className?: string;
  defaultSelected?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  readonly?: boolean;
  label?: string;
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  validationState?: CheckboxValidationStateType;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  size?: CheckboxSizeType;
  name?: string;
}

interface ControlledCheckboxProps {
  className?: string;
  selected: boolean;
  setSelected: (value: boolean) => void;
  disabled?: boolean;
  readonly?: boolean;
  label?: string;
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  validationState?: CheckboxValidationStateType;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  size?: CheckboxSizeType;
  name?: string;
}

export default function Checkbox({
  className = "",
  defaultSelected = false,
  onChange,
  disabled = false,
  readonly = false,
  label,
  id,
  ariaLabel,
  ariaDescribedBy,
  validationState = CheckboxValidationState.NONE,
  errorMessage,
  helperText,
  required = false,
  size = CheckboxSize.MD,
  name,
}: CheckboxProps): React.JSX.Element {
  const [selected, setSelected] = useState(defaultSelected);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Messages d'erreur automatiques
  const currentErrorMessage = useMemo(() => {
    if (errorMessage) return errorMessage;
    if (required && hasInteracted && !selected) {
      return "Ce champ est obligatoire";
    }
    return null;
  }, [errorMessage, required, hasInteracted, selected]);

  // État de validation effectif
  const effectiveValidationState = useMemo(() => {
    if (validationState !== CheckboxValidationState.NONE) return validationState;
    if (currentErrorMessage) return CheckboxValidationState.ERROR;
    if (required && hasInteracted && selected) return CheckboxValidationState.SUCCESS;
    return CheckboxValidationState.NONE;
  }, [validationState, currentErrorMessage, required, hasInteracted, selected]);

  const handleChange = useCallback(
    (value: boolean) => {
      try {
        setSelected(value);
        setHasInteracted(true);

        if (onChange && typeof onChange === "function") {
          onChange(value);
        }
      } catch (error) {
        console.error("Error in Checkbox onChange callback:", error);
      }
    },
    [onChange]
  );

  // Synchronisation avec defaultSelected si elle change
  useEffect(() => {
    if (!hasInteracted) {
      setSelected(defaultSelected);
    }
  }, [defaultSelected, hasInteracted]);

  return (
    <ControlledCheckbox
      className={className}
      selected={selected}
      setSelected={handleChange}
      disabled={disabled}
      readonly={readonly}
      label={label}
      id={id}
      ariaLabel={ariaLabel}
      ariaDescribedBy={ariaDescribedBy}
      validationState={effectiveValidationState}
      errorMessage={currentErrorMessage || undefined}
      helperText={helperText}
      required={required}
      size={size}
      name={name}
    />
  );
}

export function ControlledCheckbox({
  className = "",
  selected,
  setSelected,
  disabled = false,
  readonly = false,
  label,
  id,
  ariaLabel,
  ariaDescribedBy,
  validationState = CheckboxValidationState.NONE,
  errorMessage,
  helperText,
  required = false,
  size = CheckboxSize.MD,
  name,
}: ControlledCheckboxProps): React.JSX.Element {
  // Configuration des tailles
  const sizeConfig = useMemo(() => {
    switch (size) {
      case CheckboxSize.SM:
        return { boxSize: "h-4 w-4", padding: "p-1", textSize: "text-xs" };
      case CheckboxSize.LG:
        return { boxSize: "h-8 w-8", padding: "p-2", textSize: "text-base" };
      default:
        return { boxSize: "h-6 w-6", padding: "p-1.5", textSize: "text-sm" };
    }
  }, [size]);

  // Configuration des couleurs selon l'état de validation
  const validationConfig = useMemo(() => {
    switch (validationState) {
      case CheckboxValidationState.ERROR:
        return {
          borderColor: "border-error-color",
          uncheckedBg: "bg-background-dark",
          focusRing: "focus:ring-error-color/75",
          checkedBg: "bg-error-color border-error-dark",
          textColor: "text-error-dark",
        };
      case CheckboxValidationState.SUCCESS:
        return {
          borderColor: "border-success-color",
          uncheckedBg: "bg-background-dark",
          focusRing: "focus:ring-success-color/75",
          checkedBg: "bg-success-color border-success-dark",
          textColor: "text-success-dark",
        };
      case CheckboxValidationState.WARNING:
        return {
          borderColor: "border-warning-color",
          uncheckedBg: "bg-background-dark",
          focusRing: "focus:ring-warning-color/75",
          checkedBg: "bg-warning-color border-warning-dark",
          textColor: "text-warning-dark",
        };
      default:
        return {
          borderColor: "border-text-light",
          uncheckedBg: "bg-background-dark",
          focusRing: "focus:ring-primary-color/75",
          checkedBg: "bg-primary-color text-primary-on border-primary-dark",
          textColor: "text-gray-700",
        };
    }
  }, [validationState]);

  const handleClick = useCallback(() => {
    if (!disabled && !readonly) {
      try {
        setSelected(!selected);
      } catch (error) {
        console.error("Error in ControlledCheckbox setSelected:", error);
      }
    }
  }, [disabled, readonly, selected, setSelected]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!disabled && !readonly && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        try {
          setSelected(!selected);
        } catch (error) {
          console.error("Error in ControlledCheckbox keyboard handler:", error);
        }
      }
    },
    [disabled, readonly, selected, setSelected]
  );

  const checkboxId = useMemo(() => {
    return id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
  }, [id]);

  const helperId = useMemo(() => {
    return `${checkboxId}-helper`;
  }, [checkboxId]);

  const isInteractive = !disabled && !readonly;

  // Validation des props obligatoires
  if (selected === undefined || setSelected === undefined) {
    const errorMsg =
      "For <ControlledCheckbox /> must provide a selected and setSelected value. Otherwise use <Checkbox />";
    console.error(errorMsg);
    return (
      <div className="p-2 bg-error-light/50 border border-error-light rounded">
        <p className="text-error-dark text-sm font-medium">Erreur de configuration:</p>
        <p className="text-error-color text-xs">{errorMsg}</p>
      </div>
    );
  }

  // Validation du type de setSelected
  if (typeof setSelected !== "function") {
    const errorMsg = "setSelected prop must be a function";
    console.error(errorMsg);
    return (
      <div className="p-2 bg-error-light/50 border border-error-light rounded">
        <p className="text-error-dark text-sm font-medium">Erreur de type:</p>
        <p className="text-error-color text-xs">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2">
        <div
          role="checkbox"
          aria-checked={selected}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy || (helperText || errorMessage ? helperId : undefined)}
          aria-required={required}
          aria-invalid={validationState === CheckboxValidationState.ERROR}
          tabIndex={isInteractive ? 0 : -1}
          id={checkboxId}
          data-name={name}
          className={
            `w-fit h-fit rounded-full transition-all duration-100 ${sizeConfig.padding} ` +
            `focus:outline-none focus:ring-2 ${validationConfig.focusRing} focus:ring-offset-1 ` +
            (disabled
              ? "cursor-not-allowed opacity-75"
              : readonly
              ? "cursor-default"
              : "cursor-pointer " + (selected ? "" : "hover:bg-primary-light hover:bg-opacity-20"))
          }
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <div
            className={
              `${className} ${sizeConfig.boxSize} rounded p-0.5 border-2 transition-all duration-100 ease-in-out ` +
              (disabled ? "border-gray-300" : selected ? validationConfig.checkedBg : validationConfig.uncheckedBg)
            }
          >
            {selected && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-full h-full"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className={
              `${sizeConfig.textSize} select-none ` +
              (disabled
                ? "cursor-not-allowed opacity-75 text-gray-500"
                : readonly
                ? "cursor-default text-gray-600"
                : `cursor-pointer ${validationConfig.textColor}`) +
              (required ? " after:content-['*'] after:text-error-color after:ml-1" : "")
            }
            onClick={isInteractive ? handleClick : undefined}
          >
            {label}
          </label>
        )}
      </div>

      {/* Messages d'aide et d'erreur */}
      {(helperText || errorMessage) && (
        <div id={helperId} className="mt-1 ml-8">
          {errorMessage && (
            <p className="text-error-color text-xs flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errorMessage}
            </p>
          )}
          {helperText && !errorMessage && <p className="text-gray-500 text-xs">{helperText}</p>}
        </div>
      )}
    </div>
  );
}
