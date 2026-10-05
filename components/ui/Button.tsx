import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-corsa-wine text-white shadow-sm hover:bg-corsa-wine-hover active:bg-corsa-wine-hover focus-visible:ring-2 focus-visible:ring-corsa-wine focus-visible:ring-offset-2",
  secondary:
    "bg-corsa-sand text-corsa-wine hover:bg-corsa-sand-dark active:bg-corsa-sand-dark focus-visible:ring-2 focus-visible:ring-corsa-wine focus-visible:ring-offset-2",
  outline:
    "border border-corsa-border bg-white text-corsa-ink hover:bg-corsa-cream active:bg-corsa-rose focus-visible:ring-2 focus-visible:ring-corsa-wine focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-corsa-ink hover:bg-corsa-rose active:bg-corsa-rose focus-visible:ring-2 focus-visible:ring-corsa-wine focus-visible:ring-offset-2",
  wineGhost:
    "bg-transparent text-corsa-wine hover:bg-corsa-rose active:bg-corsa-rose focus-visible:ring-2 focus-visible:ring-corsa-wine focus-visible:ring-offset-2",
  danger:
    "border border-corsa-border bg-white text-corsa-wine-muted hover:border-corsa-wine/30 hover:bg-corsa-rose hover:text-corsa-wine focus-visible:ring-2 focus-visible:ring-corsa-wine focus-visible:ring-offset-2",
  outlineLight:
    "border border-white/40 bg-transparent text-white hover:bg-white/10 active:bg-white/15 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-corsa-wine",
} as const;

const sizes = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  icon: "h-10 w-10 shrink-0",
  iconSm: "h-9 w-9 shrink-0",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

const baseStyles =
  "inline-flex items-center justify-center rounded-full font-medium no-underline transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(baseStyles, variants[variant], sizes[size], className);
}

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
};

export type ButtonProps = ButtonBaseProps &
  Omit<React.ComponentProps<"button">, keyof ButtonBaseProps> & {
    href?: string;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      href,
      children,
      disabled,
      ...props
    },
    ref,
  ) {
    const styles = buttonVariants({ variant, size, className });

    if (href) {
      if (disabled) {
        return (
          <span className={cn(styles, "pointer-events-none opacity-50")}>
            {children}
          </span>
        );
      }

      return (
        <Link href={href} className={styles}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={styles}
        {...props}
      >
        {children}
      </button>
    );
  },
);
