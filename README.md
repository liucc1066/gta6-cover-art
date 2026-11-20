# Vice City Cover Maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/liucc1066/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/liucc1066/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn any photo into GTA 6-style cover art — the multi-panel poster look with
bold caption lettering and a Vice City sunset / neon colour grade — and export
it as a PNG to share. Built for the make.fun bounty
[gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01).

- **Any photo:** upload your own photos (they never leave your machine), or
  use a bundled sample. Fill several panels with one photo or a different
  photo per panel.
- **Crop & position:** click a panel, drag to pan its photo, scroll to zoom,
  or use the per-panel zoom slider.
- **Layouts:** hero + 2 side panels, a four-panel grid, or a single full-bleed
  photo.
- **Caption & grade:** editable big title and subtitle, four sunset/neon
  colour grades, procedural palm-tree silhouettes, halftone dots, scanlines
  and a vignette — all drawn on canvas, all original art.
- **Fast & easy:** live preview, then one-click PNG export in 1080 × 1080,
  1080 × 1350 and 1920 × 1080.

Everything is original: no Rockstar Games logo, wordmark, artwork or fonts.
Lettering uses system fonts only (Arial Black / Impact stack).

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-app.ts` library.

## License

MIT — see [LICENSE](LICENSE).
