/**
 * Owner-facing integration settings (stardust dynamics). Everything here ships disabled / empty: the
 * migration does not invent endpoints, ids or credentials. See stardust/dynamic-features.md § Decision batch.
 */
export default {
  forms: {
    /*
     * Row 15 — form intake. The source posts to production-only AEM servlets (`/bin/wd/sf/lead/sub` →
     * Salesforce/Marketo lead, `/bin/wd/formemail` → inbox relay) behind reCAPTCHA; neither exists on this host.
     * Owner decision: name an endpoint per form (or one for all). Empty = local capture in the visitor's
     * browser with an explicit "no backend connected" message — nothing leaves the page.
     * The block POSTs JSON { form, data, page, timestamp } to the endpoint.
     */
    endpoint: '',
    endpoints: {
      // 'looking-to-purchase': '',
      // 'contact-careers': '',
    },
  },
};
