import { AuthChrome } from "@/components/auth/AuthChrome";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <AuthChrome>{children}</AuthChrome>;
}
