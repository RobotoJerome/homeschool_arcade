/*
 * Shred the Globe settings
 * ------------------------
 * The leaderboard address now lives in ONE place for every game on the site:
 * shared/arcade-config.js (see LEADERBOARD-SETUP.md in the project folder).
 *
 *   - With a URL there, everyone who plays shares the same Top 10 boards.
 *   - Left empty, each device keeps its own scores (the game still works fine).
 */
window.STG_CONFIG = {
  leaderboardUrl: (window.ARCADE_CONFIG && window.ARCADE_CONFIG.leaderboardUrl) || ''
};
