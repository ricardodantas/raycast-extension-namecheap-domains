import {
  Action,
  ActionPanel,
  Clipboard,
  Color,
  Icon,
  List,
  open,
  openExtensionPreferences,
  showToast,
  Toast,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { errorHint, errorMessage } from "./errors";
import { NamecheapApiError } from "./namecheap/parse";
import { API_INTRO_URL, whitelistUrl } from "./namecheap/urls";
import { isSandbox, resolveClientIp } from "./preferences";
import { clearStoredData } from "./storage";

/**
 * The address the user has to whitelist. Namecheap echoes the address it actually saw in the error, which is
 * authoritative, so it wins over the address we detected. A VPN or a split tunnel can make the two differ.
 */
export function useWhitelistIp(error?: unknown): { ip: string | undefined; isAuthoritative: boolean } {
  const fromError = error instanceof NamecheapApiError ? error.requestIp : undefined;
  // usePromise, not useCachedPromise: the cached variant would write the address to a plaintext file.
  const { data: detected } = usePromise(resolveClientIp, [], {
    execute: !fromError,
    // Supplementary information, so a detection failure must not raise a second error on screen.
    onError: () => undefined,
  });
  return { ip: fromError ?? detected, isAuthoritative: Boolean(fromError) };
}

/** True when Namecheap rejected the address the request came from. */
export const isWhitelistError = (error: unknown): error is NamecheapApiError =>
  error instanceof NamecheapApiError && error.isWhitelistError;

function environmentOf(error: unknown): boolean {
  return error instanceof NamecheapApiError && error.environment ? error.environment === "sandbox" : isSandbox();
}

/** Copy the address, open the right whitelist page, then retry. Shared by every failure screen. */
export function SetupActions({ error, onRetry }: { error?: unknown; onRetry?: () => void }) {
  const { ip } = useWhitelistIp(error);
  const sandbox = environmentOf(error);

  return (
    <>
      <Action
        title="Copy IP and Open Namecheap"
        icon={Icon.Clipboard}
        onAction={async () => {
          if (ip) await Clipboard.copy(ip);
          await open(whitelistUrl(sandbox));
          await showToast({
            style: Toast.Style.Success,
            title: ip ? `Copied ${ip}` : "Opened Namecheap API access",
            message: "Add it under Whitelisted IPs, then come back and try again",
          });
        }}
      />
      {ip ? <Action.CopyToClipboard title="Copy IP Address" content={ip} /> : null}
      {onRetry ? <Action title="Try Again" icon={Icon.ArrowClockwise} onAction={onRetry} /> : null}
      <Action.OpenInBrowser title="Read the Setup Guide" icon={Icon.Book} url={API_INTRO_URL} />
      <Action
        title="Clear Stored Data"
        icon={Icon.Trash}
        style={Action.Style.Destructive}
        onAction={async () => {
          await clearStoredData();
          await showToast({ style: Toast.Style.Success, title: "Cleared stored data" });
        }}
      />
      <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
    </>
  );
}

/**
 * The screen a user actually lands on when the API rejects them. For a whitelist rejection it leads with the
 * address to add, because that is the entire fix and Namecheap has already told us what it is.
 */
export function SetupEmptyView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { ip, isAuthoritative } = useWhitelistIp(error);
  const sandbox = environmentOf(error);
  const account = sandbox ? "sandbox" : "production";

  if (isWhitelistError(error)) {
    const address = ip ?? "your public IPv4 address";
    return (
      <List.EmptyView
        icon={{ source: Icon.Lock, tintColor: Color.Orange }}
        title={`Whitelist ${address}`}
        description={[
          `Namecheap only accepts API calls from addresses on your whitelist, and this one is not on it yet.`,
          `Add it to your ${account} account under Profile › Tools › Namecheap API Access, then try again.`,
          ``,
          `It is the address your Mac connects from, so it changes when you switch network or turn a VPN on.`,
          `Add your home, office and VPN addresses together to avoid coming back here.`,
          isAuthoritative
            ? ``
            : `This address was detected locally. If it does not work, use the one in the error message.`,
        ]
          .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
          .join("\n")}
        actions={<SetupActionPanel error={error} onRetry={onRetry} />}
      />
    );
  }

  return (
    <List.EmptyView
      icon={{ source: Icon.Warning, tintColor: Color.Red }}
      title={errorTitle(error)}
      description={[errorMessage(error), errorHint(error)].filter(Boolean).join("\n\n")}
      actions={<SetupActionPanel error={error} onRetry={onRetry} />}
    />
  );
}

function errorTitle(error: unknown): string {
  if (error instanceof NamecheapApiError && error.number) return `Namecheap error ${error.number}`;
  return "Could not reach Namecheap";
}

function SetupActionPanel({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <ActionPanel>
      <SetupActions error={error} onRetry={onRetry} />
    </ActionPanel>
  );
}
