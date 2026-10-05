import { z } from "zod";

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Dados invalidos";
}

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail valido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export const registerBuyerSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo"),
  email: z.string().email("Informe um e-mail valido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  acceptTerms: z.literal("on", {
    message: "Aceite os termos para continuar",
  }),
});

export const registerPhotographerSchema = registerBuyerSchema;

export const profileSchema = z.object({
  name: z.string().min(2),
  billingStreet: z.string().optional(),
  billingNumber: z.string().optional(),
  billingComplement: z.string().optional(),
  billingNeighborhood: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().max(2).optional(),
  billingZip: z.string().optional(),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas nao coincidem",
    path: ["confirmPassword"],
  });

export const PROFILE_BIO_MAX = 500;

export const photographerProfileSchema = z.object({
  handle: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
  bio: z
    .string()
    .max(
      PROFILE_BIO_MAX,
      `Bio deve ter no máximo ${PROFILE_BIO_MAX} caracteres`,
    )
    .optional(),
  specialties: z.string().optional(),
});

const sessionModalitySchema = z.enum([
  "drift",
  "autodromo",
  "exibicao",
  "arrancada",
]);

export const ALBUM_TITLE_MAX = 100;
export const ALBUM_DESCRIPTION_MAX = 500;

export const albumSchema = z.object({
  title: z
    .string()
    .min(3, "Título deve ter ao menos 3 caracteres")
    .max(ALBUM_TITLE_MAX, `Título deve ter no máximo ${ALBUM_TITLE_MAX} caracteres`),
  description: z
    .string()
    .max(
      ALBUM_DESCRIPTION_MAX,
      `Descrição deve ter no máximo ${ALBUM_DESCRIPTION_MAX} caracteres`,
    )
    .optional(),
  state: z.string().length(2, "Selecione o estado"),
  city: z.string().min(2, "Informe a cidade"),
  modality: sessionModalitySchema,
  coverageDate: z.string().optional(),
  vehicleType: z.string().min(2, "Informe o tipo de veículo"),
  bundlePriceCents: z.coerce.number().int().min(0),
});

export const photoPriceSchema = z.object({
  photoId: z.string().uuid(),
  priceCents: z.coerce.number().int().min(0),
});

export const photoMetadataSchema = z.object({
  photoId: z.string().uuid(),
  title: z.string().optional(),
  description: z.string().optional(),
  carBrand: z.string().optional(),
  carModel: z.string().optional(),
  carColor: z.string().optional(),
  vehicleType: z.string().optional(),
});

export const checkoutSchema = z.object({
  paymentMethod: z.enum(["card", "pix"]),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
});

export const payoutSchema = z.object({
  amountCents: z.coerce
    .number()
    .int()
    .min(1, "Informe um valor maior que zero"),
});

const contentBlockSchema = z.object({
  type: z.enum(["heading", "subheading", "paragraph", "separator"]),
  content: z.string().optional(),
});

export const adminPlatformFeeSchema = z.object({
  platformFeePercent: z.coerce
    .number()
    .int("Use um número inteiro")
    .min(0, "Mínimo 0%")
    .max(50, "Máximo 50%"),
});

export const adminSocialLinksSchema = z.object({
  socialLinks: z
    .array(
      z.object({
        label: z.string().min(1, "Informe o nome"),
        url: z
          .string()
          .refine(
            (val) => val.startsWith("mailto:") || /^https?:\/\//.test(val),
            "URL inválida",
          ),
        icon: z.string().optional(),
      }),
    )
    .max(10),
});

export const adminContentBlocksSchema = z.object({
  blocks: z.array(contentBlockSchema).max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterBuyerInput = z.infer<typeof registerBuyerSchema>;
export type RegisterPhotographerInput = z.infer<typeof registerPhotographerSchema>;
