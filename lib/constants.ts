import { getSettings } from "@/lib/queries/site-settings";
import {
  DEFAULT_PLATFORM_FEE_PERCENT,
  photographerSharePercent,
  photographerShareRate,
  platformFeeRate,
} from "@/lib/share";

export const SESSION_COOKIE = "corsa_session";
export const CART_COOKIE = "corsa_cart";
export const ITEMS_PER_PAGE = 12;

export {
  DEFAULT_PLATFORM_FEE_PERCENT,
  photographerSharePercent,
  photographerShareRate,
  platformFeeRate,
};

export async function getPlatformFeePercent(): Promise<number> {
  const settings = await getSettings();
  return settings.platform_fee_percent;
}

export async function getPlatformFeeRate(): Promise<number> {
  return platformFeeRate(await getPlatformFeePercent());
}

export async function getPhotographerShareRate(): Promise<number> {
  return photographerShareRate(await getPlatformFeePercent());
}

export async function getPhotographerSharePercent(): Promise<number> {
  return photographerSharePercent(await getPlatformFeePercent());
}
