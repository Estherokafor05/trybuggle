/**
 * Buggle Learn early-access sign-ups → this Google Sheet.
 *
 * Setup (once):
 * 1. In the Google Sheet: Extensions → Apps Script. Replace everything with this file.
 * 2. Set SECRET below to the same value as WAITLIST_SHEET_SECRET on Vercel.
 * 3. Deploy → New deployment → type "Web app". Execute as: Me. Who has access: Anyone.
 *    Authorise when asked, then copy the Web app URL (ends in /exec).
 * 4. That URL goes into WAITLIST_SHEET_URL on Vercel.
 * For an email per sign-up: in the sheet, Tools → Notification settings → Edit notifications
 * → "Any changes are made" → "Email - right away".
 */
const SECRET = "PASTE_WAITLIST_SHEET_SECRET_HERE";
const SHEET_NAME = "Sign-ups";
const HEADERS = ["Signed up at", "Email", "Role", "List", "New or updated"];

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad request" });
  }
  if (!data || data.secret !== SECRET) return reply({ ok: false, error: "unauthorised" });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }
    sheet.appendRow([
      new Date(data.at || Date.now()),
      // Stop a sign-up from being read as a formula.
      "'" + String(data.email || "").slice(0, 254),
      String(data.role || "").slice(0, 100),
      String(data.list || "").slice(0, 50),
      data.newSignup ? "New" : "Updated role",
    ]);
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
