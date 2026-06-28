/**
 * Local-time date helpers.
 * Avoids the UTC timezone shift that causes `.toISOString().split('T')[0]`
 * to return *yesterday* in UTC+ timezones (e.g. Indonesia WIB/WITA/WIT).
 */

/** Format any Date to YYYY-MM-DD using LOCAL time */
export function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Get today's date as YYYY-MM-DD (local time) */
export function todayStr() {
  return toDateStr(new Date())
}

/** Get yesterday's date as YYYY-MM-DD (local time) */
export function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateStr(d)
}
