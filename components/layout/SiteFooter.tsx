import Link from "next/link";
import {
  Camera,
  Instagram,
  Link as LinkIcon,
  Mail,
  Share2,
} from "lucide-react";
import { CorsaLogo } from "@/components/brand/CorsaLogo";
import type { SocialLink } from "@/lib/queries/site-settings";
import { cn } from "@/lib/utils";

const iconMap = {
  instagram: Instagram,
  mail: Mail,
  share: Share2,
  camera: Camera,
  link: LinkIcon,
} as const;

export type SiteFooterProps = {
  className?: string;
  socialLinks?: SocialLink[];
};

export function SiteFooter({ className, socialLinks = [] }: SiteFooterProps) {
  return (
    <footer className={cn("bg-corsa-wine text-white", className)}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4 max-w-md">
            <Link href="/" className="inline-flex" aria-label="Corsa — início">
              <CorsaLogo variant="white" height={32} />
            </Link>
            <p className="text-sm leading-relaxed text-white/80">
              O principal marketplace para fotografia automotiva profissional e
              mídia exclusiva de eventos.
            </p>
          </div>

          {socialLinks.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-medium uppercase tracking-widest text-white/60">
                Conecte-se
              </span>
              <div className="flex items-center gap-3">
                {socialLinks.map((link) => {
                  const Icon =
                    iconMap[link.icon as keyof typeof iconMap] ?? LinkIcon;
                  const isExternal = link.url.startsWith("http");
                  return (
                    <a
                      key={link.url}
                      href={link.url}
                      className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                      aria-label={link.label}
                      {...(isExternal
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/60">
            © 2026 Corsa Automotive. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-xs text-white/60">
            <Link href="/termos" className="hover:text-white">
              Termos de uso
            </Link>
            <Link href="/privacidade" className="hover:text-white">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
