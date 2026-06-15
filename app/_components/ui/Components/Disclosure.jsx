import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from "@headlessui/react";

export default function DisclosureItem({ className = "", title = "Title of the disclosure", ...props }) {
  return (
    <Disclosure>
      <DisclosureButton
        className={
          "flex w-full justify-between rounded-lg bg-primary-light bg-opacity-10 px-4 py-2 text-left text-sm font-medium text-primary-color hover:bg-opacity-20 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 " +
          className
        }
      >
        <span className="w-5/6">{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="ui-not-open:rotate-180 transform ui-open:rotate-0 transition-transform duration-100 h-5 w-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </DisclosureButton>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <DisclosurePanel className="px-4 pt-2 pb-4 text-sm text-text-color">{props.children}</DisclosurePanel>
      </Transition>
    </Disclosure>
  );
}
