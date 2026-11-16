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

- **One spreadsheet only.** The script's `@OnlyCurrentDoc` line means Google lets it use only this leaderboard spreadsheet, never your other Sheets, Drive files or email.
- **Two actions only.** Visitors can read the Top 10 lists and submit a score. They can't see the spreadsheet itself, pick a different sheet, or run their own code.
- **Checked scores.** Initials must be 1–3 letters (blocked words are rejected by the server too), and scores must make sense: no more than 15 points, and no impossibly fast times.
- **Spam limits.** At most 30 scores can be saved per minute. Each board keeps only its best 50 scores, so the sheet can't grow forever.

A determined tech-savvy player could still fake a score, as on any website without user logins. If that happens, just delete the row.

## Keeping it safe

- **Don't share edit access** to the leaderboard spreadsheet. Anyone who can edit it can also edit the script, which runs under your account. Leave its sharing set to **Restricted**.
- Use **2-Step Verification** on your Google account.
- **To shut the leaderboard off instantly:** in Apps Script, click **Deploy → Manage deployments → Archive**. The game then quietly falls back to keeping scores on each device.

## Updating the script (including the Nov 2026 security update)

If you set up the leaderboard before the security update, do this once. It locks the script to the leaderboard spreadsheet only.

1. Open the leaderboard spreadsheet and click **Extensions → Apps Script**.
2. If the project is still called "Untitled project", click that name and rename it **Shred the Globe Leaderboard**. That makes the next step easier.
3. Select all the code in the editor and delete it. Then paste in the latest version from
   https://raw.githubusercontent.com/RobotoJerome/homeschool_arcade/main/tools/leaderboard/Code.gs
   and click **Save** 💾.
4. Remove the old, broader permission:
   1. Go to **https://myaccount.google.com/connections**.
   2. Find **Shred the Globe Leaderboard** (or "Untitled project").
   3. Click it, then **Delete all connections** (or **Remove access**).
5. Back in Apps Script, choose **setup** in the toolbar and click **▶ Run**. Approve it again (Advanced → Go to … (unsafe) → Allow). This time Google should only ask to *"View and manage spreadsheets that this application has been installed in."*
6. Click **Deploy → Manage deployments**, click the pencil ✏️ icon, set **Version** to **New version**, and click **Deploy**.

The URL stays the same, so the game keeps working. Use these same steps 1, 3 and 6 for any future script changes.
