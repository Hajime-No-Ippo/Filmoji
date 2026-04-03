import { auth } from '../../firebase'

/**
 * fetch() wrapper that automatically attaches the Firebase ID token
 * in the Authorization header when a user is logged in.
 */
export async function authFetch(url, options = {}) {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    options = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    }
  }
  return fetch(url, options)
}