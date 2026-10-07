import { useAuthStore } from '~/stores/auth'

// Restore the session before the first route is rendered. Running on the server
// means a reload paints the signed-in UI directly from the access-token cookie,
// with no flash of logged-out state; the loaded user is serialized to the client,
// so this does not fetch /auth/me again during hydration.
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  await auth.init()
})
