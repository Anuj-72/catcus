/**
 * Server-side form validation. Messages are not part of the Figma design
 * (which only draws the login error), so they are plain and minimal — see
 * DEVIATIONS.md.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignupInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
};

export function validateSignup(input: SignupInput): string | null {
  if (!input.firstName.trim()) return "Enter your first name.";
  if (!input.lastName.trim()) return "Enter your last name.";
  if (!EMAIL.test(input.email.trim())) return "Enter a valid email address.";
  if (input.password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!input.acceptedTerms) return "Please accept the Terms & Conditions.";
  return null;
}
