# Homeschool Arcade

Learning games built for our homeschool, live at **https://homeschoolarcade.games**.

Every game on the site follows the same plan:
- **Easy to pick up and fun to play.** Very little reading for the youngest players, plus read-aloud where it helps.
- **Practices a core school skill** (math, geography, and more as games are added).
- **Has a leaderboard** on the one shared Homeschool Arcade high-score sheet (see [LEADERBOARD-SETUP.md](LEADERBOARD-SETUP.md)).
- **Safe for kids:** no ads, trackers or accounts. Only 3-letter initials are ever saved online.
- **No build tools:** plain HTML, CSS and JavaScript that also runs by double-clicking a file.

New games are added over time. See "Adding a new game" below.

| Game | Subject | Ages | Leaderboards |
|---|---|---|---|
| **Shred the Globe** | Geography (skate-themed) | Middle school | 8 boards (mode × game × World/USA) |
| **Rocket Builder** | Math: + − × ÷ (space adventure) | Elementary | 3 boards (Cadet, Pilot, Captain) |
| **Squirrelock Holmes** | Logic: deduction (squirrel mystery) | High school | 3 boards (Easy, Medium, Hard) |

## Play it on this computer

Open the `homeschoolarcade.games` folder and **double-click `index.html`**. It opens in your web browser. You don't need to install anything or be online.

