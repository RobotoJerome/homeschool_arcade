/**
 * Homeschool Arcade — one shared online leaderboard for EVERY game
 * ================================================================
 * This small Google Apps Script turns one Google Sheet into the high-score server for
 * all the games on the site, so everyone who plays sees the same Top 10 boards. It's
 * free and runs in your own Google account. Every score becomes a row in the "Scores"
 * tab, and you can delete a row at any time to remove that score.
 *
 * Setup or update: see LEADERBOARD-SETUP.md.
 *
 * Adding a new game later: add an entry to GAMES below (its board names and what a
 * believable score looks like), click Save, then Deploy > Manage deployments >
 * pencil icon > Version: New version > Deploy. The web address stays the same.
 *
 * Security notes:
 *  - The @OnlyCurrentDoc line below tells Google this script may ONLY use the one
 *    spreadsheet it's attached to, never your other Sheets or files.
 *  - Visitors can only read the Top 10 lists and submit scores that pass the checks below.
 *  - Don't give anyone else edit access to this spreadsheet: editors can change this script.
 */

/** @OnlyCurrentDoc */

const SCRIPT_VERSION = 3;
const SHEET_NAME = 'Scores';      // the tab that holds the scores: renaming the spreadsheet is fine, but keep this tab's name
const TOP_N = 10;
const KEEP_PER_BOARD = 50;        // lower scores beyond the best 50 per board are removed automatically
const CACHE_SECONDS = 60;
const MAX_SAVES_PER_MINUTE = 30; // simple protection against spam
const MINUTE = 60 * 1000, HOUR = 60 * MINUTE;

/*
 * Every game on the site, its leaderboards, and what a believable score looks like.
 * Higher points rank first; a faster time breaks ties.
 *   points = the score, outOf = the most points possible (0 if a game has no maximum),
 *   timeMs = how long it took, in milliseconds.
 */
const GAMES = {
  // Shred the Globe (geography): 15 rounds, 1 point each. Its 8 boards keep their original names.
  'shred-the-globe': {
    boards: ['standard:spot:world', 'standard:spot:usa', 'standard:flag:world', 'standard:flag:usa',
      'skate:spot:world', 'skate:spot:usa', 'skate:flag:world', 'skate:flag:usa'],
    check: function (points, outOf, timeMs) {
      return outOf >= 1 && outOf <= 15 && points >= 1 && points <= outOf && timeMs >= points * 400 && timeMs <= 6 * HOUR;
    }
  },
  // Rocket Builder (elementary math): stars collected across all 4 planets, one board per level.
  'rocket-builder': {
    boards: ['rocket-builder:cadet', 'rocket-builder:pilot', 'rocket-builder:captain'],
    check: function (points, outOf, timeMs) {
      return outOf === 0 && points >= 1 && points <= 3000 && timeMs >= 3 * MINUTE && timeMs <= 72 * HOUR;
    }
  }
};

const BLOCKED = ('ASS ARS AZZ FUK FUC FCK FUQ FKU FKN FUX SHT SHI DIK DIC DCK DIX COK CUM KUM CNT KNT ' +
  'KKK NIG NGR NGA NGG FAG FGT TIT TTS WTF STF SEX SXY XXX JIZ JIS HOE VAG PIS PSS CRP DMN SUK SUC SCK NAZ').split(' ');
const HEADERS = ['Board', 'Initials', 'Points', 'Out of', 'Time', 'Time (ms)', 'Date', 'Saved at', 'ID'];

/** Run this once from the editor (select "setup", click Run) to create the Scores tab and approve access. */
function setup() {
  getSheet_();
  Logger.log('Ready! Now click Deploy > New deployment (see LEADERBOARD-SETUP.md).');
}

