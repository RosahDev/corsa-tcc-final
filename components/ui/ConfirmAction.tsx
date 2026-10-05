"use client";

import {
  cloneElement,
  isValidElement,
  useState,
  useTransition,
  type MouseEvent,
  type ReactElement,
} from "react";
import { ConfirmDialog } from "./ConfirmDialog";

type TriggerProps = {
  type?: "button" | "submit" | "reset";
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
};

type ConfirmActionProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  children: ReactElement<TriggerProps>;
};

export function ConfirmAction({
  title,
  description,
  confirmLabel = "Confirmar",
  onConfirm,
  children,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const trigger = isValidElement(children)
    ? cloneElement(children, {
        type: "button",
        disabled: pending || children.props.disabled,
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          children.props.onClick?.(event);
          setOpen(true);
        },
      })
    : children;

  return (
    <>
      {trigger}
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        pending={pending}
        onConfirm={() => {
          startTransition(async () => {
            await onConfirm();
            setOpen(false);
          });
        }}
      />
    </>
  );
}
