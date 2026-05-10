// Centralised SEO wiring for marketing pages. Emits localized title +
// description, canonical URL, hreflang alternates, and an OG image derived
// from the page title.
//
// i18n note: the portal uses the `no_prefix` strategy (both locales share
// the same URL; the active language switches via cookie). We still declare
// hreflang for AR, EN, and x-default so Google understands the page is
// bilingual — future move to `prefix_except_default` can keep the hreflang
// emitter unchanged.
//
//   useLandingSeo({
//     ar: { title: '…', description: '…' },
//     en: { title: '…', description: '…' },
//     ogImage: { title: { ar: '…', en: '…' } } // optional
//   })

import { useHead, useRoute } from '#imports'
// @ts-expect-error — provided by @nuxtjs/i18n module
import { useI18n } from '#imports'
// @ts-expect-error — provided by nuxt-site-config (bundled with @nuxtjs/seo)
import { useSiteConfig } from '#imports'
// @ts-expect-error — provided by nuxt-og-image module at build time
import { defineOgImage } from '#imports'

type LocalizedText = { ar: string; en: string }

export interface LandingSeoInput {
  ar: { title: string; description: string }
  en: { title: string; description: string }
  ogImage?: { title?: LocalizedText; description?: LocalizedText }
}

export function useLandingSeo(input: LandingSeoInput) {
  const { locale } = useI18n()
  const route = useRoute()
  const site = useSiteConfig()

  const siteUrl = (site?.url as string | undefined) || 'https://momentfy.com'

  useHead(() => {
    const current = locale.value === 'ar' ? input.ar : input.en
    const canonical = siteUrl.replace(/\/$/, '') + route.path

    return {
      // Page title already includes the brand (e.g. "Pricing — Momentfy"),
      // so suppress the default "%s | Site Name" template nuxt-seo-utils adds.
      titleTemplate: '%s',
      title: current.title,
      meta: [
        { name: 'description', content: current.description },
        { property: 'og:title', content: current.title },
        { property: 'og:description', content: current.description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonical },
        { property: 'og:site_name', content: 'Momentfy' },
        { property: 'og:locale', content: locale.value === 'ar' ? 'ar_SA' : 'en_US' },
        { property: 'og:locale:alternate', content: locale.value === 'ar' ? 'en_US' : 'ar_SA' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: current.title },
        { name: 'twitter:description', content: current.description }
      ],
      link: [
        { rel: 'canonical', href: canonical },
        { rel: 'alternate', hreflang: 'ar', href: canonical },
        { rel: 'alternate', hreflang: 'en', href: canonical },
        { rel: 'alternate', hreflang: 'x-default', href: canonical }
      ]
    }
  })

  // Satori-rendered OG image. Title falls back to the page title per locale;
  // caller can override via `ogImage.title`.
  if (typeof defineOgImage === 'function') {
    const titleAr = input.ogImage?.title?.ar ?? input.ar.title
    const titleEn = input.ogImage?.title?.en ?? input.en.title
    const descAr = input.ogImage?.description?.ar ?? input.ar.description
    const descEn = input.ogImage?.description?.en ?? input.en.description

    defineOgImage('NuxtSeo', {
      title: locale.value === 'ar' ? titleAr : titleEn,
      description: locale.value === 'ar' ? descAr : descEn,
      theme: '#000000',
      siteName: 'Momentfy'
    })
  }
}
