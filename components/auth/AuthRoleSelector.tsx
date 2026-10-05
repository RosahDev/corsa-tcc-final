"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type AuthRole = "buyer" | "photographer";

type AuthRoleSelectorProps = {
  role: AuthRole;
  onRoleChange: (role: AuthRole) => void;
};

const options: Array<{ key: AuthRole; label: string }> = [
  { key: "buyer", label: "Cliente" },
  { key: "photographer", label: "Fotógrafo" },
];

export function AuthRoleSelector({ role, onRoleChange }: AuthRoleSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef(new Map<AuthRole, HTMLButtonElement>());
  const [pill, setPill] = useState({ width: 0, x: 0 });

  const updatePill = useCallback(() => {
    const container = containerRef.current;
    const activeButton = buttonRefs.current.get(role);
    if (!container || !activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    setPill({
      width: buttonRect.width,
      x: buttonRect.left - containerRect.left,
    });
  }, [role]);

  useLayoutEffect(() => {
    updatePill();
  }, [updatePill]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(updatePill);
    observer.observe(container);
    window.addEventListener("resize", updatePill);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePill);
    };
  }, [updatePill]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex rounded-full border border-corsa-border bg-corsa-cream p-1"
      role="group"
      aria-label="Tipo de conta"
    >
      <span
        aria-hidden
        className="auth-role-pill pointer-events-none absolute top-1 bottom-1 left-0 rounded-full bg-corsa-wine shadow-sm"
        style={{
          width: pill.width,
          transform: `translateX(${pill.x}px)`,
        }}
      />
      {options.map((option) => {
        const isActive = role === option.key;

        return (
          <button
            key={option.key}
            ref={(node) => {
              if (node) {
                buttonRefs.current.set(option.key, node);
              } else {
                buttonRefs.current.delete(option.key);
              }
            }}
            type="button"
            onClick={() => onRoleChange(option.key)}
            className={cn(
              "relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-500 ease-out",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corsa-wine",
              isActive ? "text-white" : "text-corsa-muted hover:text-corsa-ink",
            )}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
