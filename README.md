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
| `logoImage` | omit for a mask mark; a filename here loads `public/logos/<logoImage>` as-is |
| `brand` | the mask's colour on the plate and in the sheet; omit it for an `image` mark |
| `tone` | 0 to 1 exposure of the print, set by eye for rhythm across a row |
| `group` | `work` or `services`, which row it sits in |
| `tier` | `open`, `access`, `service`, `source` or `private` |
| `host` | hostname, or `null` |
| `url` | link target, or `null` when nothing opens |
| `blurb` | one line, used as the caption when there is no host |
| `long` | the detail sheet body, `\n\n` between paragraphs |
| `stack` | the chips in the detail sheet |
| `repo` | optional source link |
| `release` | optional; puts the project in the downloads section, see below |

## Logos

Every card has a mark in `public/logos/`. Eight of them are plain SVGs on a 32
by 32 grid that paint with `currentColor` and carry no background, so one CSS
`color` decides how they read:

- **Wherever the plate appears, the mark is the project's own colour**, from the
  card's `brand` field. The poster on the home row and the small plate in the
  detail sheet are the same drawing in the same colour, so a card does not
  change identity when you open it.
- **On the launch tiles the mark stays grey**, brightening to chalk on hover.
  That strip is for hitting a target fast, not for looking at, and six brand
  colours in one narrow row would fight the numbers you actually aim with.

Exposure is still what tells you whether a card opens here: a closed card's
plate is printed down, its caption is dimmer and its marker is hollow. That is a
brightness signal, so the colour on the mark does not compete with it.

Those eight are applied as CSS masks rather than `<img>`, which is what makes a
single file work in both places. The fill sits behind an `@supports` guard: with
no mask support the mark is absent rather than a solid block. The other two keep
their own colours and load as images, skipping all of this.

Seven of the ten are the project's own logo, taken from the project's own repo.
Where the real mark knocks a shape out of a solid field, the SVG uses an inner
`<mask>` so the hole is real transparency and survives the CSS mask.

| card | mark | where it came from |
|---|---|---|
| `terminal` | prompt chevron and cursor bar | `raceus-portfolio/public/favicon.svg`, path copied |
| `saas` | fork and knife | the platform's own `favicon.svg`, path copied |
| `ccb` | speech bubble, three dots | `claude-chat-bridge/web/icons/icon-512.png`, traced |
| `sukartask` | check knocked out of a disc | `sukartask/scripts/gen-icons.ts`, same numbers |
| `plan` | sheet with a spine | `sukarplan/scripts/gen-icons.py`, same numbers |
| `sukarfleet` | six peers around an accent hub | `sukarfleet-tray/brand/icon-reduced.svg`, used unmodified |
| `t3` | the T3 Code app icon itself | shipped PNG, used unmodified |

The two generated from a script are exact: the SVG uses the radii and offsets
the generator computes, so the mark here and the mark the app ships are the same
drawing at a different size.

**Two marks are already more than one colour, so the page does not tint them.**
Those cards set `logoImage` and the file loads as-is: T3 Code's shipped app icon,
and sukarfleet's primary mark, whose light hexagon and accent hub only read as a
hierarchy because they are two colours. An image mark takes the same box and the
same drop shadow as a mask mark and nothing else, and it carries no `brand`
field, since there is nothing to tint. sukarfleet ships several variants and its
own brand notes assign them by size: `icon-reduced.svg` is the 24 to 48 pixel UI
mark, and the plate draws at 38. The primary mark was tried first and its spokes
turned to mud at that size.

Three cards have no logo to reuse, because those projects have never had one:
`bugtracker`, `workspace` and `ssh`. Their marks are original and say something
about the project instead. If any of the three grows a real logo, replace the
file and delete the invented one.

Brand colours live in the card's `brand` field in `catalog.json`, and nowhere
else. They come from what the app actually shows today. `#8b9cff` is the accent
constant in sukarplan's generator; `#884ab5` is the dominant pixel of the chat
bridge icon; sukartask is `#ffd60a`, the `--accent` its stylesheet sets, not the
green its own icon generator still draws. A card with a `logoImage` has no
`brand`, because its mark already carries its own.

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

**`source`.** Public code and public releases, with nothing running on this
domain. Hollow marker, under-exposed, clicking opens the detail sheet, and the
sheet's Downloads button jumps to the release block. sukarfleet is the one card
on this tier: it is published, and there is still nothing here to open.

**`private`.** Described but not published. Hollow marker, under-exposed,
clicking opens the detail sheet.

Brightness is the status channel. The only colour on the page is each project's
own mark, which says who a card is and never what it does, so exposure alone
still tells you what is reachable. An `open` or `access` card also carries a
small `i` button for its detail sheet, and joins the launch strip at the top of
the page, numbered in catalogue order.

## Adding a card

Append an object to `public/catalog.json`. Nothing else changes.

- Pick a `group` and a `tier`. `open` and `access` need a `url`. `service`,
  `source` and `private` must not have one. `source` is for a project whose code
  and releases are public while nothing of it runs on this domain.
- Keep `plate` in Latin characters. The self-hosted fonts carry the latin subset
  only, so anything else falls back to a system font.
- Set `tone` by eye against its neighbours. Higher is brighter.
- `long` is not searched. Put anything people should be able to find in `title`,
  `name`, `host`, `blurb` or `stack`.

Order in the file is the order on the page and the order of the launch strip.

## Downloads

A card with a `release` object also gets a block in the downloads section, at the
foot of the home view and behind the rail's fifth button. Today that is
sukarfleet and nothing else, and the section disappears entirely if no card
carries one.

```jsonc
"release": {
  "version": "v0.1.0",
  "date": "2026-09-05",
  "headline": "one line under the title",
  "command": "curl -fsSL https://.../get.sh | sh",   // optional
  "commandNote": "what that command does and what it does not need",
  "platforms": [
    { "os": "Linux", "arch": "x86_64", "level": "supported",
      "what": "Tray console", "size": "12 MB",
      "url": "https://...", "note": "one paragraph, honest" }
  ],
  "links": [ { "label": "Release notes", "url": "https://..." } ]
}
```

The install command comes first because it is the route the project itself
recommends, and the copy button falls back to selecting the text where the
clipboard API is unavailable. Each platform is one lane. `level` is the word
the project uses about its own testing, and anything other than `supported`
prints the lane down, the same exposure signal the plates use: nobody should
download an untried build without being told it is one.

Sizes and support levels are written by hand, so they are a claim about the
release named in `version` and not about whatever the tag points at later. When
the version changes, both change with it.

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

Neither font ships a Hebrew codepoint, so every plate word is Latin only.

## Licence

MIT for the site code, see `LICENSE`. The fonts keep their own licence.
