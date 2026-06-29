/**
 * RSC E2E Test Spec
 *
 * Tests:
 * 1. RSC page renders server-fetched content
 * 2. RSC page includes head metadata from getMeta
 * 3. Client navigation to RSC page fetches .rsc and renders
 * 4. Head updates on .rsc navigation
 * 5. Server action via <form action={serverFn}> works
 * 6. Error boundary catches server component errors
 * 7. Non-RSC pages work alongside RSC pages (mixed mode)
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
  })

  test('2. RSC page renders server-fetched content', async ({ page }) => {
    await page.goto(`${BASE_URL}/rsc-page`)
    await expect(page.locator('h1')).toHaveText('RSC Page')
    await expect(page.locator('p').first()).toContainText('Server-rendered timestamp')
  })

  test('3. RSC page includes head metadata from getMeta', async ({ page }) => {
    await page.goto(`${BASE_URL}/rsc-page`)
    await expect(page).toHaveTitle('RSC Page')
  })

  test('4. RSC page with client component renders and is interactive', async ({ page }) => {
    await page.goto(`${BASE_URL}/rsc-client`)
    await expect(page.locator('h1')).toHaveText('RSC Client Component Demo')
    await expect(page.locator('p')).toContainText('Client count: 0')

    // Click the + button and verify the count increments
    await page.click('button:has-text("+")')
    await expect(page.locator('p')).toContainText('Client count: 1')

    await page.click('button:has-text("+")')
    await expect(page.locator('p')).toContainText('Client count: 2')

    // Click the - button and verify the count decrements
    await page.click('button:has-text("-")')
    await expect(page.locator('p')).toContainText('Client count: 1')
  })

  test('5. Error boundary catches server component errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/error`)
    // The RSC content component has a built-in error boundary that catches
    // errors thrown during server component rendering
    await expect(page.locator('[role="alert"]')).toBeVisible()
  })

  test('6. Client navigation to RSC page works', async ({ page }) => {
    // Start at the non-RSC home page
    await page.goto(BASE_URL)
    await expect(page.locator('h1')).toHaveText('RSC e2e - Home')

    // Click link to navigate to an RSC page
    await page.click('a[href="/rsc-page"]')
    await expect(page.locator('h1')).toHaveText('RSC Page')
  })

  test('7. Head updates on RSC navigation', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle('RSC e2e - Home')

    // Navigate to RSC page and verify title changes
    await page.click('a[href="/rsc-page"]')
    await expect(page).toHaveTitle('RSC Page')
  })
})
