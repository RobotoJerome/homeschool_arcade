# Homeschool Arcade

Learning games built for our homeschool. The first game is **Shred the Globe**, a skate-themed geography game.

## Play it on this computer

Open the `homeschoolarcade.games` folder and **double-click `index.html`**. It opens in your web browser. You don't need to install anything or be online.

(Optional: to preview it the way it will look once it's hosted, run `tools\serve.ps1` in PowerShell, then open http://localhost:8080/.)

On the home page, each game card shows its subject (black tag) and age level (red tag). The same info is stored on the card as `data-subjects` and `data-ages`, so a sort or filter bar can be added once there are more games.

## Shred the Globe

| | |
|---|---|
| **Spot Hunt** | We name a country or state, and you click it on the map. |
| **Flag Flip** | You see the flag, the population and a fun fact, then pick the right place from 5 choices. |
| **World / USA** | 193 UN member countries, or all 50 states. |
| **Standard / Skate Mode** | Skate Mode adds skate-scene facts and local legends (32 countries, 22 states with documented skate history). |
| **Leaderboards** | There are 8 boards (Top 10 each), with 3-letter arcade initials. Blocked words are listed in `BLOCKED` in `js/app.js`. |

Each run is 15 rounds: 1 point per correct answer, and the faster time breaks ties. The clock pauses while the fact cards are open.

**Where scores are saved:** once the shared leaderboard is connected, every player sees the same Top 10 boards. The scores live in a Google Sheet you own, and setup takes about 5 minutes: see [LEADERBOARD-SETUP.md](LEADERBOARD-SETUP.md). Until then, or whenever the internet is down, each device keeps its own scores so the game always works.

**Security & privacy:**
- The leaderboard script can only use its own spreadsheet, and visitors can only read the Top 10 and submit checked scores.
- The game pages tell the browser to run code only from this site, and to send data only to the leaderboard.
- There are no ads, trackers or analytics. The only player info stored is 3-letter initials.

See "Keeping it safe" in [LEADERBOARD-SETUP.md](LEADERBOARD-SETUP.md).

## Where the facts come from

- Every fact shows its source link in the game. Facts were checked in November 2026 against Encyclopaedia Britannica and Wikipedia. Anything that couldn't be confirmed was left out.
- Country populations come from the World Bank, 2025 estimates.
- State populations come from the U.S. Census Bureau (Vintage 2025, July 1, 2025).
- Maps: Natural Earth and U.S. Census boundaries (public domain). Flags: flagcdn.com / Flagpedia (public domain).
- Country codes and regions used when building the data: [mledoze/countries](https://github.com/mledoze/countries) (Open Database License).

## Folder guide

```
index.html                 Homeschool Arcade home page
shred-the-globe/
  index.html               the game
  css/style.css            look & feel
  js/app.js                game logic
  data/geo-data.js         facts + populations (generated, see tools/)
  data/skate-data.js       Skate Mode facts & skaters (edit directly)
  data/world-topo.js       world map shapes
  data/us-topo.js          US state shapes
  flags/                   243 flag images
  fonts/                   self-hosted fonts + licenses
tools/
  source/*.json            the hand-checked country & state facts (edit these)
  build-data.ps1           rebuilds data/geo-data.js (can refresh populations)
  serve.ps1                optional local preview server
  raw/                     downloaded source datasets
  leaderboard/Code.gs      the shared-leaderboard script (goes in a Google Sheet)
LEADERBOARD-SETUP.md       how to turn on the shared leaderboard
```

The leaderboard address lives in `shred-the-globe/js/config.js`.

## Updating later (optional)

To fix or change a country or state fact, edit `tools/source/country-facts.json` or `state-facts.json`. Then run:

```
powershell -ExecutionPolicy Bypass -File tools\build-data.ps1
```

To refresh populations in a future year:

```
powershell -ExecutionPolicy Bypass -File tools\build-data.ps1 -Download -CensusYear 2026
```

Set `-CensusYear` to the newest year the Census Bureau has published.

## Hosting

The site is plain HTML, CSS and JavaScript with no build step and nothing to install. The code lives at https://github.com/RobotoJerome/homeschool_arcade.

The site is published with GitHub Pages at **https://homeschoolarcade.games** (domain registered at Namecheap).

- **GitHub Pages:** in the repo's **Settings → Pages**, choose **Deploy from a branch**, then **main** and **/ (root)**. The custom domain is `homeschoolarcade.games`, and "Enforce HTTPS" is on. The `CNAME` file in this folder stores the domain, and `.nojekyll` tells GitHub to serve the files as-is.
- **Namecheap DNS** (Domain List → Manage → Advanced DNS):

  | Type | Host | Value |
  |---|---|---|
  | A Record | `@` | `185.199.108.153` |
  | A Record | `@` | `185.199.109.153` |
  | A Record | `@` | `185.199.110.153` |
  | A Record | `@` | `185.199.111.153` |
  | AAAA Record | `@` | `2606:50c0:8000::153` |
  | AAAA Record | `@` | `2606:50c0:8001::153` |
  | AAAA Record | `@` | `2606:50c0:8002::153` |
  | AAAA Record | `@` | `2606:50c0:8003::153` |
  | CNAME Record | `www` | `robotojerome.github.io.` |
  | TXT Record | `_github-pages-challenge-RobotoJerome` | the code GitHub gives you when you verify the domain |

- **Backup address:** the site also answers at `https://robotojerome.github.io/homeschool_arcade/`, which redirects to the custom domain.
