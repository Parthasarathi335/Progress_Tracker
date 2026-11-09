// lib/timezone.ts
// Asia/Kolkata timezone helpers

export const APP_TIMEZONE = 'Asia/Kolkata'

/**
 * Returns today's date string (YYYY-MM-DD) in Asia/Kolkata timezone
 */
export function getTodayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE })
}

/**
 * Returns the current date in Asia/Kolkata as a Date object (time zeroed)
 */
export function getNowIST(): Date {
  const now = new Date()
  const istString = now.toLocaleString('en-US', { timeZone: APP_TIMEZONE })
  return new Date(istString)
}

/**
 * Formats a date string to a readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: APP_TIMEZONE,
  })
}

/**
 * Returns an array of date strings for the given month (YYYY-MM format)
 */
export function getDatesInMonth(year: number, month: number): string[] {
  const dates: string[] = []
  const daysInMonth = new Date(year, month, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    dates.push(`${year}-${mm}-${dd}`)
  }
  return dates
}
