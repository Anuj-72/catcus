/**
 * Derives the two-letter avatar initials from a session user.
 * "Andrew Martin" -> "AM", falls back to the email's first letter.
 */
export function initialsFor(name: string, email: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return email.slice(0, 1).toUpperCase();
}
