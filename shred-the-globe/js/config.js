/*
 * Shred the Globe settings
 * ------------------------
 * leaderboardUrl: the address of your shared online leaderboard (a Google Apps Script
 * "web app" URL that ends in /exec). See LEADERBOARD-SETUP.md in the project folder.
 *
 *   - With a URL here, everyone who plays shares the same Top 10 boards.
 *   - Left empty, each device keeps its own scores (the game still works fine).
 */
window.STG_CONFIG = {
  leaderboardUrl: ''
};
