import assert from 'node:assert/strict'
import test from 'node:test'
import { getDashboardAccess } from '@/helpers/getDashboardAccess'
import { resolveNaukaTabs } from '@/helpers/resolveNaukaTabs'

test('Basic recognises its course without granting Premium tools or other courses', () => {
  const access = getDashboardAccess([{ courseSlug: 'pielegniarstwo', accessTier: 'basic', isActive: true }])
  assert.deepEqual([...access.accessibleCourses], ['pielegniarstwo'])
  assert.equal(access.hasPremium, false)
  assert.equal(access.upgradeHref, '/kierunki/pielegniarstwo#cennik')
})

test('Premium and Pro both grant course and tool access', () => {
  for (const accessTier of ['premium', 'pro']) {
    const access = getDashboardAccess([{ courseSlug: 'opiekun-medyczny', accessTier, isActive: true }])
    assert.equal(access.accessibleCourses.has('opiekun-medyczny'), true)
    assert.equal(access.hasPremium, true)
  }
})

test('inactive and free enrollments do not grant paid access', () => {
  const access = getDashboardAccess([
    { courseSlug: 'opiekun-medyczny', accessTier: 'premium', isActive: false },
    { courseSlug: 'pielegniarstwo', accessTier: 'free', isActive: true },
  ])
  assert.equal(access.accessibleCourses.size, 0)
  assert.equal(access.hasPremium, false)
})

test('English Basic is recognised without promoting its unavailable Premium offer', () => {
  const access = getDashboardAccess([{ courseSlug: 'angielski-medyczny', accessTier: 'basic', isActive: true }])
  assert.equal(access.accessibleCourses.has('angielski-medyczny'), true)
  assert.equal(access.upgradeHref, '/kierunki')
})

test('direct links select workspace or the lectures library tab', () => {
  assert.equal(resolveNaukaTabs('workspace', null, true).active, 'workspace')
  assert.deepEqual(resolveNaukaTabs('library', 'lectures', true), { active: 'library', libraryTab: 'lectures' })
})

test('Basic lecture links fall back to an available library tab', () => {
  assert.deepEqual(resolveNaukaTabs('library', 'lectures', false), { active: 'library', libraryTab: 'notes' })
  assert.equal(resolveNaukaTabs('library', 'flashcards', false).libraryTab, 'flashcards')
})

test('missing or invalid tabs fall back safely', () => {
  for (const value of [null, '', 'invalid']) {
    assert.deepEqual(resolveNaukaTabs(value, value, true), { active: 'categories', libraryTab: 'notes' })
  }
})
