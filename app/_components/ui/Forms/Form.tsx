import React, { ReactNode } from "react";

interface FormProps {
  className?: string;
  id?: string;
  onSubmit?: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  method?: string;
  action?: string;
  children?: ReactNode;
}

export default function Form({ className = "", id, onSubmit, method, action, children }: FormProps) {
  return (
    <form
      id={id}
      className={"" + className}
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(e);
      }}
      method={method}
      action={action}
    >
      {children}
    </form>
  );
}
