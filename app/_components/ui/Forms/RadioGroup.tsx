import React, { ReactNode, useState, useCallback, useMemo, useRef } from "react";
import { Label, Radio, RadioGroup } from "@headlessui/react";

export const RadioGroupVariant = Object.freeze({
  STANDARD: "standard",
  OUTLINED: "outlined",
  FILLED: "filled",
} as const);

export const RadioGroupSize = Object.freeze({
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
} as const);

export type RadioGroupVariantType = typeof RadioGroupVariant[keyof typeof RadioGroupVariant];
export type RadioGroupSizeType = typeof RadioGroupSize[keyof typeof RadioGroupSize];

interface RadioOption {
  value: string | number | boolean;
  label?: string;
  text?: string;
  disabled?: boolean;
  description?: string;
  [key: string]: unknown;
}

interface RadioGroupPanelProps {
  className?: string;
  title?: string;
  value?: string | number | boolean | null;
  setValue?: (value: string | number | boolean | null) => void;
  options?: RadioOption[];
  verticalDisplay?: boolean;
  variant?: RadioGroupVariantType;
  size?: RadioGroupSizeType;
  disabled?: boolean;
  required?: boolean;
  errorMessage?: string;
  supportingText?: string;
  name?: string;
  id?: string;
  allowDeselect?: boolean;
  children?: ReactNode;
}

