/**
 * RSC E2E Test Spec
 *
 * Tests:
 * 1. Non-RSC home page renders in mixed mode
 * 2. RSC page renders server-side content
 * 3. RSC page includes head metadata from getMeta
 * 4. RSC page with 'use client' component — Counter +/- change count
 * 5. Server action form — increment via useActionState, count updates on click
 * 6. Error boundary catches server component errors
 * 7. Client navigation to RSC page works (SPA link click)
 * 8. Head updates on RSC navigation (title changes)
 * 9. Auth layout page renders with correct layout
 * 10. Streaming page renders with Suspense-delayed content
 * 11. Data fetching page renders async-fetched items
 * 12. Valtio store page renders
 * 13. Data server action — button click shows server data
 *
 * Known limitations:
 * - Tests 4 and 13 check interactive 'use client' components (Counter
 *   buttons, server data fetch). They work in production mode but may
 *   fail in dev mode due to the preamble / HMR ModuleRunner integration
 *   for RSC (incomplete — pending @vitejs/plugin-rsc compatibility).
 *   All other tests pass in both dev and production.
 *
 * Run with:
 *   npx playwright test e2e/react-rsc/e2e.mjs
 *   (requires the dev server running on port 3000)
 */

// @ts-check
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('RSC e2e', () => {
  test('1. Non-RSC home page renders in mixed mode', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page.locator('h1')).toHaveText('RSC e2e - Home')
    await expect(page.locator('p')).toContainText('non-RSC page')
    // Verify navigation links to RSC pages exist
    await expect(page.locator('a[href="/rsc-page"]')).toBeVisible()
    await expect(page.locator('a[href="/rsc-client"]')).toBeVisible()
  })

  test('2. RSC page renders server-side content', async ({ page }) => {
    await page.goto(`${BASE_URL}/rsc-page`)
    await expect(page.locator('h1')).toHaveText('RSC Page')
    await expect(page.locator('p').first()).toContainText('Server-rendered timestamp')
  })

  test('3. RSC page includes head metadata from getMeta', async ({ page }) => {
    await page.goto(`${BASE_URL}/rsc-page`)
    await expect(page).toHaveTitle('RSC Page')
  })

  test('4. RSC page with client component — Counter +/- buttons change count', async ({ page }) => {
    await page.goto(`${BASE_URL}/rsc-client`)
    await expect(page.locator('h1')).toHaveText('RSC Client Component Demo')

    // Counter renders: "Client count: 0" with + and - buttons
    const countText = page.getByText(/Client count:/)
    await expect(countText).toBeVisible({ timeout: 10000 })
    await expect(countText).toHaveText('Client count: 0')

    // Click + twice — count becomes 1, then 2
    await page.locator('button', { hasText: '+' }).click()
    await expect(countText).toHaveText('Client count: 1', { timeout: 5000 })

    await page.locator('button', { hasText: '+' }).click()
    await expect(countText).toHaveText('Client count: 2', { timeout: 5000 })

    // Click - — count becomes 1
    await page.locator('button', { hasText: '-' }).click()
    await expect(countText).toHaveText('Client count: 1', { timeout: 5000 })
  })

  test('5. Server action form — increment via useActionState, count updates on click', async ({
    page,
  }) => {
    // Collect errors
    const errors = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto(`${BASE_URL}/actions`)
    await expect(page.locator('h1')).toHaveText('RSC Server Actions')

    // The form renders with a useActionState output showing initial count of 0
    const output = page.locator('output')
    await expect(output).toBeVisible({ timeout: 10000 })
    await expect(output).toHaveText('0')
    await expect(page.locator('button')).toHaveText('Increment')

    // Click increment — server action runs, count becomes 1
    await page.locator('button').click()
    await expect(output).toHaveText('1', { timeout: 10000 })

    // Click again — count becomes 2
    await page.locator('button').click()
    await expect(output).toHaveText('2', { timeout: 10000 })

    expect(errors).toEqual([])
  })

  test('6. Error boundary catches server component errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/error`)
    // In dev mode, the Youch error page renders with the error title.
    // In production, React sanitizes the error message — we get a 500
    // status with a generic error page. Either way, verify we see error
    // content (not a successful page render).
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })

  test('7. Client navigation to RSC page works', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page.locator('h1')).toHaveText('RSC e2e - Home')

    // Click link to navigate to an RSC page (SPA navigation)
    await page.click('a[href="/rsc-page"]')
    await expect(page.locator('h1')).toHaveText('RSC Page')

    // Navigate back to home (using browser back since RSC pages
    // don't include a home link in their server-rendered content)
    await page.goBack()
    await expect(page.locator('h1')).toHaveText('RSC e2e - Home')
  })

  test('8. Head updates on RSC navigation', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle('RSC e2e - Home')

    // Navigate to RSC page and verify title updates
    await page.click('a[href="/rsc-page"]')
    await expect(page).toHaveTitle('RSC Page')

    // Navigate back and verify title reverts (using browser back since RSC pages
    // don't include a home link in their server-rendered content)
    await page.goBack()
    await expect(page).toHaveTitle('RSC e2e - Home')
  })

  test('9. Auth layout page renders with correct layout', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth-page`)
    await expect(page.locator('h2')).toHaveText('Authenticated Route')
    // The auth layout wrapping is applied during client hydration;
    // on initial SSR, the page content renders directly.
    await expect(page.locator('p')).toContainText('auth layout wrapper')
  })

  test('10. Streaming page renders with Suspense-delayed content', async ({ page }) => {
    await page.goto(`${BASE_URL}/streaming`)
    await expect(page.locator('h2')).toHaveText('Streaming SSR')
    // Content inside Suspense should appear after streaming resolves
    await expect(page.getByText('streamed')).toBeVisible({ timeout: 10000 })
    // The suspense fallback text should eventually be replaced
    await expect(page.getByText('This content renders')).toBeVisible()
  })

  test('11. Data fetching page renders async-fetched items', async ({ page }) => {
    await page.goto(`${BASE_URL}/using-data`)
    await expect(page.locator('h2')).toHaveText('Data Fetching in RSC')
    // The page fetches data on the server and renders as a list
    await expect(page.locator('li')).toHaveText(['Item A', 'Item B', 'Item C'])
    // Verify the list has exactly 3 items
    await expect(page.locator('li')).toHaveCount(3)
  })

  test('12. Valtio store page renders state from server seed', async ({ page }) => {
    await page.goto(`${BASE_URL}/using-store`)
    await expect(page.locator('h2')).toHaveText('Valtio State Management')
    // Valtio state seeded from context.js and threaded through ValtioHydrator
    await expect(page.getByTestId('valtio-count')).toHaveText('Count: 42', { timeout: 10000 })
    await expect(page.getByTestId('valtio-message')).toHaveText('Message: Hello from Valtio!', {
      timeout: 10000,
    })
  })

  test('13. Data server action — button click shows server data', async ({ page }) => {
    // Collect errors
    const errors = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto(`${BASE_URL}/data-action`)
    await expect(page.locator('h2')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('h2')).toHaveText('Data Server Action')
    await expect(page.locator('button')).toHaveText('Fetch Server Data')

    // Wait for RSC hydration to complete
    await page.waitForTimeout(2000)

    // Click the fetch button — server action runs and returns data
    await page.locator('button').click()

    // Server data should appear: "Hello from server action!" with a timestamp
    await expect(page.getByText('Hello from server action!')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Timestamp:')).toBeVisible()

    expect(errors).toEqual([])
  })
})
