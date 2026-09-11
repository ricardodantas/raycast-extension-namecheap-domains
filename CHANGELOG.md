# Namecheap Domains Changelog

## [Safety and Setup] - 2026-09-11

- API requests now use POST, so the API key is no longer placed in a URL where a proxy or CDN could log it
- Your domain list is kept in Raycast's encrypted storage instead of the plaintext cache
- Availability searches are no longer written to disk
- Added a Clear Stored Data action, and documented everything the extension stores and sends

- Added a setup guide shown next to the preferences form, covering how to enable API access and whitelist an IP
- A rejected IP is now named on screen, with an action that copies it and opens the right Namecheap page
- Setup links follow the Sandbox preference instead of always opening the production account
- A failed refresh no longer leaves a stale domain list on screen with no explanation
- Corrected the guidance for rejected IPs, which wrongly suggested the Client IP preference could fix it
- New icon: a white ribbon N on orange, echoing Namecheap's mark

## [Initial Version] - 2026-09-11

- List Domains: browse the domains in your Namecheap account with expiry, auto-renew, privacy and lock status, and open the management page with Enter
- Check Domain Availability: check a full domain, or a keyword across your default TLDs, with registration pricing and premium detection
- Register Domain: verify availability and price, then continue to Namecheap checkout
