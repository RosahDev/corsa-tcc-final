import type { LucideIcon } from "lucide-react";
import { isValidElement } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export type EmptyStateProps = {
  icon?: LucideIcon | React.ReactElement;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
};

function renderIcon(icon: LucideIcon | React.ReactElement) {
  if (isValidElement(icon)) return icon;
  const Icon = icon as LucideIcon;
  return <Icon className="size-6" aria-hidden="true" />;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  const showAction = actionLabel && (onAction || actionHref);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="flex size-14 items-center justify-center rounded-2xl bg-corsa-rose text-corsa-wine">
          {renderIcon(icon)}
        </div>
      )}
      <div className="flex flex-col gap-2 max-w-sm">
        <h3 className="font-heading text-lg font-semibold text-corsa-ink">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-corsa-muted">{description}</p>
        )}
      </div>
      {showAction &&
        (actionHref ? (
          <Button href={actionHref} className="mt-2">{actionLabel}</Button>
        ) : (
          <Button className="mt-2" onClick={onAction}>{actionLabel}</Button>
        ))}
    </div>
  );
}
