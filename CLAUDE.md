# Homeschool Arcade: guide for AI assistants

Learning games for a homeschool family, live at https://homeschoolarcade.games (GitHub Pages, branch `main`, folder root). The owner is a parent, not a developer: explain things in plain language and keep upkeep low.

## Direction (every game follows this)
- Easy to pick up, fun, and practices a core school skill. Keep reading very light for young players, and offer read-aloud where it helps.
- **Every game has a leaderboard** on the ONE shared Google Sheet (see "Leaderboard" below).
- Each game gets a card on `index.html` with `data-subjects` / `data-ages` tags.
- Original work only: no copied characters, logos or look from existing games or brands.
- Facts shown to kids must be checked against real sources and cited (Shred the Globe shows a source link for every fact).

## Hard rules
- **No build tools.** Plain HTML/CSS/JS with classic `<script>` tags (no ES modules), so pages also work by double-clicking. The machine has no Node or Python; tooling is PowerShell (`tools/*.ps1`).
- **Security policy on every page:** keep each page's CSP meta tag. Load scripts only from this site (`'self'`), self-host fonts and images, and allow `connect-src` only for `https://script.google.com` and `https://script.googleusercontent.com`. The home page runs no scripts (`script-src 'none'`).
- **Privacy:** no ads, trackers, analytics or accounts. Online data is limited to leaderboard rows (board, 3-letter initials, points, time). Never put the owner's name, email or computer paths in files or commits.
- **Git:** commit and push only when the owner asks. Commit as `RobotoJerome` with the GitHub no-reply email that's already in the repo's local git config. After a push, check that the live site updated (Pages takes about 30–60 seconds).

## Leaderboard (one sheet for all games)
- Web app URL: `shared/arcade-config.js` (`ARCADE_CONFIG.leaderboardUrl`), the only place it lives.
- Client helper: `shared/leaderboard.js` (`ArcadeBoards.list / add / qualifies / blocked`). It falls back to device storage when the sheet is unreachable or doesn't know a board. Shred the Globe has its own older client in `js/app.js` and reads the URL via `js/config.js`.
- Server: `tools/leaderboard/Code.gs` (v3). `GAMES` maps each game to its board names and a `check(points, outOf, timeMs)` function. Shred's boards keep their original names (`standard:` / `skate:`); new games use `<game-folder>:<board>`.
- A new game means: add it to `GAMES`, push, then the owner pastes Code.gs into Apps Script and publishes a **New version** under Manage deployments (the URL stays the same). Steps are in `LEADERBOARD-SETUP.md`.
- **Never post test scores to the live sheet.** Stub `ArcadeBoards` in the page, or run Code.gs against fake Google services on a page without a CSP (for example `README.md` served by `tools/serve.ps1`).

## Testing
- Local server: `.claude/launch.json` runs `tools/serve.ps1` on port 8080.
- Rocket Builder: `?debug&world=N&level=L` jumps to a planet (practice run, never posted to the leaderboard) and logs a check that every part can be reached. When the browser pane is hidden, animation pauses, so step the loop by hand (`RB.scene.update(dt)`, then draw).

## Where things are
See the folder guide in `README.md`. Games: `shred-the-globe/` (geography, middle school) and `rocket-builder/` (math, elementary).
