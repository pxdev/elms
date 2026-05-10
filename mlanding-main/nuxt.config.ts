import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
// Standalone Momentfy customer portal:
//   - Marketing pages prerendered (SEO)
//   - /auth/**, /dashboard/**, /admin/** server-rendered, session via nuxt-auth-utils
//   - Own Postgres `portal` database via Prisma — fully isolated from the main app
export default defineNuxtConfig({

  // Marketing surface SSRs so Google, Bing, and social-preview crawlers (which
  // do NOT execute JS) see full meta, canonical, OG, and JSON-LD in the
  // source HTML. Auth/dashboard/admin stay SPA via routeRules below — they're
  // session-gated and don't benefit from SSR.
  ssr: true,

  // The payload cache conflicts when sibling routes share a path prefix
  // (e.g. /portal/addons is a page AND /portal/addons/:key is its children —
  // Nuxt tries to use `.../payload/portal/addons` as both a file and a
  // directory). Disabling payload extraction removes the `_payload.json`
  // side-files; the HTML still prerenders and client navigation still works,
  // just without the cached data fetch.
  experimental: {
    payloadExtraction: false
  },

  // Dev server host allowlist. Vite 5+ refuses requests whose Host header
  // isn't on this list (DNS-rebinding protection). Tunnels like cloudflared
  // and ngrok land here — whitelist their wildcard suffixes so LS webhook
  // dry-runs over a tunnel work against `npm run dev`.
  //
  // fs.allow: the portal lives in `Momentfy Portal/` but node_modules are
  // hoisted to the parent `/Volumes/HDD/Momentfy`. Vite's default fs.allow
  // only covers the project root, so iconify/@nuxt/ui modules imported
  // from the parent trip "outside of serving allow list". Adding `..`
  // authorises the parent repo.
  vite: {
    server: {
      allowedHosts: [
        'localhost',
        '.trycloudflare.com',
        '.ngrok.io',
        '.ngrok-free.app',
        '.loca.lt'
      ],
      fs: {
        allow: ['..']
      }
    }
  },

  app: {
    baseURL: '/',
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#000000' }
      ]
    }
  },

  runtimeConfig: {
    // Server-only secrets
    databaseUrl: process.env.DATABASE_URL || '',
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || '',
    licensePepper: process.env.LICENSE_PEPPER || '',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT || 465),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || 'Momentfy <support@momentfy.com>'
    },
    lemonSqueezy: {
      apiKey: process.env.LEMON_SQUEEZY_API_KEY || '',
      storeId: process.env.LEMON_SQUEEZY_STORE_ID || '',
      webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || ''
    },
    github: {
      token: process.env.GITHUB_TOKEN || '',
      org: process.env.GITHUB_ORG || '',
      teamSlug: process.env.GITHUB_TEAM_SLUG || 'customers',
      repo: process.env.GITHUB_REPO || ''
    },
    public: {
      appVersion: pkg.version,
      // Where the "Try demo" CTA sends visitors. Lives at /demo on the
      // primary domain — same Nuxt deployment serves the marketing portal
      // and proxies to the demo Momentfy instance.
      demoUrl: process.env.NUXT_PUBLIC_DEMO_URL || 'https://momentfy.com/demo',
      // Hosted checkout fallback (Phase 3 will replace with portal-mediated checkout).
      checkoutUrl: process.env.NUXT_PUBLIC_CHECKOUT_URL || 'https://momentfy.lemonsqueezy.com',
      // Public base URL self-hosted Momentfy instances POST to for license validation.
      portalUrl: process.env.NUXT_PUBLIC_PORTAL_URL || '',
      // Sales WhatsApp number in international format (e.g. 966500000000),
      // no leading +. Blank disables the floating chat widget.
      whatsappNumber: process.env.NUXT_PUBLIC_WHATSAPP_NUMBER || ''
    }
  },

  // @nuxtjs/seo bundles: @nuxtjs/sitemap, @nuxtjs/robots, nuxt-og-image,
  // nuxt-schema-org, nuxt-seo-utils, nuxt-link-checker. It reads the
  // top-level `site` block below for shared identity (URL, name, locale).
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://momentfy.com',
    name: 'Momentfy',
    description: 'All-in-one platform for bookings, POS, accounting, inventory, HR, CRM, and a branded client portal. Bilingual (AR/EN), ZATCA & ETA e-invoicing ready, self-hosted with lifetime updates.',
    defaultLocale: 'en'
  },

  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxtjs/i18n', '@nuxtjs/seo', 'nuxt-auth-utils', 'nuxt-authorization', '@nuxt/fonts'],

  // Keep authenticated/admin surfaces out of the sitemap and robots index.
  // Marketing pages under `/` and `/portal/**` stay indexable. Patterns are
  // duplicated under each locale prefix because @nuxtjs/i18n's `prefix`
  // strategy mounts every route under both /en/** and /ar/**.
  sitemap: {
    exclude: [
      '/auth/**',
      '/dashboard/**',
      '/admin/**',
      '/api/**',
      '/portal/checkout/**',
      '/en/auth/**',
      '/ar/auth/**',
      '/en/dashboard/**',
      '/ar/dashboard/**',
      '/en/admin/**',
      '/ar/admin/**',
      '/en/portal/checkout/**',
      '/ar/portal/checkout/**'
    ]
  },

  robots: {
    disallow: [
      '/auth',
      '/dashboard',
      '/admin',
      '/api',
      '/portal/checkout',
      '/en/auth',
      '/ar/auth',
      '/en/dashboard',
      '/ar/dashboard',
      '/en/admin',
      '/ar/admin',
      '/en/portal/checkout',
      '/ar/portal/checkout'
    ]
  },

  // OG image: Satori-rendered at build/runtime from the default Nuxt Seo
  // template. Each page can override via `defineOgImage()` in <script setup>.
  //
  // compatibility.runtime.chromium=false avoids the first-run interactive
  // prompt and forces the lightweight Satori renderer (no headless Chrome
  // dependency — works on any Nitro deployment target, including edge).
  ogImage: {
    compatibility: {
      runtime: {
        chromium: false
      }
    },
    defaults: {
      component: 'NuxtSeo',
      props: {
        theme: '#000000',
        colorMode: 'light'
      }
    }
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Momentfy',
      logo: '/pwa-512x512.png',
      sameAs: [
        // Fill in as social presence grows
      ]
    }
  },

  // PWA was wired up while this was a marketing-only static site. The portal
  // now has SSR + auth and isn't an install target — the *main app* is what
  // gets installed as a PWA. @vite-pwa/nuxt 0.6 also doesn't support Nuxt 4
  // out of the box, so we drop the module here.

  // @nuxtjs/i18n handles only the locale state (active language code, dir,
  // language switcher). Marketing copy is stored in `i18n/locales/{en,ar}/landing.json`
  // and imported directly by `useLandingCopy()` — bypassing vue-i18n's message
  // compiler, which trips on literal `@` in emails and `{...}` placeholders.
  i18n: {
    locales: [
      { code: 'en', name: 'English', dir: 'ltr' },
      { code: 'ar', name: 'العربية', dir: 'rtl' }
    ],
    // `en` is only the static fallback. detectBrowserLanguage below routes
    // first-time visitors to `/ar/` or `/en/` based on their browser
    // Accept-Language, then a cookie remembers their explicit choice from
    // the toggle button.
    defaultLocale: 'en',
    // prefix_and_default — both /portal/foo (default locale, English) and
    // /en/portal/foo and /ar/portal/foo all resolve to a real route. This
    // keeps every existing <NuxtLink to="/portal/..."> working for English
    // visitors while still giving Arabic visitors explicit /ar/ URLs and
    // the user a way to deep-link either locale by hand.
    strategy: 'prefix_and_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  },

  icon: {
    mode: 'svg'
  },

  // Light mode only. Toggle UI was removed; @nuxtjs/color-mode is kept
  // because @nuxt/ui depends on it. `app.vue` re-asserts preference=light
  // on boot so any stale localStorage value from when the toggle existed
  // is overwritten for returning users.
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    // Default headers for everything
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)'
      }
    },

    // Session-gated surfaces: SPA-only. Skipping SSR avoids running
    // auth/session/DB code during server render, and these pages don't
    // need SEO anyway. Mirrored under /en/** and /ar/** because the i18n
    // prefix strategy mounts every page under both locale prefixes.
    '/auth/**': { ssr: false },
    '/dashboard/**': { ssr: false },
    '/admin/**': { ssr: false },
    '/en/auth/**': { ssr: false },
    '/ar/auth/**': { ssr: false },
    '/en/dashboard/**': { ssr: false },
    '/ar/dashboard/**': { ssr: false },
    '/en/admin/**': { ssr: false },
    '/ar/admin/**': { ssr: false },

    // Checkout hits the licensing DB + Lemon Squeezy — skip SSR so the
    // page mounts client-side with a live session.
    '/portal/checkout/**': { ssr: false },
    '/en/portal/checkout/**': { ssr: false },
    '/ar/portal/checkout/**': { ssr: false }
  },

  fonts: {
    families: [
      {
        name: 'IBM Plex Sans Arabic',
        provider: 'google',
        weights: [400, 500, 600, 700],
        styles: ['normal']
      },
      {
        name: 'Saudi Riyal',
        provider: 'none'
      },
      {
        name: 'Segoe UI',
        provider: 'none'
      }
    ],
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: [
        'latin',
        'latin-ext',
        'arabic'
      ]
    }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})