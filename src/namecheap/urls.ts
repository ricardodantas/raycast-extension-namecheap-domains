const encode = (domain: string) => encodeURIComponent(domain.trim().toLowerCase());

/** Domain overview page in the Namecheap account panel. */
export const managementUrl = (domain: string) =>
  `https://ap.www.namecheap.com/Domains/DomainControlPanel/${encode(domain)}/domain`;

/** Advanced DNS tab of the domain in the Namecheap account panel. */
export const advancedDnsUrl = (domain: string) =>
  `https://ap.www.namecheap.com/Domains/DomainControlPanel/${encode(domain)}/advancedns`;

/** Public domain search results, where a domain can be added to the cart. */
export const registrationUrl = (domain: string) =>
  `https://www.namecheap.com/domains/registration/results/?domain=${encode(domain)}`;

export const whoisUrl = (domain: string) => `https://www.namecheap.com/domains/whois/result?domain=${encode(domain)}`;

export const websiteUrl = (domain: string) => `https://${domain.trim().toLowerCase()}`;

export const DOMAIN_LIST_URL = "https://ap.www.namecheap.com/domains/list/";

/**
 * API Access page for the environment in use. Sandbox is a separate account with its own whitelist,
 * so sending a sandbox user to the production page leaves them broken.
 * Note the host is `ap.www.sandbox.namecheap.com`; `ap.sandbox.namecheap.com` does not resolve.
 */
export const apiAccessUrl = (sandbox: boolean) =>
  sandbox
    ? "https://ap.www.sandbox.namecheap.com/settings/tools/apiaccess/"
    : "https://ap.www.namecheap.com/settings/tools/apiaccess/";

/** Whitelisted IPs section of the API Access page. */
export const whitelistUrl = (sandbox: boolean) => `${apiAccessUrl(sandbox)}whitelisted-ips`;

export const SANDBOX_SIGNUP_URL = "https://www.sandbox.namecheap.com/";
export const API_INTRO_URL = "https://www.namecheap.com/support/api/intro/";
