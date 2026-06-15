import React, { useEffect, useState, ReactNode } from "react";
import { Tab, TabGroup, TabList, TabPanels } from "@headlessui/react";
import { useRouter, usePathname } from "next/navigation";

interface TabItem {
  title: string;
  disabled?: boolean;
  icon?: ReactNode;
  hash?: string; // Hash pour la navigation
}

interface TabsPanelProps {
  className?: string;
  vertical?: boolean;
  tabs?: TabItem[];
  onChange?: (index: number) => void;
  formColor?: string;
  children?: ReactNode | ((selectedIndex: number) => ReactNode);
  useHashNavigation?: boolean; // Activer/désactiver la navigation par hash
}

export default function TabsPanel({
  className = "",
  vertical = false,
  tabs = [{ title: "tab 1", disabled: false }],
  onChange,
  useHashNavigation = false,
  ...props
}: TabsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Déterminer l'index sélectionné basé sur le hash de l'URL
  useEffect(() => {
    if (useHashNavigation && typeof window !== "undefined") {
      const currentHash = window.location.hash;
      if (currentHash) {
        const hashValue = currentHash.substring(1); // Enlever le #
        const tabIndex = tabs.findIndex((tab) => tab.hash === hashValue);
        if (tabIndex !== -1) {
          setSelectedIndex(tabIndex);
        }
      } else {
        // Si pas de hash, sélectionner le premier tab non-désactivé
        const firstEnabledIndex = tabs.findIndex((tab) => !tab.disabled);
        if (firstEnabledIndex !== -1) {
          setSelectedIndex(firstEnabledIndex);
        }
      }
    }
  }, [tabs, useHashNavigation]);

  // Gestion du changement de tab
  const handleTabChange = (index: number) => {
    setSelectedIndex(index);

    if (onChange) {
      onChange(index);
    }

    if (useHashNavigation && tabs[index]?.hash && typeof window !== "undefined") {
      // Mettre à jour l'URL avec le hash
      const newUrl = `${pathname}#${tabs[index].hash}`;
      router.replace(newUrl);
    }
  };
  return (
    <TabGroup selectedIndex={selectedIndex} onChange={handleTabChange}>
      <div className={"flex flex-1 w-full " + (vertical ? " " : " flex-col ") + className}>
        <TabList
          className={
            "relative flex w-min bg-background-color p-1 text-sm rounded-xl " +
            (vertical ? " flex-col h-full space-y-2" : " w-full")
          }
        >
          {tabs.map((e, k) => (
            <Tab
              className={({ selected }) =>
                "tab flex w-fit items-center cursor-pointer truncate justify-center py-2 hover:bg-background-dark rounded-lg transition-all duration-150 !outline-none focus:outline-none " +
                (selected ? " font-medium" : "  text-text-light") +
                (e.icon ? " pl-2.5 pr-4" : " px-4")
              }
              key={"tab_" + k}
              disabled={e.disabled}
            >
              {e.icon}
              <p>{e.title}</p>
            </Tab>
          ))}
        </TabList>
        <TabPanels>{typeof props.children === "function" ? props.children(selectedIndex) : props.children}</TabPanels>
      </div>
    </TabGroup>
  );
}
