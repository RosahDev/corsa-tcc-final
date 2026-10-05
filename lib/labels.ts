export type SessionModality = "drift" | "autodromo" | "exibicao" | "arrancada";

const modalityLabels: Record<SessionModality, string> = {
  drift: "Drift",
  autodromo: "Autódromo",
  exibicao: "Exibição",
  arrancada: "Arrancada",
};

export const SESSION_MODALITIES: SessionModality[] = [
  "drift",
  "autodromo",
  "exibicao",
  "arrancada",
];

export function getModalityLabel(modality: string): string {
  return modalityLabels[modality as SessionModality] ?? modality;
}