/** GET ?action=top&board=rocket-builder:cadet  ->  { ok, board, entries: [...] } */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'ping') return json_({ ok: true, version: SCRIPT_VERSION, games: Object.keys(GAMES) });
    if (p.action === 'top') {
      gameFor_(p.board);
      return json_({ ok: true, board: p.board, entries: topFor_(p.board) });
    }
    return json_({ ok: false, error: 'Unknown request.' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

/** POST {"action":"add","board":"...","initials":"ABC","points":12,"outOf":15,"timeMs":83000} */
function doPost(e) {
  try {
    let body;
    try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (parseErr) { return json_({ ok: false, error: 'Bad request.' }); }
    if (!body || body.action !== 'add') return json_({ ok: false, error: 'Unknown request.' });

    const board = String(body.board || '');
    const game = gameFor_(board);
    const initials = String(body.initials || '').trim().toUpperCase();
    if (!/^[A-Z]{1,3}$/.test(initials)) throw new Error('Initials must be 1 to 3 letters.');
    if (BLOCKED.indexOf(initials) !== -1) throw new Error('Please pick different initials.');
    const outOf = toInt_(body.outOf || 0), points = toInt_(body.points), timeMs = toInt_(body.timeMs);
    if (!game.check(points, outOf, timeMs)) throw new Error('That score doesn\'t look right.');

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const cache = CacheService.getScriptCache();
      const minuteKey = 'saves:' + Math.floor(Date.now() / 60000);
      const saves = toInt_(cache.get(minuteKey)) || 0;
      if (saves >= MAX_SAVES_PER_MINUTE) throw new Error('The leaderboard is busy — try again in a minute.');
      cache.put(minuteKey, String(saves + 1), 120);

      const now = new Date();
      const id = Utilities.getUuid().slice(0, 8);
      const date = Utilities.formatDate(now, Session.getScriptTimeZone(), 'MMM d, yyyy');
      // The leading ' keeps Sheets from turning "1:23" into a clock time.
      const sheet = getSheet_();
      sheet.appendRow([board, initials, points, outOf, "'" + formatTime_(timeMs), timeMs, date, now, id]);
      prune_(sheet, board);
      cache.remove('top:' + board);
      return json_({ ok: true, id: id, board: board, entries: topFor_(board) });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

/* ---------------- helpers ---------------- */

function topFor_(board) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('top:' + board);
  if (cached) return JSON.parse(cached);

  const sheet = getSheet_();
  const last = sheet.getLastRow();
  const rows = last > 1 ? sheet.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];
  const entries = [];
  rows.forEach(function (r) {
    if (String(r[0]) !== board) return;
    const s = toInt_(r[2]), n = toInt_(r[3] || 0), t = toInt_(r[5]);
    const savedAt = r[7] instanceof Date ? r[7].getTime() : 0;
    if (!(s >= 1 && n >= 0 && t > 0)) return; // skip rows that were edited into something invalid
    entries.push({ i: String(r[1]).toUpperCase().slice(0, 3), s: s, n: n, t: t, d: String(r[6] instanceof Date ? Utilities.formatDate(r[6], Session.getScriptTimeZone(), 'MMM d, yyyy') : r[6]), at: savedAt, id: String(r[8]) });
  });
  entries.sort(function (a, b) { return (b.s - a.s) || (a.t - b.t) || (a.at - b.at); });
  const top = entries.slice(0, TOP_N);
  cache.put('top:' + board, JSON.stringify(top), CACHE_SECONDS);
  return top;
}

/** Keep only the best KEEP_PER_BOARD rows for a board, so spam can't make the sheet grow forever. */
function prune_(sheet, board) {
  const last = sheet.getLastRow();
  if (last < 2) return;
  const rows = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  const mine = [];
  rows.forEach(function (r, idx) {
    if (String(r[0]) !== board) return;
    mine.push({ row: idx + 2, s: toInt_(r[2]) || 0, t: toInt_(r[5]) || Number.MAX_SAFE_INTEGER, at: r[7] instanceof Date ? r[7].getTime() : 0 });
  });
  if (mine.length <= KEEP_PER_BOARD) return;
  mine.sort(function (a, b) { return (b.s - a.s) || (a.t - b.t) || (a.at - b.at); });
  mine.slice(KEEP_PER_BOARD)
    .map(function (m) { return m.row; })
    .sort(function (a, b) { return b - a; }) // delete from the bottom up so row numbers don't shift
    .forEach(function (row) { sheet.deleteRow(row); });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

/** Which game owns this board (throws for unknown boards). */
function gameFor_(board) {
  board = String(board);
  for (const id in GAMES) if (GAMES[id].boards.indexOf(board) !== -1) return GAMES[id];
  throw new Error('Unknown leaderboard.');
}

function toInt_(v) {
  const n = Number(v);
  return isFinite(n) ? Math.round(n) : NaN;
}

function formatTime_(ms) {
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
