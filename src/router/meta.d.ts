import 'vue-router'

// Typed route meta: `route.meta.title` is a string everywhere, not `unknown`.
declare module 'vue-router' {
  interface RouteMeta {
    /** Page title, shown in the top bar and the browser tab. */
    title?: string
    /** Signed-in users only (set on the app shell, inherited by every page in it). */
    requiresAuth?: boolean
    /** Sign-in, sign-up…: a signed-in user is sent to the app instead. */
    guestOnly?: boolean
  }
}

export {}
