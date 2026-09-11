import { getPreferenceValues } from "@raycast/api";
import { createClient, type NamecheapClient } from "./namecheap/client";
import { detectPublicIPv4, isIPv4 } from "./namecheap/ip";
import type { NamecheapEnvironment, PricingTable } from "./namecheap/types";
import { clearPricing, readClientIp, readPricing, writeClientIp, writePricing } from "./storage";

export const getPreferences = () => getPreferenceValues<Preferences>();

export const isSandbox = () => Boolean(getPreferences().sandbox);

export const currentEnvironment = (): NamecheapEnvironment => (isSandbox() ? "sandbox" : "production");

/**
 * The IPv4 address sent as ClientIp: the preference when set, otherwise the detected public address, kept for
 * an hour so every command does not repeat the lookup.
 *
 * Namecheap authorises the address the request actually comes from, so this value never decides whether a call
 * is allowed. It only has to be present and well formed.
 */
export async function resolveClientIp(): Promise<string> {
  const configured = getPreferences().clientIp?.trim();
  if (configured) {
    if (!isIPv4(configured)) {
      throw new Error(`"${configured}" is not a valid IPv4 address. Update Client IP in the extension preferences.`);
    }
    return configured;
  }

  const environment = currentEnvironment();
  const stored = await readClientIp(environment);
  if (stored && isIPv4(stored)) return stored;

  const detected = await detectPublicIPv4();
  await writeClientIp(environment, detected);
  return detected;
}

export async function getClient(): Promise<NamecheapClient> {
  const { apiUser, apiKey, userName, sandbox } = getPreferences();
  if (!apiUser?.trim() || !apiKey?.trim()) {
    throw new Error("Add your Namecheap API User and API Key in the extension preferences.");
  }
  return createClient({ apiUser, apiKey, userName, clientIp: await resolveClientIp(), sandbox });
}

/** Registration pricing for every TLD. Public data, cached for a day as Namecheap asks. */
export async function getPricing(): Promise<PricingTable> {
  const environment = currentEnvironment();
  const cached = readPricing(environment);
  if (cached) return cached;
  const table = await (await getClient()).getRegisterPricing();
  writePricing(environment, table);
  return table;
}

export function clearPricingCache(): void {
  clearPricing(currentEnvironment());
}
