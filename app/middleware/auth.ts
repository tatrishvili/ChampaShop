import { useAuthStore } from '~/stores/auth'

// Route guard for signed-in-only pages (e.g. /account). Apply with
// `definePageMeta({ middleware: 'auth' })`. When not authenticated, redirect to
// the login page carrying the requested path, so login can send the user back.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})
