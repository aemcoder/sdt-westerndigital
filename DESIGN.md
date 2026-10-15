---
name: Western Digital (westerndigital.com) — current state
description: Monochrome, Roboto-set corporate + commerce site; black/white/grey with photography tiles
colors:
  white: "#ffffff"
  black: "#000000"
  surface-grey: "#f2f3f3"
  surface-grey-alt: "#f1f1f1"
  text-muted: "#929a9d"
  text-secondary: "#6b6b6b"
  nav-grey: "#737779"
  link-blue: "#2266ff"
  footer-black: "#000000"
  dark-card: "#111111"
typography:
  display:
    fontFamily: "Roboto, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Roboto, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.1
  body:
    fontFamily: "Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  lede:
    fontFamily: "Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  button: "6px"
  card: "16px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
  section: "64px"
  section-lg: "80px"
components:
  button-primary:
    backgroundColor: "{colors.black}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "12px 32px"
    typography: "Roboto 16px/16px 500"
  button-primary-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.black}"
    rounded: "{rounded.button}"
    padding: "12px 32px"
  button-on-dark:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "12px 32px"
  button-on-dark-filled:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    rounded: "{rounded.button}"
    padding: "12px 32px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
    padding: "24px"
  card-dark:
    backgroundColor: "{colors.dark-card}"
    textColor: "{colors.white}"
    rounded: "{rounded.card}"
---

