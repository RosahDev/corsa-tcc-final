import Image from "next/image";
import { Camera } from "lucide-react";
import { getAvatarUrl } from "@/lib/media/avatar-url";
import { cn } from "@/lib/utils";

type PhotographerAvatarProps = {
  avatarKey?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "default" | "onDark";
};

const sizeClasses = {
  sm: "size-10 text-sm",
  md: "size-14 text-base",
  lg: "size-16 text-lg",
};

const iconSizes = {
  sm: "size-5",
  md: "size-7",
  lg: "size-8",
};

export function PhotographerAvatar({
  avatarKey,
  name,
  size = "md",
  className,
  variant = "default",
}: PhotographerAvatarProps) {
  const avatarUrl = getAvatarUrl(avatarKey);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (avatarUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          className,
        )}
      >
        <Image
          src={avatarUrl}
          alt={`Foto de ${name}`}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeClasses[size],
        variant === "onDark"
          ? "bg-white/10 text-corsa-sand"
          : "bg-corsa-rose text-corsa-wine",
        className,
      )}
      aria-hidden={!initials}
    >
      {initials ? (
        <span>{initials}</span>
      ) : (
        <Camera className={iconSizes[size]} />
      )}
    </div>
  );
}
