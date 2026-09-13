import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

/** Register a new user with email + password. Returns the Firebase User. */
export async function registerUser(
  email: string,
  password: string
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
  return cred.user;
}

/** Login an existing user. Returns the Firebase User. */
export async function loginUser(
  email: string,
  password: string
): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  return cred.user;
}

/** Logout the current user. */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/** Send a password-reset email. */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}