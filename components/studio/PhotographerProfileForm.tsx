"use client";

import { useActionState, useState } from "react";
import {
  updatePhotographerProfileAction,
  type ProfileActionState,
} from "@/lib/actions/profile";
import type { PhotographerRow } from "@/lib/queries/photographers";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CharCounter } from "@/components/ui/CharCounter";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PROFILE_BIO_MAX } from "@/lib/validation/schemas";

export function PhotographerProfileForm({
  profile,
}: {
  profile: PhotographerRow;
}) {
  const [bio, setBio] = useState(profile.bio ?? "");
  const [state, action, pending] = useActionState(
    updatePhotographerProfileAction,
    {} as ProfileActionState,
  );

  return (
    <Card className="p-6">
      <form action={action} className="flex flex-col gap-4">
        {state.success && (
          <p className="text-sm text-corsa-success">Perfil atualizado</p>
        )}
        {state.error && (
          <p className="text-sm text-corsa-wine">{state.error}</p>
        )}
        <Field label="Handle público" htmlFor="handle">
          <Input
            id="handle"
            name="handle"
            defaultValue={profile.handle}
            required
            pattern="[a-z0-9-]+"
          />
        </Field>
        <Field label="Bio" htmlFor="bio">
          <Textarea
            id="bio"
            name="bio"
            maxLength={PROFILE_BIO_MAX}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <CharCounter
            current={bio.length}
            max={PROFILE_BIO_MAX}
            className="self-end"
          />
        </Field>
        <Field
          label="Especialidades"
          htmlFor="specialties"
          hint="Separadas por vírgula"
        >
          <Input
            id="specialties"
            name="specialties"
            defaultValue={profile.specialties.join(", ")}
          />
        </Field>
        <Button type="submit" disabled={pending}>
          Salvar perfil
        </Button>
      </form>
    </Card>
  );
}
