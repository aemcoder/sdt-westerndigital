/**
 * site-config — owner-facing integration endpoints (stardust:dynamics, stardust/dynamic-features.md).
 * One place to move a feature from its interim tier to production; blocks read it, authors never do.
 *
 * productSearch (row 14): the storefront's catalog search (SAP Commerce OCC). Its CORS answer reflects the
 *   requesting origin, so the PLP block calls it directly from the EDS host. Owner decision on record:
 *   confirm the API may be consumed from the new host (or route it same-origin) before go-live.
 * forms (row 15): intake endpoints per form family. Empty = no backend connected — the form block validates,
 *   captures the submission locally (sessionStorage) and says so. The source servlets
 *   (/bin/wd/sf/lead/sub, /bin/wd/formemail, /bin/wd/acs/formsubmit, /bin/wd/recycle) sit behind a
 *   domain-bound reCAPTCHA v3 on www.westerndigital.com and cannot be replayed from this host.
 */
const CONFIG = {
  productSearch: {
    enabled: true,
    endpoint: 'https://api.westerndigital.com/wdwebservices/v2/us/products/search',
    storefront: 'https://www.westerndigital.com',
  },
  forms: {
    endpoints: {
      'sales-lead': '',
      'contact-email': '',
      newsletter: '',
      recycle: '',
    },
  },
};

export default function siteConfig() {
  return CONFIG;
}
