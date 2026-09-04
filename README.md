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
| `sym` | monogram behind the plate |
| `tone` | 0 to 1 exposure of the print, set by eye for rhythm across a row |
| `group` | `work` or `services`, which row it sits in |
| `tier` | `open`, `access`, `service` or `private` |
| `host` | hostname, or `null` |
| `url` | link target, or `null` when nothing opens |
| `blurb` | one line, used as the caption when there is no host |
| `long` | the detail sheet body, `\n\n` between paragraphs |
| `stack` | the chips in the detail sheet |
| `repo` | optional source link |

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
