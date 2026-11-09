import 'vue-router'

// Typed route meta: `route.meta.title` is a string everywhere, not `unknown`.
declare module 'vue-router' {
  interface RouteMeta {
    /** Page title, shown in the top bar and the browser tab. */
    title?: string
  }
}

export {}
