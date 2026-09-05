# RACEUS-home

The library at raceus.co.il. One card per project and service under the domain,
saying what you can open and what you cannot.

Static files in `public/`. No build step, no dependencies, no framework.
`index.html` carries the CSS, `app.js` is a plain ES module, and
`catalog.json` is the content.

## The catalogue

Every card is one object in `public/catalog.json`.

| Field | Meaning |
|---|---|
| `id` | stable key, also seeds the plate's light composition |
| `title` | display name |
| `name` | slug shown in the detail sheet |
| `plate` | the word printed across the poster, Latin characters only |
| `logo` | mark to draw on the plate; the file is `public/logos/<logo>.svg` |
| `brand` | the mark's own colour, used only in the detail sheet |
| `tone` | 0 to 1 exposure of the print, set by eye for rhythm across a row |
| `group` | `work` or `services`, which row it sits in |
| `tier` | `open`, `access`, `service` or `private` |
| `host` | hostname, or `null` |
| `url` | link target, or `null` when nothing opens |
| `blurb` | one line, used as the caption when there is no host |
| `long` | the detail sheet body, `\n\n` between paragraphs |
| `stack` | the chips in the detail sheet |
| `repo` | optional source link |

## Logos

Every card has a mark in `public/logos/`. They are plain SVGs on a 32 by 32 grid
that paint with `currentColor` and carry no background, so one CSS `color`
decides how they read:

- **On the plates and the launch tiles they are monochrome.** The site has no
  colour, and exposure is what tells you whether a card opens. Eleven brand
  palettes in one grid would take that job away from brightness.
- **In the detail sheet the mark gets its own colour**, from the card's `brand`
  field. One card at a time, nothing to scan, so the brand can speak.

They are applied as CSS masks rather than `<img>`, which is what makes a single
file work in both places. The fill sits behind an `@supports` guard: with no
mask support the mark is absent rather than a solid block.

Seven of the eleven are the project's own logo, taken from the project's own
repo. Where the real mark knocks a shape out of a solid field, the SVG uses an
inner `<mask>` so the hole is real transparency and survives the CSS mask.

| card | mark | where it came from |
|---|---|---|
| `terminal` | prompt chevron and cursor bar | `raceus-portfolio/public/favicon.svg`, path copied |
| `saas` | fork and knife | the platform's own `favicon.svg`, path copied |
| `assistant` | D on a disc | the POS assistant extension's `icons/icon128.png`, traced |
| `ccb` | speech bubble, three dots | `claude-chat-bridge/web/icons/icon-512.png`, traced |
| `sukartask` | check knocked out of a disc | `sukartask/scripts/gen-icons.ts`, same numbers |
| `plan` | sheet with a spine | `sukarplan/scripts/gen-icons.py`, same numbers |
| `t3` | T3 wordmark | the T3 Code app icon, third party, already achromatic |

The two generated from a script are exact: the SVG uses the radii and offsets
the generator computes, so the mark here and the mark the app ships are the same
drawing at a different size.

Four cards have no logo to reuse, because those projects have never had one:
`bugtracker`, `workspace`, `sukarfleet` and `ssh`. Their marks are original and
say something about the project instead. If any of the four grows a real logo,
replace the file and delete the invented one.

Brand colours live in the card's `brand` field in `catalog.json`, and nowhere
else. They come from the same sources as the marks. `#00a884` and `#8b9cff` are
the accent constants in the two generator scripts, `#884ab5` and `#4f9cf7` are
the dominant pixel colour in the two PNG icons.

To add or change one, drop a 32 by 32 SVG in `public/logos/`, use
`fill="currentColor"` or `stroke="currentColor"` and no background rectangle,
then point the card's `logo` field at its filename. Check it at 20 pixels
before you commit: at plate size a mark either reads or it does not.

The tier decides everything a card does.

**`open`.** Public. Filled square marker, bright plate, the whole frame is a link.

**`access`.** Behind Cloudflare Access. Lock marker, bright plate, the frame links
straight to the host, so you meet the Cloudflare login rather than a fake unlock.

**`service`.** No browser entry point, like the SSH gateway. Lock marker,
under-exposed, clicking opens the detail sheet.

**`private`.** Described but not published. Hollow marker, under-exposed,
clicking opens the detail sheet.

Brightness is the status channel. There is no colour on the page, so exposure
alone tells you what is reachable. An `open` or `access` card also carries a
small `i` button for its detail sheet, and joins the launch strip at the top of
the page, numbered in catalogue order.

## Adding a card

Append an object to `public/catalog.json`. Nothing else changes.

- Pick a `group` and a `tier`. `open` and `access` need a `url`. `service` and
  `private` must not have one.
- Keep `plate` in Latin characters. The self-hosted fonts carry the latin subset
  only, so anything else falls back to a system font.
- Set `tone` by eye against its neighbours. Higher is brighter.
- `long` is not searched. Put anything people should be able to find in `title`,
  `name`, `host`, `blurb` or `stack`.

Order in the file is the order on the page and the order of the launch strip.

## Keys

| Key | Action |
|---|---|
| `/` | focus the search field |
| `1` to `6` | open the matching launch tile |
| `Escape` | clear the search, or close the detail sheet |

A number key clicks the tile's own anchor from inside the keydown handler, so
the browser counts it as a user gesture and does not block the new tab.

## Deploy

GitHub Actions deploys `public/` to the Cloudflare Pages project `raceus` on
every push to `main`, which is what serves raceus.co.il and www. A pull request
deploys to a `pr-N` branch instead and gets a preview URL, so you can look at a
change before the apex moves.

`.github/workflows/deploy.yml` needs two repository secrets.

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | token with Account, Cloudflare Pages: Edit, scoped to the account |
| `CLOUDFLARE_ACCOUNT_ID` | the Cloudflare account id |

Neither can write DNS or Cloudflare Access, so adding a custom domain stays a
dashboard action. The workflow replaces `__BUILD_SHA__` in `index.html` with the
deployed commit, so the live page states which commit it is serving.

## Fonts

Archivo and Azeret Mono, latin subset, self-hosted in `public/fonts/`. Archivo is
one variable file covering weight 400 to 800 and width 62% to 125%. The Azeret
Mono file covers weight 300 to 500. Both are under the SIL Open Font License 1.1,
reproduced in `public/fonts/OFL.txt`.

Neither font ships a Hebrew codepoint. That is why the Hebrew assistant's plate
reads `HEBREW`, and why its `א` monogram falls back to a system font.

## Licence

MIT for the site code, see `LICENSE`. The fonts keep their own licence.
