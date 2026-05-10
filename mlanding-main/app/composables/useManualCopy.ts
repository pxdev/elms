// Reactive accessor for the user-manual copy (docs.daftra-style).
//
// Copy lives in `i18n/locales/{en,ar}/manual.json` under a top-level `manual`
// key. Imported directly for the same reason as `useLandingCopy`: vue-i18n's
// message compiler chokes on literal `@` / `{...}` tokens that appear in
// marketing-style prose.
//
//   const manual = useManualCopy()
//   manual.value.home.title
//   manual.value.calendar.chapters[0].title

import enManual from '~~/i18n/locales/en/manual.json'
import arManual from '~~/i18n/locales/ar/manual.json'

type Block =
  | { type: 'para'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'steps'; items: string[] }
  | { type: 'bullets'; items: string[] }
  | { type: 'tip'; title: string; body: string }
  | { type: 'warn'; title: string; body: string }
  | { type: 'kv'; items: { k: string; v: string }[] }

export type Chapter = {
  id: string
  num: string
  title: string
  blocks: Block[]
}

export type ManualModule = {
  id: string
  label: string
  icon: string
  status: 'ready' | 'soon'
  summary: string
}

export type ModuleArticle = {
  eyebrow: string
  title: string
  tagline: string
  route: string
  roles: string
  icon?: string
  gradient?: string
  toc: { id: string; label: string }[]
  chapters: Chapter[]
}

export type ManualCopy = {
  dir: 'ltr' | 'rtl'
  home: {
    eyebrow: string; title: string; sub: string
    searchPlaceholder: string
    modulesHeading: string; modulesSub: string
    addonsHeading?: string; addonsSub?: string
    footerCtaTitle: string; footerCtaBody: string; footerCtaButton: string
  }
  nav: {
    section: string; home: string
    modulesHeading: string; addonsHeading?: string
    onThisPage: string
    comingSoon: string; backToHome: string; editInApp: string
    prev: string; next: string
  }
  statusLabels: { ready: string; soon: string }
  modules: ManualModule[]
  addons?: ManualModule[]
  articles: Record<string, ModuleArticle>
}

const en = (enManual as { manual: ManualCopy }).manual
const ar = (arManual as { manual: ManualCopy }).manual

export function useManualCopy() {
  const { locale } = useI18n()
  return computed(() => (locale.value === 'ar' ? ar : en))
}

// Feature ids on /portal/features → manual article ids on /portal/manual/{id}.
// Returns null when the feature has no dedicated manual page (platform-level
// concerns like multi-tenancy, i18n and self-hosting are documented in /docs,
// not the operator manual).
const FEATURE_TO_MANUAL: Record<string, string | null> = {
  calendar: 'calendar',
  sales: 'sales',
  clients: 'clients',
  marketing: 'clients',
  catalogue: 'catalogue',
  inventory: 'inventory',
  events: 'events',
  team: 'team',
  accounting: 'accounting',
  reports: 'reports',
  portal: 'portal',
  'multi-tenant': null,
  i18n: null,
  'self-hosted': null,
  zatca: 'zatca',
  eta: 'eta',
  ai: 'ai-assistant',
  'reviews-loyalty': 'loyalty-points',
  notifications: 'settings',
  'workspace-control': 'settings',
  'activity-logs': 'settings',
}

const ADDON_TO_MANUAL: Record<string, string> = {
  zatca: 'zatca',
  eta: 'eta',
  ai: 'ai-assistant',
  gcal: 'google-calendar',
  insurance: 'insurance',
  dental: 'dental-chart',
  imaging: 'clinical-imaging',
  labs: 'lab-orders',
  rx: 'prescriptions',
  records: 'medical-records',
  resources: 'resources',
  attendance: 'client-attendance',
  loyalty: 'loyalty-points',
  events: 'events',
  followup: 'follow-up-tasks',
}

export function manualLinkForFeature(featureId: string): string | null {
  const id = FEATURE_TO_MANUAL[featureId]
  return id ? `/portal/manual/${id}` : null
}

export function manualLinkForAddon(addonKey: string): string | null {
  const id = ADDON_TO_MANUAL[addonKey]
  return id ? `/portal/manual/${id}` : null
}
