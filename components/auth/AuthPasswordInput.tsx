"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type AuthPasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
>;

export const AuthPasswordInput = forwardRef<
  HTMLInputElement,
  AuthPasswordInputProps
>(function AuthPasswordInput({ className, id, ...props }, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        id={id}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-corsa-muted transition-colors hover:text-corsa-ink"
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
      >
        {visible ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});
