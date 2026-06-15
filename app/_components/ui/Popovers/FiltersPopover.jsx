import React, { useEffect, useState } from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { useLocation } from "react-router-dom";
import Switch from "../Forms/Switch";

/**
 * @name FiltersPopover
 * @param {Array} filters - Liste des filtres sous le format {title: String, active: Boolean}
 * @param {Function} setFilters - Fonction pour mettre à jour les filtres
 * @param {Boolean} fromLeftToRight - Sens de lecture
 * @param {String} buttonText - Texte du bouton
 * @description - Composant permettant d'afficher une liste de filtres dans un Popover et de les activer/désactiver
 */
export default function FiltersPopover({ filters, setFilters, fromLeftToRight = false, buttonText = "Filtrer" }) {
  const location = useLocation();
  return (
    <Popover key={location.pathname} className="relative">
      <PopoverButton
        onClick={(e) => e.stopPropagation()}
        className={"btn space-x-2 group focus:outline-primary-color pl-4 pr-12 hover:bg-primary-light/10 border border-gray-300 !rounded-full"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-focus:text-primary-color transition-colors">
          <path d="M6.17071 18C6.58254 16.8348 7.69378 16 9 16C10.3062 16 11.4175 16.8348 11.8293 18H22V20H11.8293C11.4175 21.1652 10.3062 22 9 22C7.69378 22 6.58254 21.1652 6.17071 20H2V18H6.17071ZM12.1707 11C12.5825 9.83481 13.6938 9 15 9C16.3062 9 17.4175 9.83481 17.8293 11H22V13H17.8293C17.4175 14.1652 16.3062 15 15 15C13.6938 15 12.5825 14.1652 12.1707 13H2V11H12.1707ZM6.17071 4C6.58254 2.83481 7.69378 2 9 2C10.3062 2 11.4175 2.83481 11.8293 4H22V6H11.8293C11.4175 7.16519 10.3062 8 9 8C7.69378 8 6.58254 7.16519 6.17071 6H2V4H6.17071Z"></path>
        </svg>
        <p>{buttonText}</p>
      </PopoverButton>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-90 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-90 opacity-0"
      >
        <PopoverPanel as="ul" className={"absolute z-10 top-12 left-0 bg-background-color rounded shadow-xl overflow-clip w-64"}>
          {filters?.map((filter, k) => (
            <li key={"filter_" + k} className="flex space-x-2 pl-2 pr-4 items-center py-2 border-b">
              <Switch
                fromRightToLeft={!fromLeftToRight}
                label={filter.title}
                defaultActive={filter.active}
                onChange={(selected) => {
                  setFilters([...filters.map((e, k2) => (k == k2 ? { ...e, active: selected } : e))]);
                }}
              />
            </li>
          ))}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