<!-- stardust:provenance
writtenBy: stardust:replica (extract --prep Phase 4, descriptive — current state, NOT a target)
writtenAt: 2026-09-18T07:05:00Z
againstInput: https://www.westerndigital.com/
readArtifacts: [stardust/current/_brand-extraction.json, stardust/replica/lift/*.json, stardust/current/assets/screenshots/*.png]
synthesized: none — values are computed-style lifts; prose describes what is rendered
-->

# Design System: Western Digital (current state)

## Overview

**Creative North Star: "The Engineered Monochrome"**

The site is a black-and-white system with photography as the only colour. Type is a single family (Roboto) in four weights; grounds alternate between white, one light grey (#f2f3f3) and black; corners are 6px on controls and 16px on cards; there are no shadows and no gradients on the probed pages. Density is medium: a 1140px container with 16px gutters, 64–80px section rhythm, 24–32px grid gaps. Photography is cropped into squares and 2:3 portrait cards and used as full-bleed 750px hero slides.

The chrome is heavy and constant: a 40px grey utility/promo bar, a 57px white sticky nav with a mega-menu, and a 763px black footer with four link columns, a support block, social icons and an award badge appear on every page, including press releases.

**Key Characteristics:**
- Monochrome palette; the one chromatic value is a link blue (#2266ff) on inline links and the active tab underline.
- One typeface, Roboto, 300/400/500/700; headings are 500 or 700, never light.
- Buttons are 1px-bordered, 6px-radius pills of 42px height; on dark grounds they invert to white outline.
- Cards are 16px-radius white boxes on grey grounds, or 400×600 photo cards with a black ground.
- Flat: depth comes from ground alternation (white → grey → white → black), not elevation.

## Colors

A three-value neutral system plus one link colour.

### Primary
- **Black** (#000000): the action colour. Filled primary buttons, the footer, dark card grounds, the "Reports and Resources" CTA band, all headings and body text.

### Neutral
- **White** (#ffffff): page ground, cards, header, inverted button fills.
- **Surface Grey** (#f2f3f3): section grounds behind card rails (Legacy rail, Popular Products, Case Studies). A near-twin #f1f1f1 appears on the utility bar and skip button.
- **Muted Grey** (#929a9d): footer links, card meta.
- **Secondary Grey** (#6b6b6b) and **Nav Grey** (#737779): eyebrows, nav items, secondary text.
- **Dark Card** (#111111 / #2b2b2b): footer legal band and dark card grounds.

### Tertiary
- **Link Blue** (#2266ff): inline body links (press releases), the active tab underline on the home category tabs.

### Named Rules
**The Monochrome Rule.** Colour lives only in photographs and the link blue; every UI surface is black, white or one grey.

## Typography

**Display Font:** Roboto (with sans-serif)
**Body Font:** Roboto (with sans-serif)
**Label/Mono Font:** none (SimplonMono, FK Grotesk Neue, Glyphicons and icomoon are declared in stylesheets but not rendered on the probed pages)

**Character:** utilitarian, tight leading (1.1 on every heading level), Title Case headings, no letter-spacing adjustments, no uppercase except eyebrows.

### Hierarchy
- **Display** (700, 48px, 52.8px): home h1 and every home section h2 ("Popular Products", "About WD"). 32px at 360.
- **Headline** (700, 36px, 39.6px): band titles ("Small or Medium Business"). Program-page h1 is 36px/500 white on the photo hero.
- **Article title** (500, 48px, 52.8px, white): press-release h1 on the grey photo hero; 32px at 360.
- **Title** (500, 24–32px, 1.1): card titles (24px black on white cards, 28px white on dark cards), split-band h3 (32px).
- **Lede** (400, 20px, 22–30px): hero sub-copy, band intros.
- **Body** (400, 16px, 24px): paragraphs, list items, footer links; bold 700 for meta labels ("Capacity:", "Starting at").
- **Label** (400, 16px, 24px, uppercase): eyebrows ("TECHNOLOGY", "CASE STUDY", "SUSTAINABILITY COMMITMENT").
- **Small** (400, 14px, 21px): utility bar text, legal row.

### Named Rules
**The Single-Family Rule.** Everything is Roboto; hierarchy is size and weight only.

## Layout

Centered 1140px container with 16px horizontal padding (1108px content). Full-bleed grounds behind contained content. Home sections: hero 750px tall (3-slide carousel, copy left-aligned inside the container), 5-up square tile row, horizontal card rails (400px cards, 32px gap) that overflow the container to the right, 4-up white card grids, a 2-up 50/50 media band, a 5-up tile row. Program pages: 400px photo hero under a sub-nav tab row, breadcrumb, then alternating 50/50 photo/text bands (554px image column). Press releases: contained 1108×300 grey photo hero, then a 2-column body (main ~830px + 320px "Press Contacts" aside).

Responsive: at 360 the container is edge-to-edge with 16px padding; rails become one-card-wide horizontal scrollers; 50/50 bands stack image-first; the header collapses to a 91px bar with logo, hamburger and search; the footer grows to 2176px (columns stack).

## Elevation & Depth

Flat. No box-shadows were observed on any probed page. Depth is expressed by ground alternation (white → #f2f3f3 → white → black) and by photography behind text with a dark scrim on hero slides.

### Named Rules
**The Flat-By-Default Rule.** No shadows at rest or on hover; hover inverts fill/outline on buttons and underlines links.

## Shapes

6px radius on every button and input; 16px on cards and product tiles; 999px only on a few icon chips. Photo tiles are square (home category, About WD) or 2:3 portrait (Legacy rail). No clipping beyond rounded corners; 1px borders in the current text colour on outline buttons.

## Components

### Buttons
- **Shape:** 6px radius, 1px border, 12px 32px padding, 16px/16px Roboto 500, 42px tall.
- **Primary (light ground):** black fill, white text, black border. Hover inverts.
- **Secondary (light ground):** transparent, black text, black border.
- **On dark / on photo:** transparent, white text, white border; a white-filled variant (black text) is used on the hero slides ("Explore the IDC Research").
- **Text link CTA:** 16px 700 black, underlined ("Learn More" under the G-DRIVE feature, "Read More" on resource cards).

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** white on grey grounds (product, resource cards); black with a photo top on the Legacy rail (400×600, eyebrow + h3 + outline CTA).
- **Shadow Strategy:** none.
- **Meta lines:** bold label + regular value ("Capacity: 4TB–26TB", "Starting at $299.99").

### Inputs / Fields
- Search: icon-triggered overlay input (header); forms use 6px-radius, 1px #929a9d bordered fields (observed on program forms).

### Navigation
- Utility bar (40px, #f1f1f1 ground, 14px text): promo sentence + "Shop | WD for Business".
- Sticky nav (57px, white): logo left (135×16 SVG), 4 mega-menu items centred (16px, nav grey, black on hover/active), account / cart / search icons right (18–21px SVG).
- Program sub-nav: tab row under the header (Overview, People, Supply Chain…), 16px, active tab black.
- Breadcrumb: 14px grey "Home / Company / Corporate Responsibility".

### Footer (signature component)
- Black ground, 1140px container. Row 1: logo (77×20 SVG) + "Country/Region: United States"; rule; 4 link columns (Shopping, Programs, Company, Support — 20px 500 white headings, 16px #929a9d links, 40px row pitch) + Online Store Support block + 5 social icons (24px) + Ethisphere badge (100px); legal row (Privacy, Legal, Trademarks, Terms of Sale, Product Compliance) and © line on #111111.

### Hero carousel (signature component)
- 750px full-bleed photo slides (`background-size: cover`), left-aligned copy block inside the container: 66px/700 white headline, 20px lede, white-filled CTA; dot/arrow controls; autoplay.

## Do's and Don'ts

### Do:
- Keep every surface black, white or #f2f3f3; let photographs carry colour.
- Use 6px on controls and 16px on cards, nothing else.
- Keep heading leading at 1.1 and body at 1.5.
- Repeat the full chrome (utility bar, nav, footer) on every page.

### Don't:
- Add shadows, gradients or colour accents.
- Introduce a second typeface or light-weight headings.
- Change letter-spacing or uppercase headings (only eyebrows are uppercase).
