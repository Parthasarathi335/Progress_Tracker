// lib/auth/allowlist.ts
// Server-side allowlist of authorised email addresses
// NEVER import this in client components

export function getAllowedEmails(): string[] {
  const email1 = process.env.ALLOWED_EMAIL_1
  const email2 = process.env.ALLOWED_EMAIL_2

  if (!email1 || !email2) {
    throw new Error('ALLOWED_EMAIL_1 and ALLOWED_EMAIL_2 must be set in environment variables')
  }

  return [email1.toLowerCase().trim(), email2.toLowerCase().trim()]
}

export function isEmailAllowed(email: string): boolean {
  const allowed = getAllowedEmails()
  return allowed.includes(email.toLowerCase().trim())
}
