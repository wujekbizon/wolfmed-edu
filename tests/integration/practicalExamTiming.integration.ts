import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { test, before, after } from 'node:test'
import { practicalTimingBundle } from './support/practicalTimingBundle'

const require = createRequire(import.meta.url)
const moduleRoot = process.env.CODEX_TEST_NODE_MODULES
const { chromium } = moduleRoot ? require(`${moduleRoot}/playwright`) : require('playwright')
let browser: any
let bundle: string

before(async () => {
  bundle = await practicalTimingBundle()
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) })
})
after(async () => { await browser?.close() })

async function fixture(run: (page: any) => Promise<void>) {
  const context = await browser.newContext()
  await context.route('**/*', (route: any) => route.abort())
  const page = await context.newPage()
  const errors: string[] = []
  page.on('pageerror', (error: Error) => errors.push(error.message))
  try {
    await page.clock.install({ time: new Date('2026-10-23T10:00:00Z') })
    await page.setContent('<div id="root"></div>')
    await page.addScriptTag({ content: bundle })
    await page.locator('#start').click()
    await run(page)
    assert.deepEqual(errors, [], 'Unexpected browser runtime error')
  } finally { await context.close() }
}
const snapshot = (page: any) => page.evaluate(() => (window as any).timingSnapshot())
const release = (page: any, status: string) => page.evaluate((value: string) => (window as any).timingRelease(value), status)
async function settle(page: any, count: number) {
  await page.waitForFunction((expected: number) => (window as any).timingSnapshot().calls.length >= expected, count)
}

test('elapsed seconds at first submission reflect the fake clock', async () => {
  await fixture(async (page) => {
    await page.clock.fastForward(180_000)
    await page.locator('#answer').click()
    await page.locator('#submit').click()
    await settle(page, 1)
    await release(page, 'SUCCESS')
    await page.waitForFunction(() => (window as any).timingSnapshot().studyMinutes.length === 1)
    const actual = await snapshot(page)
    console.log(JSON.stringify({ case: 'elapsed', expectedSeconds: 180, expectedStudyMinutes: 3, actual }))
    assert.equal(actual.calls[0], 180, 'First submission must send 180 elapsed seconds')
    assert.equal(actual.studyMinutes[0], 3, 'Mock logger must receive the correct study minutes')
  })
})

test('timeout requests submission once despite pending and error rerenders', async () => {
  await fixture(async (page) => {
    await page.clock.fastForward(7_200_000)
    await settle(page, 1)
    await page.locator('#rerender').click()
    await release(page, 'ERROR')
    await page.locator('#rerender').click()
    const actual = await snapshot(page)
    console.log(JSON.stringify({ case: 'timeout-rerenders', expectedSubmissions: 1, actual }))
    assert.equal(actual.submissions, 1, 'Expiry must submit only once per attempt')
    assert.equal(actual.calls.length, 1, 'No duplicate grading action should be queued')
  })
})

test('manual submission pending at deadline does not queue another', async () => {
  await fixture(async (page) => {
    await page.clock.fastForward(7_195_000)
    await page.locator('#submit').click()
    await settle(page, 1)
    await page.clock.fastForward(5_000)
    await page.locator('#rerender').click()
    const actual = await snapshot(page)
    console.log(JSON.stringify({ case: 'manual-at-deadline', expectedSubmissions: 1, actual }))
    assert.equal(actual.submissions, 1, 'Pending manual submission must not be duplicated by timeout')
    assert.equal(actual.calls.length, 1)
  })
})

test('an error permits a manual retry with freshly captured elapsed seconds', async () => {
  await fixture(async (page) => {
    await page.clock.fastForward(180_000)
    await page.locator('#submit').click()
    await settle(page, 1)
    await release(page, 'ERROR')
    await page.waitForFunction(() => document.getElementById('pending')?.textContent === 'false')
    await page.clock.fastForward(20_000)
    await page.locator('#submit').click()
    await settle(page, 2)
    const actual = await snapshot(page)
    console.log(JSON.stringify({ case: 'manual-retry', expectedSeconds: [180, 200], actual }))
    assert.deepEqual(actual.calls, [180, 200])
  })
})

test('restart creates a fresh countdown before a new expiry', async () => {
  await fixture(async (page) => {
    await page.clock.fastForward(60_000)
    await page.locator('#restart').click()
    await page.locator('#start').click()
    await page.clock.fastForward(7_140_000)
    assert.equal((await snapshot(page)).submissions, 0)
    await page.clock.fastForward(60_000)
    await settle(page, 1)
    console.log('Restart control: no old-deadline submission; new deadline expires')
  })
})
