import { chromium } from 'playwright'

const baseUrl = process.env.BASE_URL || 'http://localhost:3009'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

const login = await page.request.post(`${baseUrl}/api/auth/login`, {
  data: { email: 'student1@elms.local', password: 'student123' }
})
if (!login.ok()) throw new Error(`Login failed: ${login.status()}`)

const results = []
for (const path of ['/courses/1', '/enrollments', '/student/sessions', '/support']) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle', timeout: 120000 })
  const metrics = await page.evaluate(() => ({
    path: location.pathname,
    viewport: document.documentElement.clientWidth,
    contentWidth: document.documentElement.scrollWidth,
    unlabeledButtons: [...document.querySelectorAll('button')].filter(button =>
      !button.textContent?.trim() && !button.getAttribute('aria-label') && !button.getAttribute('title')
    ).length
  }))
  results.push(metrics)
}

await page.goto(`${baseUrl}/courses/1`, { waitUntil: 'networkidle', timeout: 120000 })
await page.getByRole('button', { name: 'AR' }).click()
await page.waitForTimeout(500)
const rtl = await page.evaluate(() => ({
  dir: document.documentElement.dir,
  lang: document.documentElement.lang,
  contentWidth: document.documentElement.scrollWidth,
  viewport: document.documentElement.clientWidth
}))
await page.screenshot({ path: '.audit/screenshots/12-course-mobile-rtl.png', fullPage: true })

console.log(JSON.stringify({ pages: results, rtl }, null, 2))
if (results.some(item => item.contentWidth > item.viewport || item.unlabeledButtons > 0)) process.exitCode = 1
if (rtl.dir !== 'rtl' || rtl.contentWidth > rtl.viewport) process.exitCode = 1
await browser.close()
