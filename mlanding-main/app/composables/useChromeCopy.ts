// Reactive accessors for the dashboard/admin chrome strings.
// Mirrors useLandingCopy() — JSON imported directly so vue-i18n's compiler
// is bypassed (consistent with the rest of Portal).
//
//   const chrome = useChromeCopy()
//   chrome.value.dashboard.title
//   chrome.value.admin.nav.licenses

import enChrome from '~~/i18n/locales/en/chrome.json'
import arChrome from '~~/i18n/locales/ar/chrome.json'

export type ChromeCopy = {
  common: {
    signOut: string; account: string
    lightMode: string; darkMode: string; switchToLight: string; switchToDark: string
    openMenu: string; closeMenu: string; mainMenu: string
    language: string; backToHome: string; profile: string
    save: string; cancel: string; create: string; update: string
    delete: string; edit: string
    active: string; inactive: string; actions: string
  }
  dashboard: {
    title: string
    nav: { licenses: string; profile: string }
  }
  admin: {
    title: string; backToPortal: string; portalDashboard: string
    nav: {
      dashboard: string; licenses: string; customers: string; purchases: string
      plans: string; features: string; promoCodes: string
      githubInvites: string; auditLog: string; settings: string
    }
    submenu: {
      licenses: string; allLicenses: string; issueNew: string
      purchases: string; allOrders: string
      settings: string; general: string; integrations: string
    }
    backupPage: {
      docTitle: string; title: string; subtitle: string
      exportSection: string; exportDesc: string; exportButton: string; exportingHint: string
      importSection: string; importDesc: string
      importFile: string; importMode: string
      modeMerge: string; modeReplace: string
      replaceConfirmHint: string; replaceConfirmPlaceholder: string
      importPreview: string; importPreviewSummary: string
      importButton: string; importingHint: string
      toastExportFailed: string; toastImported: string; toastImportFailed: string
      noFile: string
      warningTitle: string; warningBody: string
    }
    indexPage: {
      docTitle: string; title: string; subtitle: string
      kpiActiveLicenses: string; kpiRevokedLicenses: string; kpiLiveInstalls: string
      kpiCustomers: string; kpiPaidOrders: string; kpiRefunded: string
      kpiPendingInvites: string; kpiRevenue: string
      recentTitle: string; viewAll: string; noPurchases: string
    }
    auditPage: {
      docTitle: string; title: string; subtitle: string
      refresh: string; empty: string; byActor: string; targetLabel: string
    }
    invitesPage: {
      docTitle: string; title: string; subtitle: string
      refresh: string; empty: string
      filterAll: string; filterPending: string; filterSent: string; filterAccepted: string; filterFailed: string
      attemptsLabel: string; sentPrefix: string; acceptedPrefix: string; retry: string
      toastInviteSent: string; toastRetryCompleted: string; toastRetryFailed: string
    }
    licensesPage: {
      docTitle: string; title: string; subtitle: string; issueNew: string
      searchPlaceholder: string; search: string; empty: string
      filterAll: string; filterActive: string; filterRevoked: string; filterExpired: string
      installsSuffix: string
      fieldMaxActivations: string; fieldNotes: string; fieldNotesPlaceholder: string
      revokeConfirm: string
      toastRevokeFailed: string; toastUpdateFailed: string; toastReinstateFailed: string
    }
    licensesNewPage: {
      docTitle: string; backToLicenses: string; title: string; subtitle: string
      successTitle: string; successDesc: string; copyBtn: string; doneBtn: string
      secCustomer: string; searchPlaceholder: string; noMatches: string; changeBtn: string
      secDetails: string
      fieldPlan: string
      fieldMaxActivations: string; hintDefaultForPlan: string; hintUsePlanDefault: string
      fieldExpiresAt: string; hintExpiresAt: string
      fieldNotes: string; placeholderNotes: string
      issueBtn: string; cancelBtn: string
      toastIssueFailed: string; toastKeyCopied: string
    }
    ordersPage: {
      docTitle: string; title: string; subtitle: string
      searchPlaceholder: string; search: string; empty: string
      filterAll: string; filterPaid: string; filterRefunded: string; filterPending: string; filterFailed: string
      licenseOne: string; licenseMany: string
    }
    orderDetailPage: {
      docTitleLoading: string; docTitleLoaded: string
      backToPurchases: string; title: string; viewLsReceipt: string
      secCustomer: string; secDetails: string
      fieldPlan: string; fieldLsOrderId: string; fieldLsCustomerId: string; fieldRefunded: string
      secLicenses: string; emptyLicenses: string; maxPrefix: string
      secRaw: string; loading: string
    }
    usersPage: {
      docTitle: string; title: string; subtitle: string
      searchPlaceholder: string; search: string; empty: string
      adminBadge: string; inactiveBadge: string; joinedPrefix: string
      licenseOne: string; licenseMany: string; orderOne: string; orderMany: string
    }
    userDetailPage: {
      docTitle: string; backToCustomers: string
      keyTitle: string; keyDesc: string; copyBtn: string; doneBtn: string
      secAccount: string
      fieldGithub: string; fieldJoined: string; fieldLastLogin: string; fieldStatus: string
      statusActive: string; statusDisabled: string; adminBadge: string
      actionDeactivate: string; actionReactivate: string; actionRevokeAdmin: string; actionGrantAdmin: string
      secLicenses: string; btnIssueLicense: string; emptyLicenses: string
      fieldPlan: string; fieldMaxActivations: string; hintMaxActivations: string; placeholderDefault: string
      fieldNotes: string; placeholderNotes: string
      issueBtn: string; cancelBtn: string
      installsSuffix: string; issuedPrefix: string
      secOrders: string; emptyOrders: string
      toastIssueFailed: string; toastKeyCopied: string; toastUpdateFailed: string
    }
    settingsPage: {
      docTitle: string; title: string; subtitle: string
      warningTitle: string
      warnPepperMissing: string; warnPrivateKeyMissing: string
      warnKeypairMismatch: string; warnCookieInsecure: string
      secKeypair: string
      fieldPrivateSeed: string; badgeConfigured: string; badgeMissing: string
      fieldKeypairValid: string; badgeRoundTripOk: string; badgeMismatch: string
      fieldPublicKey: string; keypairExplainer: string; regenerateTitle: string
      secRuntime: string
      fieldPortalUrl: string; fieldCookieSecure: string
      badgeEnabled: string; badgeDisabled: string; badgeSet: string; badgeNotSet: string
      integrationsTitle: string; integrationsDesc: string; integrationsOpen: string
    }
    integrationsPage: {
      docTitle: string; title: string; subtitle: string; refresh: string
      save: string; test: string
      currentValueHint: string; envFallbackHint: string
      secretSetHint: string; secretUnsetHint: string
      lsTitle: string; lsActive: string; lsActiveTest: string
      statusNotConfigured: string; statusMisconfigured: string; statusActive: string
      fieldApiKey: string; badgeSet: string; badgeMissing: string
      fieldWebhookSecret: string; fieldStoreId: string; fieldStoreDomain: string
      fieldTestMode: string; lsTestModeHint: string
      ghTitle: string
      fieldToken: string; fieldTokenHint: string; badgeNotSet: string
      fieldTokenValid: string; badgeVerified: string; badgeRejected: string
      fieldOrg: string; fieldTeamSlug: string; fieldRepo: string
      smtpTitle: string; smtpDisabled: string
      fieldHost: string; fieldPort: string; fieldUser: string; fieldPass: string; fieldFrom: string
      fieldAuth: string; authWithUser: string; authRelay: string; smtpUnsetNote: string
      smtpTestRecipient: string
      pepperTitle: string; pepperDesc: string
      toastSaved: string; toastSaveFailed: string; toastTestOk: string; toastTestFailed: string
    }
    plansPage: {
      docTitle: string; title: string; subtitle: string
      newButton: string; emptyState: string
      rowDefaultActivations: string
      rowLicenseOne: string; rowLicenseMany: string
      rowOrderOne: string; rowOrderMany: string
      rowFeatureOne: string; rowFeatureMany: string
      rowLsVariant: string
      modalCreateTitle: string; modalEditTitle: string
      secProfile: string; secProfileDesc: string
      fieldSlug: string; fieldSlugHint: string; fieldSlugPlaceholder: string
      fieldSortOrder: string
      fieldNameEn: string; fieldNameAr: string
      fieldDescEn: string; fieldDescAr: string
      secPricing: string; secPricingDesc: string
      fieldPrice: string; fieldDefaultActivations: string
      fieldLsVariant: string; fieldLsVariantPlaceholder: string
      secFeatures: string; secFeaturesSelected: string; secFeaturesDesc: string
      noFeaturesDefined: string
      secActiveDesc: string
      toastCreated: string; toastUpdated: string; toastDeleted: string
      toastInUseTitle: string; toastInUseDesc: string
      deleteConfirm: string
    }
    featuresPage: {
      docTitle: string; title: string; subtitle: string
      newButton: string; emptyState: string
      rowPlanOne: string; rowPlanMany: string
      modalCreateTitle: string; modalEditTitle: string
      fieldLabelEn: string; fieldLabelEnPlaceholder: string
      fieldLabelAr: string; fieldLabelArPlaceholder: string
      fieldSortOrder: string; fieldSortOrderHint: string
      fieldNotes: string; fieldNotesHint: string
      toastCreated: string; toastUpdated: string; toastDeleted: string
      deleteConfirm: string; deleteConfirmAttached: string
    }
    promoCodesPage: {
      docTitle: string; title: string; subtitle: string
      newButton: string; emptyState: string
      anyPlan: string; expiredBadge: string; discountSuffix: string
      rowUses: string; rowExpires: string
      rowOrderOne: string; rowOrderMany: string
      modalCreateTitle: string; modalEditTitle: string
      secCode: string; secCodeDesc: string
      fieldCode: string; fieldCodeHint: string; fieldCodePlaceholder: string
      fieldDiscount: string; fieldRestrictPlan: string
      secLimits: string; secLimitsDesc: string
      fieldMaxUses: string; fieldMaxUsesHint: string
      fieldExpires: string
      secNotes: string; secNotesDesc: string
      fieldNotes: string; fieldNotesHint: string
      toastCreated: string; toastUpdated: string; toastDeleted: string
      toastInUseTitle: string; toastInUseDesc: string
      deleteConfirm: string
    }
  }
  auth: {
    signIn: {
      docTitle: string; title: string; subtitle: string
      email: string; emailPlaceholder: string
      password: string; passwordPlaceholder: string
      forgotPassword: string; submit: string
      newHerePrompt: string; newHereCta: string
      failedToast: string
    }
    register: {
      docTitle: string; title: string; subtitle: string
      firstName: string; lastName: string
      email: string; password: string; passwordHint: string
      github: string; githubHint: string; githubPlaceholder: string
      submit: string; haveAccountPrompt: string; haveAccountCta: string
      failedToast: string
    }
    forgot: {
      docTitle: string; title: string; subtitle: string
      email: string; submit: string
      sentBody: string; backToSignIn: string; failedToast: string
    }
    reset: {
      docTitle: string; title: string; subtitle: string
      newPassword: string; confirmPassword: string; submit: string
      doneBody: string; signIn: string
      tokenMissing: string; missingTokenToast: string; missingTokenDesc: string
      failedToast: string
    }
  }
  pages: {
    dashboardLicenses: {
      docTitle: string; welcome: string; welcomeNamed: string; intro: string
      buyLicense: string
      statTotal: string; statActive: string; statInstalls: string; statPlans: string
      yourLicenses: string; refresh: string
      emptyTitle: string; emptyHint: string
      installsLabel: string; issuedShort: string; expiresShort: string
      operator: string; opCustomers: string; opAllLicenses: string; opAuditLog: string
      signedInAs: string; visitMarketing: string
      purchasedToastTitle: string; purchasedToastDesc: string
    }
    dashboardLicenseDetail: {
      docTitle: string; backToLicenses: string
      rotateSection: string; newKeyHeading: string; newKeyExplain: string
      copyKey: string; done: string
      generateNewKey: string; rotateExplain: string; rotateButton: string
      confirmRotate: string; cancel: string
      rotateFailed: string; keyCopied: string
      detailsSection: string; plan: string; activations: string
      issued: string; expires: string; neverPerpetual: string
      whereIsKey: string
      wherePara1Lead: string; wherePara1Strong: string; wherePara1Tail: string
      whereYouCanFind: string
      whereInEmailLead: string; whereInEmailStrong: string; whereInEmailTail: string
      whereInEmailSubject: string; whereInEmailSearch: string; whereInEmailPeriod: string
      whereInPasswordManager: string
      whereInInstallerLead: string; whereInInstallerStrong: string; whereInInstallerTail: string
      whereLostLead: string; whereLostStrong: string; whereLostTail: string
      activeInstalls: string; noInstalls: string; noInstallsHint: string
      lastSeen: string; deactivated: string
    }
    dashboardProfile: {
      docTitle: string; title: string; subtitle: string
      accountSection: string
      firstName: string; lastName: string; email: string
      githubUsername: string; githubHint: string; githubPlaceholder: string
      save: string
      profileSavedToast: string; profileSavedInviteSent: string; profileSavedInviteIssue: string
      inviteAddedDesc: string; inviteSeeProfile: string; saveFailedToast: string
      sourceAccessSection: string
      inviteFor: string; sentLabel: string; acceptedLabel: string; attemptsLabel: string
      inviteSentInstructions: string; noInviteYet: string
      changePassword: string
      currentPassword: string; newPassword: string; newPasswordHint: string; confirmPassword: string
      updatePassword: string; passwordUpdatedToast: string; updateFailedToast: string
      joinedFooter: string
    }
  }
}

// Tiny `{name}` → value interpolator. Keeps ICU/MessageFormat out of the
// picture — Portal bypasses vue-i18n's compiler on purpose.
export function fillTemplate(tpl: string, vars: Record<string, string | number>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`))
}

const en = (enChrome as { chrome: ChromeCopy }).chrome
const ar = (arChrome as { chrome: ChromeCopy }).chrome

export function useChromeCopy() {
  const { locale } = useI18n()
  return computed<ChromeCopy>(() => (locale.value === 'ar' ? ar : en))
}

// Map a server error from $fetch (or the network) to a localized description.
// Server endpoints attach `data.code` (e.g. EMAIL_TAKEN, INVALID_CREDENTIALS) so
// the client can look up a translated message instead of showing the raw English
// `statusMessage`. Falls back to the server message and finally to a generic
// localized string so the user never sees an empty toast.
export function localizeAuthError(err: any, chrome: any): string {
  const code = err?.data?.code
  const errors = chrome?.auth?.errors as Record<string, string> | undefined
  if (code && errors && errors[code]) return errors[code]
  return err?.statusMessage || err?.message || errors?.GENERIC || 'Something went wrong.'
}
