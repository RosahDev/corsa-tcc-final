export function getAvatarUrl(avatarKey: string | null | undefined): string | null {
  if (!avatarKey) return null;
  return `/api/avatars/${avatarKey}`;
}
