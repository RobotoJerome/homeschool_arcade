/*
 * Homeschool Arcade settings shared by every game
 * -----------------------------------------------
 * leaderboardUrl: the web address of the ONE shared online leaderboard (a Google Apps
 * Script "web app" URL ending in /exec, attached to one Google Sheet). Every game on the
 * site saves its high scores there. See LEADERBOARD-SETUP.md in the project folder.
 *
 *   - With a URL here, everyone who plays shares the same Top 10 boards.
 *   - Left empty, each device keeps its own scores (the games still work fine).
 */
window.ARCADE_CONFIG = {
  leaderboardUrl: 'https://script.google.com/macros/s/AKfycbzl07rMpvTUfcd3wSat1Qhak13e_LBrvYCBtS0SBo76g28E_5pfIRLhuKiijevZxTOI7A/exec'
};
