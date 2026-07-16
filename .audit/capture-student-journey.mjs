import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const output = new URL('./screenshots/', import.meta.url)
const baseUrl = process.env.BASE_URL || 'http://localhost:3009'
await mkdir(output, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })

async function capture(name, path) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(3000)
  await page.screenshot({ path: new URL(`${name}.png`, output).pathname, fullPage: true })
  console.log(name, page.url(), await page.title())
}

await capture('01-login', '/login')
await capture('02-register', '/register?redirect=/courses/1')
await capture('03-forgot-password', '/forgot-password')
await capture('04-reset-password-invalid', '/reset-password')
await capture('05-course-detail-guest', '/courses/1')

const loginResponse = await page.request.post(`${baseUrl}/api/auth/login`, {
  data: { email: 'student1@elms.local', password: 'student123' }
})
if (!loginResponse.ok()) throw new Error(`Login failed: ${loginResponse.status()} ${await loginResponse.text()}`)
await page.goto(`${baseUrl}/courses/1`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await page.waitForTimeout(1000)
await page.screenshot({ path: new URL('06-course-detail-enrolled.png', output).pathname, fullPage: true })

await capture('07-enrollments', '/enrollments')
const enrollmentsResponse = await page.request.get(`${baseUrl}/api/enrollments/me`)
const enrollment = (await enrollmentsResponse.json()).enrollments.find(item => item.course.id === 1)
await capture('08-book-session', `/student/sessions/book?enrollment=${enrollment.id}`)
await page.reload({ waitUntil: 'networkidle', timeout: 120000 })
await page.waitForTimeout(2000)
console.log('book-background', await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor))
await page.screenshot({ path: new URL('08-book-session.png', output).pathname, fullPage: true })
await capture('09-my-sessions', '/student/sessions')

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
await mobile.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await mobile.screenshot({ path: new URL('10-login-mobile.png', output).pathname, fullPage: true })
await mobile.goto(`${baseUrl}/courses/1`, { waitUntil: 'domcontentloaded', timeout: 120000 })
await mobile.screenshot({ path: new URL('11-course-mobile.png', output).pathname, fullPage: true })

await browser.close()
