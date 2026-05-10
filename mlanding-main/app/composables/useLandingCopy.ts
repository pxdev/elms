// Reactive accessors for the landing-site marketing copy.
//
// Copy lives in `i18n/locales/{en,ar}/landing.json` (under a top-level
// `landing` key). We import both JSON files directly rather than feeding them
// to vue-i18n, because the message compiler doesn't tolerate literal `@`
// (emails) or `{...}` tokens (we substitute `{year}` manually) inside what
// would otherwise be plain copy. Locale state still comes from @nuxtjs/i18n.
//
//   const copy = useLandingCopy()
//   copy.value.hero.h1a
//   copy.value.modules.items[0].label

import enLanding from '~~/i18n/locales/en/landing.json'
import arLanding from '~~/i18n/locales/ar/landing.json'

type Module = { id: string; label: string; blurb: string }
type Addon = { key: string; label: string; desc: string; tag?: string }
type AddonDetail = {
  long: string
  sections: FeatureSection[]
  whoFor: string
  setupSteps: string[]
  integrates: string[]
  useCases?: string[]
}
type SolutionDetail = {
  title: string
  tagline: string
  icon: string
  accent: string
  dot: string
  category: string
  long: string
  pains: string[]
  capabilities: string[]
  stack: string[]
  stats: { k: string; v: string }[]
  whoFor: string
  useCases: string[]
  faq?: { q: string; a: string }[]
}
type Industry = { id: string; label: string; tagline?: string }
type Plan = {
  name: string; tag: string; price: string; priceSuffix: string; cta: string
  featured?: boolean; mostPopular?: string; features: string[]
  durationValue: string
  durationLabel: string
  durationProgress: number
  tagline: string
}
type FeatureSection = { heading: string; body: string }
type Feature = { id: string; group: string; title: string; summary: string; sections: FeatureSection[] }
type Stat = { k: string; v: string }

export type LandingCopy = {
  dir: 'ltr' | 'rtl'
  nav: {
    features: string; addons: string; showcase: string; pricing: string; faq: string; docs: string; manual: string
    signIn: string; dashboard: string; getCode: string; langLabel: string
  }
  hero: {
    badge: string; h1a: string; highlight: string; h1b: string; sub: string; subStrong: string
    primary: string; secondary: string; trust: string[]
    chips: { zatca: { tag: string; msg: string }; ai: { tag: string; msg: string } }
    chromeUrl: string
    statsStrip: Stat[]
  }
  why: { eyebrow: string; h2a: string; h2b: string; body: string; items: { title: string; body: string }[] }
  modules: { eyebrow: string; heading: string; sub: string; linkAll: string; items: Module[] }
  industries: { eyebrow: string; heading: string; sub: string; items: Industry[] }
  addons: { eyebrow: string; heading: string; sub: string; linkAll: string; items: Addon[] }
  addonDetails: Record<string, AddonDetail>
  solutionDetails: Record<string, SolutionDetail>
  portal: Record<string, string | string[]>
  pricing: {
    eyebrow: string; heading: string; sub: string; plans: Plan[]; footer: string
    billing: { onetime: string; updates: string; save: string }
    includedAllLabel: string
    includedAllSub?: string
    includedAll: Array<{ label: string; hint: string; icon: string }>
    windowLabel: string
    durationAxisStart: string
    durationAxisEndForever: string
  }
  testimonials: {
    eyebrow: string; heading: string
    items: { quote: string; name: string; role: string }[]
    disclaimer: string
  }
  trust: {
    eyebrow: string; heading: string; sub: string
    pillars: { title: string; body: string; icon: string }[]
  }
  faq: { eyebrow: string; heading: string; items: { q: string; a: string }[]; linkAll: string }
  cta: Record<string, string>
  footer: { tag: string; badge: string; columns: { title: string; links: { label: string; to: string }[] }[]; bottom: string; bottomLang: string; bottomHost: string }
  ui: Record<string, string | Record<string, string>> & { addonCategoryLabels: Record<string, string> }
  featuresPage: { eyebrow: string; heading: string; sub: string; items: Feature[]; closer: { title: string; body: string; cta: string } }
  showcasePage: Record<string, any>
  pricingPage: Record<string, any>
  downloadPage: Record<string, any>
  faqPage: Record<string, any>
  docsPage: Record<string, any>
  legalPage: Record<string, any>
}

const en = (enLanding as { landing: LandingCopy }).landing
const ar = (arLanding as { landing: LandingCopy }).landing

export function useLandingCopy() {
  const { locale } = useI18n()
  return computed(() => (locale.value === 'ar' ? ar : en))
}

export function useLandingLocale() {
  const { locale, locales, setLocale } = useI18n()
  const list = computed(() => locales.value as Array<{ code: string; name: string }>)
  const currentLocale = computed(() => list.value.find(l => l.code === locale.value))
  // The "other" locale — for the EN/AR toggle button we render the language
  // we'd switch *to*, not the one we're already in.
  const otherLocale = computed(() => list.value.find(l => l.code !== locale.value) ?? list.value[0])
  function toggleLocale() {
    const next = otherLocale.value?.code
    if (next) setLocale(next as any)
  }
  return { locale, currentLocale, otherLocale, toggleLocale, setLocale }
}
