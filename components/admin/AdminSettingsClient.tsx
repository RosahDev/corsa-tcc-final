"use client";

import { useActionState, useState } from "react";
import {
  updatePlatformFeeAction,
  updatePrivacyContentAction,
  updateSocialLinksAction,
  updateTermsContentAction,
  type AdminSettingsState,
} from "@/lib/actions/admin-settings";
import type {
  ContentBlock,
  SiteSettingsRow,
  SocialLink,
} from "@/lib/queries/site-settings";
import { photographerSharePercent } from "@/lib/share";
import { ContentBlockEditor } from "@/components/admin/ContentBlockEditor";
import { SocialLinksEditor } from "@/components/admin/SocialLinksEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

const tabs = [
  { id: "general", label: "Geral" },
  { id: "social", label: "Redes sociais" },
  { id: "terms", label: "Termos" },
  { id: "privacy", label: "Privacidade" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type AdminSettingsClientProps = {
  settings: SiteSettingsRow;
};

export function AdminSettingsClient({ settings }: AdminSettingsClientProps) {
  const [tab, setTab] = useState<TabId>("general");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    settings.social_links,
  );
  const [termsBlocks, setTermsBlocks] = useState<ContentBlock[]>(
    settings.terms_content,
  );
  const [privacyBlocks, setPrivacyBlocks] = useState<ContentBlock[]>(
    settings.privacy_content,
  );

  const [feeState, feeAction, feePending] = useActionState(
    updatePlatformFeeAction,
    {} as AdminSettingsState,
  );
  const [socialState, socialAction, socialPending] = useActionState(
    updateSocialLinksAction,
    {} as AdminSettingsState,
  );
  const [termsState, termsAction, termsPending] = useActionState(
    updateTermsContentAction,
    {} as AdminSettingsState,
  );
  const [privacyState, privacyAction, privacyPending] = useActionState(
    updatePrivacyContentAction,
    {} as AdminSettingsState,
  );

  const sharePercent = photographerSharePercent(settings.platform_fee_percent);

  return (
    <div>
      <SegmentedControl
        variant="wine"
        fullWidth
        options={tabs.map((item) => ({ value: item.id, label: item.label }))}
        value={tab}
        onChange={setTab}
        className="w-full max-w-2xl"
        aria-label="Seções de configuração"
      />

      {tab === "general" && (
        <Card className="mt-6 p-6">
          <h2 className="font-heading text-lg font-semibold text-corsa-ink">
            Taxa da plataforma
          </h2>
          <p className="mt-2 text-sm text-corsa-muted">
            Percentual retido pela Corsa em cada venda. Os fotógrafos recebem{" "}
            {sharePercent}% do valor bruto.
          </p>
          <form action={feeAction} className="mt-6 flex flex-col gap-4">
            {feeState.error && (
              <p className="text-sm text-corsa-wine">{feeState.error}</p>
            )}
            {feeState.success && (
              <p className="text-sm text-green-700">Taxa atualizada com sucesso.</p>
            )}
            <Field
              label="Taxa da plataforma (%)"
              htmlFor="platformFeePercent"
              hint="Entre 0% e 50%"
            >
              <Input
                id="platformFeePercent"
                name="platformFeePercent"
                type="number"
                min={0}
                max={50}
                required
                defaultValue={settings.platform_fee_percent}
                className="max-w-xs"
              />
            </Field>
            <Button type="submit" disabled={feePending}>
              {feePending ? "Salvando..." : "Salvar taxa"}
            </Button>
          </form>
        </Card>
      )}

      {tab === "social" && (
        <Card className="mt-6 p-6">
          <h2 className="font-heading text-lg font-semibold text-corsa-ink">
            Redes sociais
          </h2>
          <p className="mt-2 text-sm text-corsa-muted">
            Links exibidos no rodapé do site.
          </p>
          <form action={socialAction} className="mt-6 flex flex-col gap-4">
            {socialState.error && (
              <p className="text-sm text-corsa-wine">{socialState.error}</p>
            )}
            {socialState.success && (
              <p className="text-sm text-green-700">Redes sociais atualizadas.</p>
            )}
            <input
              type="hidden"
              name="socialLinks"
              value={JSON.stringify(socialLinks)}
              readOnly
            />
            <SocialLinksEditor links={socialLinks} onChange={setSocialLinks} />
            <Button type="submit" disabled={socialPending}>
              {socialPending ? "Salvando..." : "Salvar redes sociais"}
            </Button>
          </form>
        </Card>
      )}

      {tab === "terms" && (
        <Card className="mt-6 p-6">
          <h2 className="font-heading text-lg font-semibold text-corsa-ink">
            Termos de uso
          </h2>
          <form action={termsAction} className="mt-6 flex flex-col gap-4">
            {termsState.error && (
              <p className="text-sm text-corsa-wine">{termsState.error}</p>
            )}
            {termsState.success && (
              <p className="text-sm text-green-700">Termos atualizados.</p>
            )}
            <input
              type="hidden"
              name="content"
              value={JSON.stringify(termsBlocks)}
              readOnly
            />
            <ContentBlockEditor blocks={termsBlocks} onChange={setTermsBlocks} />
            <Button type="submit" disabled={termsPending}>
              {termsPending ? "Salvando..." : "Salvar termos"}
            </Button>
          </form>
        </Card>
      )}

      {tab === "privacy" && (
        <Card className="mt-6 p-6">
          <h2 className="font-heading text-lg font-semibold text-corsa-ink">
            Política de privacidade
          </h2>
          <form action={privacyAction} className="mt-6 flex flex-col gap-4">
            {privacyState.error && (
              <p className="text-sm text-corsa-wine">{privacyState.error}</p>
            )}
            {privacyState.success && (
              <p className="text-sm text-green-700">Política atualizada.</p>
            )}
            <input
              type="hidden"
              name="content"
              value={JSON.stringify(privacyBlocks)}
              readOnly
            />
            <ContentBlockEditor
              blocks={privacyBlocks}
              onChange={setPrivacyBlocks}
            />
            <Button type="submit" disabled={privacyPending}>
              {privacyPending ? "Salvando..." : "Salvar política"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