export default function RadioGroupPanel({ 
  className = "",
  title,
  value,
  setValue,
  options = [],
  verticalDisplay = false,
  variant = RadioGroupVariant.STANDARD,
  size = RadioGroupSize.MEDIUM,
  disabled = false,
  required = false,
  errorMessage,
  supportingText,
  name,
  id,
  allowDeselect = false,
  ...props 
}: RadioGroupPanelProps) {
  const [currentError, setCurrentError] = useState<string | null>(null);
  const radioGroupRef = useRef<HTMLDivElement>(null);

  // ID unique pour le groupe
  const groupId = useMemo(() => {
    return id || `radio-group-${Math.random().toString(36).substring(2, 11)}`;
  }, [id]);

  // ID pour les éléments associés
  const helperId = useMemo(() => `${groupId}-helper`, [groupId]);
  const errorId = useMemo(() => `${groupId}-error`, [groupId]);

  // Validation des options
  const validatedOptions = useMemo(() => {
    if (!Array.isArray(options)) {
      console.warn('RadioGroupPanel: options should be an array');
      return [];
    }

    return options.filter(option => {
      if (!option || typeof option !== 'object') {
        console.warn('RadioGroupPanel: Each option should be an object');
        return false;
      }
      if (option.value === undefined) {
        console.warn('RadioGroupPanel: Each option should have a "value" property');
        return false;
      }
      if (!option.label && !option.text) {
        console.warn('RadioGroupPanel: Each option should have a "label" or "text" property');
        return false;
      }
      return true;
    }).map(option => ({
      ...option,
      label: option.label || option.text,
      disabled: option.disabled || false,
    }));
  }, [options]);

  // Gestion du changement avec validation
  const handleChange = useCallback((newValue: string | number | boolean | null) => {
    // Reset des erreurs
    setCurrentError(null);

    // Si allowDeselect et que la même valeur est sélectionnée, désélectionner
    if (allowDeselect && newValue === value) {
      newValue = null;
    }

    // Validation required
    if (required && !newValue) {
      const errorMsg = "Veuillez sélectionner une option.";
      setCurrentError(errorMsg);
    }

    // Appel du callback parent
    if (setValue) {
      try {
        setValue(newValue);
      } catch (error) {
        console.error('Error in RadioGroupPanel setValue callback:', error);
        setCurrentError("Erreur lors de la sélection.");
      }
    }
  }, [setValue, value, required, allowDeselect]);

  // Message d'aide/erreur à afficher
  const helperMessage = useMemo(() => {
    if (currentError || errorMessage) return currentError || errorMessage;
    return supportingText;
  }, [currentError, errorMessage, supportingText]);

  // Détermine si on affiche un message d'erreur
  const hasError = Boolean(currentError || errorMessage);

  // Classes CSS basées sur la variante et la taille
  const getContainerClasses = useCallback(() => {
    let classes = "space-y-2";
    if (disabled) classes += " opacity-50 pointer-events-none";
    if (className) classes += ` ${className}`;
    return classes;
  }, [disabled, className]);

  const getOptionClasses = useCallback((option: RadioOption, checked: boolean) => {
    let baseClasses = "relative flex items-center cursor-pointer transition-all duration-200";
    
    // Taille
    switch (size) {
      case RadioGroupSize.SMALL:
        baseClasses += " px-3 py-1.5 text-sm";
        break;
      case RadioGroupSize.LARGE:
        baseClasses += " px-5 py-3 text-lg";
        break;
      default: // MEDIUM
        baseClasses += " px-4 py-2";
    }

    // Variante
    switch (variant) {
      case RadioGroupVariant.OUTLINED:
        baseClasses += " border rounded-lg";
        if (checked) {
          baseClasses += " border-primary-color bg-primary-color bg-opacity-10";
        } else {
          baseClasses += " border-gray-300 hover:border-primary-color";
        }
        break;
      case RadioGroupVariant.FILLED:
        baseClasses += " rounded-lg";
        if (checked) {
          baseClasses += " bg-primary-color bg-opacity-20";
        } else {
          baseClasses += " bg-gray-100 hover:bg-gray-200";
        }
        break;
      default: // STANDARD
        if (checked) {
          baseClasses += " font-semibold";
        }
        baseClasses += " hover:bg-gray-50 hover:bg-opacity-10 rounded-lg";
    }

    // État disabled
    if (option.disabled || disabled) {
      baseClasses += " opacity-50 cursor-not-allowed";
    }

    return baseClasses;
  }, [variant, size, disabled]);

  return (
    <div className={getContainerClasses()}>
      <RadioGroup 
        ref={radioGroupRef}
        id={groupId}
        name={name}
        className="space-y-1"
        value={value} 
        onChange={handleChange}
        disabled={disabled}
        aria-describedby={helperMessage ? helperId : undefined}
        aria-invalid={hasError}
        aria-required={required}
        {...props}
      >
        {title && (
          <Label 
            className={`font-semibold border-b pb-1 block mb-2 ${
              hasError ? "text-red-600" : ""
            } ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}`}
          >
            {title}
          </Label>
        )}
        <div className={verticalDisplay ? "flex flex-col space-y-2" : "flex flex-wrap gap-2"}>
          {validatedOptions.length === 0 ? (
            <div className="text-gray-500 italic py-2">Aucune option disponible</div>
          ) : (
            validatedOptions.map((option, index) => (
              <Radio
                key={String(option.value) ?? index}
                className={({ checked }: { checked: boolean }) => getOptionClasses(option, checked)}
                value={option.value}
                disabled={option.disabled || disabled}
                aria-describedby={option.description ? `${groupId}-${index}-desc` : undefined}
              >
                {({ checked, focus }: { checked: boolean; focus: boolean }) => (
                  <div className="flex items-center w-full space-x-3">
                    {/* Indicateur radio personnalisé */}
                    <div className={`
                      shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-200
                      ${checked 
                        ? "border-primary-color bg-primary-color" 
                        : "border-gray-400"
                      }
                      ${focus ? "ring-2 ring-primary-color ring-opacity-50" : ""}
                      ${option.disabled || disabled ? "opacity-50" : ""}
                    `}>
                      {checked && (
                        <div className="w-full h-full rounded-full bg-white border-2 border-primary-color scale-50" />
                      )}
                    </div>

                    {/* Contenu de l'option */}
                    <div className="flex-grow min-w-0">
                      <p className={`truncate ${checked ? "font-semibold" : ""}`}>
                        {option.label}
                      </p>
                      {option.description && (
                        <p 
                          id={`${groupId}-${index}-desc`}
                          className="text-sm text-gray-600 mt-1"
                        >
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Radio>
            ))
          )}
        </div>
      </RadioGroup>

      {/* Message d'aide/erreur */}
      {helperMessage && (
        <div 
          id={hasError ? errorId : helperId}
          className={`text-xs mt-1 ${
            hasError 
              ? "text-red-600 flex items-center" 
              : "text-gray-600 italic"
          }`}
          role={hasError ? "alert" : undefined}
          aria-live={hasError ? "polite" : undefined}
        >
          {hasError && (
            <svg className="w-3 h-3 mr-1 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {helperMessage}
        </div>
      )}
    </div>
  );
}
