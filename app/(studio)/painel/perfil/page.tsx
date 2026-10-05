export const dynamic = "force-dynamic";

import { requirePhotographer } from "@/lib/auth/current-user";
import { findPhotographerByUserId } from "@/lib/queries/photographers";
import { AvatarUploadForm } from "@/components/studio/AvatarUploadForm";
import { PhotographerProfileForm } from "@/components/studio/PhotographerProfileForm";
import { Button } from "@/components/ui/Button";

export default async function PerfilStudioPage() {
  const user = await requirePhotographer();
  const profile = await findPhotographerByUserId(user.id);
  if (!profile) return <p>Perfil não encontrado</p>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">
        Perfil público
      </h1>
      <p className="mt-1 text-sm text-corsa-muted">
        Como compradores veem sua vitrine
      </p>
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          href={`/fotografos/${profile.handle}`}
        >
          Ver página pública
        </Button>
      </div>
      <div className="mt-8 flex max-w-lg flex-col gap-6">
        <AvatarUploadForm profile={profile} />
        <PhotographerProfileForm profile={profile} />
      </div>
    </div>
  );
}
