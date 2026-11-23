# Shared leaderboard setup

GitHub Pages hosts the games, but it can't store anything on its own. To give every player the same high-score boards, **every game in Homeschool Arcade saves its scores to one Google Sheet that you own**. It's free and uses no extra accounts, and you can see, fix or delete any score right in the spreadsheet. Each game gets its own boards in the same **Scores** tab. The first column ("Board") says which game a row belongs to: Rocket Builder rows start with `rocket-builder:`.

The web address of that sheet's script lives in one place for all games: `shared/arcade-config.js`.

Until the leaderboard is set up (or whenever the internet is down), the games still work, but each device keeps its own scores.

## Update your existing leaderboard for all games (about 3 minutes)

Your leaderboard was first set up for Shred the Globe. The script needs this update before Rocket Builder (and future games) can save to the same sheet. The web address stays the same, and Shred the Globe's existing scores are kept.

1. Open your leaderboard spreadsheet and click **Extensions → Apps Script**.
2. Select all the code in the editor (Ctrl + A) and delete it.
3. Open this file, select all of it, copy it, and paste it into the editor:
   https://raw.githubusercontent.com/RobotoJerome/homeschool_arcade/main/tools/leaderboard/Code.gs
   The second line of the right version reads **"Homeschool Arcade — one shared online leaderboard for EVERY game"**. If it says "Shred the Globe — shared online leaderboard", that's the old version: wait a minute and reload the page.
4. Click the **Save** 💾 icon.
5. Click **Deploy → Manage deployments**, click the pencil ✏️ icon, set **Version** to **New version**, and click **Deploy**. (If Google asks you to approve access again, use the same Advanced → Go to … (unsafe) → Allow steps as in part 3 below.)
6. Check it: open your web app address with `?action=ping` added to the end. It should say `{"ok":true,"version":3,"games":["shred-the-globe","rocket-builder"]}`.

Until you do this, Rocket Builder keeps its scores on each device, and Shred the Globe keeps working as before.

**Optional: rename things to match.** You can rename the spreadsheet (for example **Homeschool Arcade Leaderboard**) and the Apps Script project (click its name at the top of the code editor). Neither changes the web address or breaks anything. Just don't rename the **Scores** tab, and don't add, remove or reorder its columns.

## Adding a future game

Each new game gets an entry in the `GAMES` list near the top of `tools/leaderboard/Code.gs`: its board names, and what a believable score looks like. After that change is pushed, repeat steps 1–6 above. Claude does the code part. You only re-paste the script and publish a new version.

---

# First-time setup (one time, about 5 minutes)

## 1. Make the spreadsheet

1. Sign in to Google, then go to **https://sheets.new** to open a new blank spreadsheet.
2. Click "Untitled spreadsheet" and rename it **Homeschool Arcade Leaderboard**.

## 2. Add the leaderboard script

1. In the spreadsheet menu, click **Extensions → Apps Script**. A code editor opens in a new tab.
2. Delete everything in the editor, which starts with `function myFunction`.
3. Open this file, select all of it, and copy it:
   https://raw.githubusercontent.com/RobotoJerome/homeschool_arcade/main/tools/leaderboard/Code.gs
4. Paste it into the editor, then click the **Save** (💾) icon.

## 3. Approve it (first run)

1. In the toolbar, make sure the function dropdown says **setup**, then click **▶ Run**.
2. Click **Review permissions** and pick your Google account.
3. Google shows *"Google hasn't verified this app."* That's normal because it's your own script. Click **Advanced**, then **Go to … (unsafe)**, then **Allow**.
4. The log at the bottom says "Ready!", and a **Scores** tab appears in your spreadsheet.

## 4. Publish it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon ⚙ next to "Select type" and choose **Web app**.
3. Fill in the settings:
   - Description: `Leaderboard`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** and copy the **Web app URL**. It looks like `https://script.google.com/macros/s/…/exec`.

## 5. Connect the game

Send that URL to Claude, which will add it to `shared/arcade-config.js` (used by every game) and push the update.

To do it yourself instead, edit `shared/arcade-config.js` on GitHub and paste the URL between the quotes on the `leaderboardUrl:` line.

---

## Managing scores

- Every saved score is a row in the **Scores** tab.
- **To remove a score**, delete its row. The game shows the change within about a minute.
- The spreadsheet stores only initials, points, time and date: no names, emails or locations.

## Built-in protections

- **One spreadsheet only.** The script's `@OnlyCurrentDoc` line means Google lets it use only this leaderboard spreadsheet, never your other Sheets, Drive files or email.
- **Two actions only.** Visitors can read the Top 10 lists and submit a score. They can't see the spreadsheet itself, pick a different sheet, or run their own code.
- **Checked scores.** Initials must be 1–3 letters (blocked words are rejected by the server too), and each game has its own "does this score make sense?" check: for example, at most 15 points in Shred the Globe, and no impossibly fast times in any game.
- **Spam limits.** At most 30 scores can be saved per minute. Each board keeps only its best 50 scores, so the sheet can't grow forever.

A determined tech-savvy player could still fake a score, as on any website without user logins. If that happens, just delete the row.

## Keeping it safe

- **Don't share edit access** to the leaderboard spreadsheet. Anyone who can edit it can also edit the script, which runs under your account. Leave its sharing set to **Restricted**.
- Use **2-Step Verification** on your Google account.
- **To shut the leaderboard off instantly:** in Apps Script, click **Deploy → Manage deployments → Archive**. The games then quietly fall back to keeping scores on each device.
- **Permissions:** Google should only list *"View and manage spreadsheets that this application has been installed in."* To review it, go to **https://myaccount.google.com/connections** and find your leaderboard project. It's listed under its Apps Script project name, such as "Homeschool Arcade Leaderboard" or the older "Shred the Globe Leaderboard".

## Updating the script later

Whenever the script changes (for example, when a new game is added), follow steps 1–6 in "Update your existing leaderboard for all games" at the top of this guide. The web address never changes, so the games keep working.
