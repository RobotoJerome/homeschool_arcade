# Shared leaderboard setup (one time, about 5 minutes)

GitHub Pages hosts the game, but it can't store anything on its own. To give every player the same high-score boards, Shred the Globe saves scores to a **Google Sheet that you own**. It's free and uses no extra accounts, and you can see, fix or delete any score right in the spreadsheet.

Until you finish these steps, the game still works, but each device keeps its own scores.

## 1. Make the spreadsheet

1. Sign in to Google, then go to **https://sheets.new** to open a new blank spreadsheet.
2. Click "Untitled spreadsheet" and rename it **Shred the Globe Leaderboard**.

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

Send that URL to Claude, which will add it to `shred-the-globe/js/config.js` and push the update.

To do it yourself instead, edit `shred-the-globe/js/config.js` on GitHub and paste the URL between the quotes on the `leaderboardUrl:` line.

---

## Managing scores

- Every saved score is a row in the **Scores** tab.
- **To remove a score**, delete its row. The game shows the change within about a minute.
- The spreadsheet stores only initials, points, time and date: no names, emails or locations.

## Built-in protections

- Initials must be 1–3 letters, and the blocked words are rejected by the server too.
- Scores must make sense (no more than 15 points, and no impossibly fast times).
- At most 30 scores can be saved per minute, which stops spam.

A determined tech-savvy player could still fake a score, as on any website without user logins. If that happens, just delete the row.

## If you change the script later

Click **Deploy → Manage deployments**, then the pencil ✏️ icon. Set **Version** to **New version** and click **Deploy**. The URL stays the same, so the game keeps working.
