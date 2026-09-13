export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  // Simple RFC-5322-ish check, good enough for client-side validation.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function validateAuthForm(
  email: string,
  password: string,
  confirmPassword?: string
): string | null {
  if (!email.trim() || !password) return 'Email and password are required.';
  if (!isValidEmail(email)) return 'Please enter a valid email address.';
  if (password.length < 6)
    return 'Password must be at least 6 characters long.';
  if (
    confirmPassword !== undefined &&
    password !== confirmPassword
  )
    return 'Passwords do not match.';
  return null;
}

export function validateProductForm(
  name: string,
  priceText: string
): string | null {
  if (!name.trim()) return 'Product name is required.';
  if (!priceText.trim()) return 'Price is required.';
  const price = Number(priceText);
  if (Number.isNaN(price) || price < 0)
    return 'Price must be a valid non-negative number.';
  return null;
}

export function friendlyAuthError(code?: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try logging in.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/weak-password':
      return 'Password is too weak (min 6 characters).';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}