/**
 * site-config — owner-facing integration settings. No build step: blocks import it directly.
 *
 * forms — OWNER DECISION PENDING: the form intake endpoint (forms service / Marketo / the existing
 * AEM webform servlets on the production host: /bin/wd/sf/lead/sub, /bin/wd/formemail,
 * /bin/wd/acs/formsubmit, /bin/wd/recycle). Content lives in Document Authoring, which has no
 * sheet intake, so until an endpoint is named the `form` block validates, captures the submission
 * in the visitor's browser only and SAYS SO ("no backend connected"). It never claims the request
 * reached WD.
 *
 * Resolution order for a form's endpoint (first non-empty wins):
 *   1. the block's own `Action` row (authored in DA)
 *   2. forms.endpoints['<definition id>']      e.g. 'looking-to-purchase'
 *   3. forms.endpoints['<page path>']          e.g. '/company/contact-us'
 *   4. forms.endpoint                          site-wide default
 * A configured endpoint receives POST application/json { data, page, timestamp }; a 2xx shows the
 * source success copy, anything else the source error copy ("Oops! Something went wrong. Please
 * try again later."). The source's reCAPTCHA token is not replayed off-origin; a honeypot field
 * (`website`) drops bot posts.
 */
const siteConfig = {
  forms: {
    endpoint: '',
    endpoints: {},
  },
};

export default siteConfig;
