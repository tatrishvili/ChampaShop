// Shapes returned by the dummyjson auth API (dummyjson.com/docs/auth).

/** The authenticated user, as returned by GET /auth/me. */
export interface AuthUser {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

/** POST /auth/login returns the user fields plus a token pair. */
export interface LoginResponse extends AuthUser {
  accessToken: string
  refreshToken: string
}

/** POST /auth/refresh returns a fresh token pair. */
export interface RefreshResponse {
  accessToken: string
  refreshToken: string
}
