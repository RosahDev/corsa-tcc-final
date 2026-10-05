"use client";

import {
  cloneElement,
  isValidElement,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type MouseEvent,
} from "react";
import type { DeleteActionState } from "@/lib/actions/delete";
import { ConfirmDialog } from "./ConfirmDialog";

type TriggerProps = {
  type?: "button" | "submit" | "reset";
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

type ConfirmDeleteFormProps = {
  action: (
    prevState: DeleteActionState,
    formData: FormData,
  ) => Promise<DeleteActionState>;
  title: string;
  description: string;
  confirmLabel?: string;
  className?: string;
  children: ReactElement<TriggerProps>;
};

export function ConfirmDeleteForm({
  action,
  title,
  description,
  confirmLabel = "Confirmar",
  className,
  children,
}: ConfirmDeleteFormProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    action,
    {} as DeleteActionState,
  );
  const wasPending = useRef(false);

  useEffect(() => {
    if (state.error) {
      setOpen(true);
    }
  }, [state.error]);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state.error]);

  const trigger = isValidElement(children)
    ? cloneElement(children, {
        type: "button",
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          event.preventDefault();
          children.props.onClick?.(event);
          setOpen(true);
        },
      })
    : children;

  return (
    <>
      <form ref={formRef} action={formAction} className={className}>
        {trigger}
      </form>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        pending={pending}
        error={state.error}
        onConfirm={() => {
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
