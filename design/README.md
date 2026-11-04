# Profile design source

The profile is one canvas (`canvas.html`) rendered in Chromium, then cut into pieces that the README lays out flush, so each piece can be its own link.

```sh
npm i sharp                                   # only needed to regenerate
./shot.sh "$PWD/plate.png" 1848 "hide=no-digits%20no-graph"
node slice.mjs plate.png ../assets            # writes ../assets and ../README.md
```

Live parts are drawn over the plates at runtime:

- `assets/invite-plate.webp` is embedded in `/api/views/invite-card` on the portfolio, which adds the DWM Invite numbers.
- `assets/graph-plate.webp` is used by `scripts/build-graph.mjs`, which runs daily and adds the contribution graph and total.

Keep every row's widths adding up to exactly 100%, and keep the images on one line with `align="top"`, or gaps appear.
