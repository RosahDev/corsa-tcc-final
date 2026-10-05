export const DEFAULT_PLATFORM_FEE_PERCENT = 15;

export function photographerSharePercent(platformFeePercent: number): number {
  return 100 - platformFeePercent;
}

export function platformFeeRate(platformFeePercent: number): number {
  return platformFeePercent / 100;
}

export function photographerShareRate(platformFeePercent: number): number {
  return photographerSharePercent(platformFeePercent) / 100;
}