(Optional: to preview it the way it will look once it's hosted, run `tools\serve.ps1` in PowerShell, then open http://localhost:8080/.)

On the home page, each game card shows its subject (black tag) and age level (red tag), and the **About** button (top right) opens a short note about the site. The same info is stored on the card as `data-subjects` and `data-ages`, so a sort or filter bar can be added once there are more games.

## Shred the Globe

| | |
|---|---|
| **Spot Hunt** | We name a country or state, and you click it on the map. |
| **Flag Flip** | You see the flag, the population and a fun fact, then pick the right place from 5 choices. |
| **World / USA** | 193 UN member countries, or all 50 states. |
| **Standard / Skate Mode** | Skate Mode adds skate-scene facts and local legends (32 countries, 22 states with documented skate history). |
| **Leaderboards** | There are 8 boards (Top 10 each), with 3-letter arcade initials. Blocked words are listed in `BLOCKED` in `js/app.js`. |

Each run is 15 rounds: 1 point per correct answer, and the faster time breaks ties. The clock pauses while the fact cards are open.

**Where scores are saved:** on the shared Homeschool Arcade leaderboard (see "Leaderboards" below). If the internet is down, each device keeps its own scores so the game always works.

## Rocket Builder

A little space explorer crash-lands and has to rebuild the rocket. There are 4 planets, one for each kind of math:

| Planet | Math | Hidden power-ups |
|---|---|---|
| 1 · Sprout (green meadow) | Adding (+) | Zoom Shoes (run faster), Spring Boots (hop over 1 tile of water) |
| 2 · Frost (snow and ice) | Subtracting (−) | Power Laser (stronger, breaks cracked rocks), Extra Heart |
| 3 · Ember (lava desert) | Multiplying (×) | Rocket Boots (hop over 2 tiles), Extra Heart |
| 4 · Fungi (glowing mushrooms) | Dividing (÷) | Mega Laser (strongest), Gem Magnet |

- **Rocket parts:** each planet hides 4 part crates. Solve 3 problems to open a crate. The last part is guarded by a big boss alien. With all 4 parts, walk back to the rocket to blast off. The rocket keeps every part, so it grows over the 4 planets.
- **Aliens:** zap them first with the laser (Space) to start a battle without getting hurt. Each right answer fires your laser. A wrong answer costs a heart, and then the child tries the same problem again with a picture hint. With no hearts left, the explorer goes back to the rocket with full hearts, and nothing found is lost. Standing at the rocket also refills hearts.
- **Levels:**
  - Cadet ★ (ages 5–6): adding and taking away within 10, times and divide with 1–5. Picture hints are always on, and an arrow points to the next part.
  - Pilot ★★ (ages 7–8): within 20, the 1–5 times tables up to ×10, and some "missing number" problems (7 + ? = 12).
  - Captain ★★★ (ages 9–10): within 100, times tables up to 10 × 10, and matching division.
- **Picture hints:** the light-bulb button shows dots for adding and taking away, tens-and-ones blocks for big numbers, arrays of rows for times, and equal groups for dividing.
- **Very little reading:** the speaker button reads each problem out loud, and "Talk" in the pause menu reads everything automatically (on by default). Music, sound and Talk can each be turned off in the pause menu.
- **Controls:** arrow keys or WASD to walk, Space to zap, 1–4 (or click, or Enter on the outlined answer) to answer, M for the map, Esc to pause. Space never picks an answer, so zapping can't answer a problem by accident. On a tablet or phone, there's an on-screen joystick and a zap button.
- **Saving:** progress saves in the browser on this device, and "Keep going" picks up on the same planet.
- **Leaderboard:** one Top 10 per level (Cadet, Pilot, Captain) on the shared arcade leaderboard. The score is the number of stars collected across all 4 planets, and a faster play time breaks ties (the clock stops while the game is paused). A score that makes the Top 10 gets arcade-style initials at the end, and "★ TOP 10" on the title screen shows the boards.
- **For grown-ups:** add `?debug&world=3&level=1` to the game's address to jump to a planet (world 1–4, level 0–2). A run started this way is a **practice run**: it skips planets, so its score never goes on the leaderboard. In debug mode the browser console also confirms that every part on every planet can be reached.

All the art, music and sound effects are made by the game's own code, so there are no image, sound or font files to download.

## Squirrelock Holmes

A point-and-click mystery that teaches logic. Squirrelock Holmes and Dr. Walnut Watson (with their landlady Mrs. Nutson at 221B Oak Street, and their rival Professor Gnawriarty) solve cases in Victorian squirrel London. The player examines things in each illustrated room, questions suspects, connects clues into deductions, and names the culprit.

| Level | Story | Rooms | Suspects |
|---|---|---|---|
| Easy ★ | **The Gilded Acorn**: a prize vanishes from a locked case | Trophy Room | Lady Bushwick, Pip Chestnut, Colonel Thistlewick |
| Medium ★★ | **The Forged Seal**: a sealed order empties the hospital fund | Manager's Office, Counting Room (locked) | Mr. Cashew, Miss Sorrel, Barnaby Burrows, Percy Pinecroft |
| Hard ★★★ | **The Night Bushy Ben Stopped**: the clock tower is sabotaged | Gear Room, Workshop (locked), Paddingtail Station (locked) | Professor Gnawriarty, Master Tock, Wren Whiskerton, Alderman Rootley, Madame Plume |

- **Three versions of every story.** Each version has a different culprit, method, clues, clue places and red herrings. The game picks one at random and never repeats the last one played.
- **What it teaches:** every close-up separates the *observation* (what we see) from the *inference* (what it might mean). Pinning two notebook entries and pressing Connect makes a *deduction*, labeled deductive, inductive, ruling out, timeline or alibi. Every wrong answer is ruled out by at least one clue, and each case has red herrings (Hard adds a convincing false theory). The **Logic Handbook** on the title screen defines the terms, with sources (Merriam-Webster, Britannica, the Internet Encyclopedia of Philosophy, and Conan Doyle's *The Sign of Four* on Wikisource, checked November 2026).
- **Locks and clue chains:** a padlock means something must be found first (Easy 1 lock deep, Medium 2, Hard 3, with locked rooms).
- **Solving:** the Solve! button is always there. A wrong accusation adds 1:00, and Watson names the clue that rules it out (without giving away the answer). The right answer only closes the case once the notebook holds the proof; if it doesn't yet, Watson says so with no penalty. "Ask Watson" gives a hint for +0:30.
- **CASE CLOSED:** Holmes walks through the reasoning step by step, shows which red herrings were traps, then shows the time.
- **Leaderboard:** one Top 10 per level (Easy, Medium, Hard), fastest time with penalties. Each solve counts as 1 point on the shared sheet, so the board is simply sorted by time.
- **Access:** keyboard play (Tab between things to examine, N notebook, S solve, 1–3 rooms, P or Esc pause), labels and icons as well as colors, reduced motion respected, and a mute button. **Read aloud:** every dialogue line, clue close-up, briefing card and explanation step has a "Read aloud" button, and the "Read aloud: On/Off" switch (title screen corner, or the pause menu) reads everything automatically. It uses the voice built into the device.
- **Art:** every room and character is drawn by code (SVG), with no image files. Each room's drawing is its own file in `js/art/rooms/`, so it can be swapped for illustrated art later; just keep the spot names.
- **Adding a case:** copy a `case-*.js` file in `squirrelock-holmes/cases/<story>/`, change the data, add its path to `cases/manifest.js`, then open `squirrelock-holmes/validate.html`. The checker plays every case and lists any problem: clues that can't be reached, a right answer without proof, a wrong answer nothing rules out, Watson giving away the culprit, two clue badges that would sit on top of each other, or a level's counts being off. No code changes are needed.
- **For grown-ups:** add `?debug` to the game's address to run the checker in the browser console, or `?debug&case=bushy-ben-b` to open one exact version as a practice run (never saved to the leaderboard).

## Leaderboards (one sheet for every game)

All games save high scores to **one Google Sheet you own** (renamed "Homeschool Arcade Leaderboard"), through a small Google Apps Script. Each game has its own boards in the same **Scores** tab, and the **Board** column says which game a row belongs to. Shred the Globe's boards start with `standard:` or `skate:`, and every other game's boards start with the game's name, like `rocket-builder:cadet`.

- The script's web address is set in one place: `shared/arcade-config.js`.
- Games use `shared/leaderboard.js` to read the Top 10 and save scores. If the sheet can't be reached, scores are kept on the device instead.
- The script (`tools/leaderboard/Code.gs`, version 4, which adds Squirrelock Holmes) lists every game's boards and what a believable score looks like. To check which version is live, add `?action=ping` to the end of the script's web address (not the website's).
- Setup, updates and managing scores: [LEADERBOARD-SETUP.md](LEADERBOARD-SETUP.md).

## Security & privacy

Checked across the whole site in November 2026:

- **What leaves the device:** only leaderboard requests to Google (which board to show, and a new score with 3-letter initials, points and time). There are no names, emails, locations, ads, trackers or analytics. Google can see each visitor's internet address when the leaderboard loads, like any website.
- **What stays on the device:** game progress, settings, the last initials typed, and offline scores, in the browser's own storage.
- **Read-aloud** uses the device's built-in voice. Some browsers use an online voice, which sends only the game's own words (like "7 plus 5") to that voice service.
- **The pages only run code from this site:** each game page has a security policy that blocks outside scripts and only lets data go to the leaderboard. The home page runs no scripts at all, so its About pop-up uses the browser's built-in pop-up feature.
- **Leaderboard text can't inject anything.** Rocket Builder draws everything as pixels, and Shred the Globe and Squirrelock Holmes make all leaderboard text safe before showing it. Initials are letters A–Z only (checked in the game and again by the script), and rude 3-letter words are blocked.
- **The leaderboard script can only touch its own spreadsheet** (`@OnlyCurrentDoc`). It only accepts the known game boards and believable scores, at most 30 saves a minute, and it keeps the best 50 scores per board.
- **A damaged or hand-edited Rocket Builder save** is ignored (the game starts fresh) instead of crashing, and impossible values are reset.
- **Known limit:** like any site without logins, a determined tech-savvy person could still send a fake but believable score. If one shows up, delete its row in the sheet.
- **The code history is clean:** no emails, passwords, keys or computer paths have ever been committed, and commits use GitHub's private no-reply address.

## Adding a new game

A checklist so every new game fits the arcade:

1. Make a folder for it, like `my-game/`, with its own `index.html`, an icon in `img/icon.svg`, and a security policy line like Rocket Builder's. Keep all files on this site, with no outside scripts or fonts.
2. Add a card on the home page `index.html` with its subject and age tags (`data-subjects`, `data-ages`).
3. Leaderboard:
   - Load `../shared/arcade-config.js` and `../shared/leaderboard.js` in the game.
   - Pick board names that start with the game's name (`my-game:...`).
   - Add the game to `GAMES` in `tools/leaderboard/Code.gs`.
   - After pushing, re-paste the script and publish a new version (steps in LEADERBOARD-SETUP.md).
4. Keep reading light for young players, make sure it works with touch (and keep on-screen buttons clear of phone system bars), and add a "Back to arcade" link.
5. Add the game to the table at the top of this README and to the folder guide.

## Where Shred the Globe's facts come from

- Every fact shows its source link in the game. Facts were checked in November 2026 against Encyclopaedia Britannica and Wikipedia. Anything that couldn't be confirmed was left out.
- Country populations come from the World Bank, 2025 estimates.
- State populations come from the U.S. Census Bureau (Vintage 2025, July 1, 2025).
- Maps: Natural Earth and U.S. Census boundaries (public domain). Flags: flagcdn.com / Flagpedia (public domain).
- Country codes and regions used when building the data: [mledoze/countries](https://github.com/mledoze/countries) (Open Database License).

## Folder guide

```
index.html                 Homeschool Arcade home page (with the About pop-up)
img/arcade-icon.svg        the arcade icon shown in the browser tab
shared/
  arcade-config.js         the ONE leaderboard address used by every game
  leaderboard.js           leaderboard helper any game can use (falls back to the device)
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
rocket-builder/
  index.html               the game (everything is drawn on one canvas)
  js/engine.js             screen, pixel font, keyboard/touch, sound, music, read-aloud, saving
  js/art.js                pixel-art explorer, aliens, trees, icons and the rocket
  js/mathgen.js            makes the math problems and the picture hints
  js/worlds.js             the 4 planet maps and what is hidden where
  js/play.js               walking, hopping, lasers, aliens, crates, HUD, map
  js/ui.js                 math panel, item cards, pause menu
  js/scenes.js             title, level picker, planet intro, blast-off, ending
  js/scores.js             Top 10 screen and initials (uses the shared leaderboard)
  js/main.js               saving progress and the main loop
squirrelock-holmes/
  index.html               the game page
  validate.html            the case checker (open it after changing a case)
  css/style.css            look & feel (violet Logic accent, site fonts)
  js/core.js               saving, sound, read-aloud, the timer, the case list
  js/rules.js              the rules of a case (shared by the game and the checker)
  js/play.js               rooms, things to examine, witnesses, hints, accusing
  js/notebook.js           the notebook and Connect (deductions)
  js/dialogue.js           the talking-portrait dialogue box
  js/screens.js            title, case picker, briefing, Solve, CASE CLOSED, Logic Handbook
  js/scores.js             Top 10 boards and initials (uses the shared leaderboard)
  js/fx.js                 sparks, shake, the DEDUCTION! banner
  js/validate.js           the case checker's tests
  js/art/                  drawing kit, clue props, character portraits, one file per room
  cases/manifest.js        the list of case files
  cases/<story>/           story.js (rooms, suspects, briefing) + case-a/b/c.js (the versions)
tools/
  source/*.json            the hand-checked country & state facts (edit these)
  build-data.ps1           rebuilds data/geo-data.js (can refresh populations)
  serve.ps1                optional local preview server
  raw/                     downloaded source datasets
  leaderboard/Code.gs      the shared-leaderboard script (goes in a Google Sheet)
LEADERBOARD-SETUP.md       how to turn on the shared leaderboard
```

The leaderboard address lives in `shared/arcade-config.js`, one place for every game.

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
