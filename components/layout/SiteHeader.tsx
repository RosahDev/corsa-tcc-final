import { getCurrentUser } from "@/lib/auth/current-user";
import { getCartCount } from "@/lib/actions/cart";
import { SiteHeaderClient } from "./SiteHeaderClient";

export async function SiteHeader() {
  const [user, cartCount] = await Promise.all([
    getCurrentUser(),
    getCartCount(),
  ]);

  return (
    <SiteHeaderClient
      user={
        user
          ? { name: user.name, role: user.role, handle: user.handle ?? null }
          : null
      }
      cartCount={cartCount}
    />
  );
}
