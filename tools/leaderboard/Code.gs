/**
 * Shred the Globe — shared online leaderboard
 * ============================================
 * This small Google Apps Script turns a Google Sheet into the game's high-score
 * server, so everyone who plays sees the same Top 10 boards. It's free and runs in
 * your own Google account. Every score becomes a row in the "Scores" tab, and you can
 * delete a row at any time to remove that score.
 *
 * Setup: see LEADERBOARD-SETUP.md (about 5 minutes, one time).
 */

const SHEET_NAME = 'Scores';
const TOP_N = 10;
const MAX_ROUNDS = 15;
const CACHE_SECONDS = 60;
const MAX_SAVES_PER_MINUTE = 30; // simple protection against spam

const BOARDS = [
  'standard:spot:world', 'standard:spot:usa', 'standard:flag:world', 'standard:flag:usa',
  'skate:spot:world', 'skate:spot:usa', 'skate:flag:world', 'skate:flag:usa'
];
const BLOCKED = ('ASS ARS AZZ FUK FUC FCK FUQ FKU FKN FUX SHT SHI DIK DIC DCK DIX COK CUM KUM CNT KNT ' +
  'KKK NIG NGR NGA NGG FAG FGT TIT TTS WTF STF SEX SXY XXX JIZ JIS HOE VAG PIS PSS CRP DMN SUK SUC SCK NAZ').split(' ');
const HEADERS = ['Board', 'Initials', 'Points', 'Out of', 'Time', 'Time (ms)', 'Date', 'Saved at', 'ID'];

/** Run this once from the editor (select "setup", click Run) to create the Scores tab and approve access. */
function setup() {
  getSheet_();
  Logger.log('Ready! Now click Deploy > New deployment (see LEADERBOARD-SETUP.md).');
}

/** GET ?action=top&board=standard:spot:world  ->  { ok, board, entries: [...] } */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'ping') return json_({ ok: true });
    if (p.action === 'top') {
      checkBoard_(p.board);
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
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action !== 'add') return json_({ ok: false, error: 'Unknown request.' });

    const board = String(body.board || '');
    checkBoard_(board);
    const initials = String(body.initials || '').trim().toUpperCase();
    if (!/^[A-Z]{1,3}$/.test(initials)) throw new Error('Initials must be 1 to 3 letters.');
    if (BLOCKED.indexOf(initials) !== -1) throw new Error('Not on this board, dude — pick other initials.');
    const outOf = toInt_(body.outOf), points = toInt_(body.points), timeMs = toInt_(body.timeMs);
    if (!(outOf >= 1 && outOf <= MAX_ROUNDS)) throw new Error('That score doesn\'t look right.');
    if (!(points >= 1 && points <= outOf)) throw new Error('That score doesn\'t look right.');
    if (!(timeMs >= points * 400 && timeMs <= 6 * 60 * 60 * 1000)) throw new Error('That time doesn\'t look right.');

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
      getSheet_().appendRow([board, initials, points, outOf, "'" + formatTime_(timeMs), timeMs, date, now, id]);
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
    const s = toInt_(r[2]), n = toInt_(r[3]), t = toInt_(r[5]);
    const savedAt = r[7] instanceof Date ? r[7].getTime() : 0;
    if (!(s >= 1 && n >= 1 && t > 0)) return; // skip rows that were edited into something invalid
    entries.push({ i: String(r[1]).toUpperCase().slice(0, 3), s: s, n: n, t: t, d: String(r[6] instanceof Date ? Utilities.formatDate(r[6], Session.getScriptTimeZone(), 'MMM d, yyyy') : r[6]), at: savedAt, id: String(r[8]) });
  });
  entries.sort(function (a, b) { return (b.s - a.s) || (a.t - b.t) || (a.at - b.at); });
  const top = entries.slice(0, TOP_N);
  cache.put('top:' + board, JSON.stringify(top), CACHE_SECONDS);
  return top;
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

function checkBoard_(board) {
  if (BOARDS.indexOf(String(board)) === -1) throw new Error('Unknown leaderboard.');
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
