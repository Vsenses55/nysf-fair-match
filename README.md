# NYS Fair Match

A match-3 puzzle game prototype for the Great New York State Fair, in the spirit of the fair's own
"Fair Match" game. Swap neighboring tiles to line up three or more, chain cascades for bigger scores,
and hit the score goal before the moves or timer run out.

**Play it:** https://vsenses55.github.io/nysf-fair-match/
**Repo:** https://github.com/Vsenses55/nysf-fair-match

## What's in the game

- **Screens:** Title -> How To Play (optional) -> Theme Selection -> Theme Objectives -> Game -> Level Complete / Try Again.
- **How To Play:** an auto-cycling three-slide carousel (swap 3, match 4 for a power-up, match 5 for a special power-up). The dots are clickable and the X returns to the title screen.
- **Themes and levels:** Food (Snack Shack, Snack Rush), Farm (Barnyard Bash, Farm) and Fun (Fun). Fun's second level isn't built yet.
- **Irregular board:** a ~9x9 grid whose shape comes from a 2D mask (`BOARD_MASK` in `js/assets.js`, `1` = playable cell, `0` = empty), so the board can be any blob shape.
- **Scoring:** a score goal, a move limit and a countdown timer per level. Each level has a bonus "focus" item that scores a multiplier and spawns more often.
- **Power-ups:** matching 4 or more creates a star tile.
- **Combo pop-ups:** themed reward graphics for cascades and big matches.
- **Sound:** click/hover/match/combo clips plus a synthesized ambient music-box loop.

## Tech

There is no framework, bundler or build step. It's plain static files, so any static host works.

| Piece | Technology |
| --- | --- |
| Markup and screens | HTML5, one page with show/hide "screens" |
| Styling and animation | Hand-written CSS: custom properties, Grid/Flexbox, keyframe animations, `clip-path`, CSS gradients and `drop-shadow` for crisp buttons |
| Game logic | Vanilla JavaScript (ES2020). `js/engine.js` is the DOM-free match-3 engine (match detection, swaps, gravity, refill, shuffle). `js/app.js` handles UI, input, cascades, HUD, timer and the screens |
| Audio | Web Audio API for the synthesized ambient loop (`js/audio.js`), plus short `.wav` clips |
| Fonts | Google Fonts: Holtwood One SC, Luckiest Guy, Rowdies |
| Art | Exported SVG and PNG assets from the design files (Figma, Illustrator, Photoshop) in `assets/img/` |
| Hosting | GitHub Pages, deployed from `main` |

### How the layout scales

Everything is authored on a fixed **1366x1024** canvas using exact design coordinates. `fitScreen()` in
`js/app.js` resizes each screen's wrapper to the real on-screen size and applies a matching
`transform: scale()`, so the layout shrinks to fit smaller windows without changing proportions. It never scales above 1.

## Project structure

```
index.html          all screens (markup)
css/styles.css      all styling
js/assets.js        tile art mapping, board mask, level definitions
js/engine.js        match-3 engine (no DOM)
js/audio.js         sound effects + ambient loop
js/app.js           UI, input, game flow, carousel, screen switching
assets/img/         tiles, backgrounds, buttons, logos, HUD art
assets/audio/       sound clips
```

## Run it locally

```bash
python3 -m http.server 8934
# then open http://localhost:8934
```

Serve it over HTTP rather than opening `index.html` directly, so audio and asset paths behave like they do in production.

## Editing notes

- **Levels:** add or tune levels in `LEVELS` in `js/assets.js` (tiles, score goal, moves, time, focus item and multiplier).
- **Board shape:** edit `BOARD_MASK` in `js/assets.js`.
- **Swapping art:** replace the file in `assets/img/` with the same filename. If you change an asset, bump the `?v=` number on the CSS/JS link in `index.html` so browsers pick it up.
- **GitHub Pages paths:** use paths like `assets/img/x.png` (relative to the page) in inline `style` attributes. A `../assets/...` path works locally but breaks on Pages.
- **Crisp HUD chrome:** prefer CSS shapes over exported image layers for buttons and panels. Scaling rasterized art softens it.
