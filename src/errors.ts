import { openExtensionPreferences, Toast } from "@raycast/api";
import { showFailureToast } from "@raycast/utils";
import { NamecheapApiError } from "./namecheap/parse";

const OPEN_PREFERENCES: Toast.ActionOptions = {
  title: "Open Extension Preferences",
  onAction: () => {
    openExtensionPreferences();
  },
};

export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error ?? "Unknown error");

/** Actionable next step for an error, when there is one. */
export function errorHint(error: unknown): string | undefined {
  if (error instanceof NamecheapApiError && error.hint) return error.hint;
  const message = errorMessage(error);
  if (/IPv4/i.test(message)) return "Set Client IP in the extension preferences to skip auto-detection.";
  if (/API User|API Key/i.test(message)) return "Fill in the extension preferences.";
  return undefined;
}

/** Failure toast that explains what to do next and offers a shortcut to the preferences. */
export function showNamecheapError(error: unknown, title: string): Promise<Toast> {
  const hint = errorHint(error);
  return showFailureToast(error, {
    title,
    message: hint ? `${errorMessage(error)} — ${hint}` : errorMessage(error),
    primaryAction: hint ? OPEN_PREFERENCES : undefined,
  });
}
