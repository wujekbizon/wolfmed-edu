import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ProceduresHubLayout from '@/components/ProceduresHubLayout'
import ExamHubStats from '@/components/ExamHubStats'
import HubStats from '@/components/ui/HubStats'
import ExamWolfekWelcome from '@/components/wolfek/ExamWolfekWelcome'
import { getProcedureHubCards } from '@/helpers/getProcedureHubCards'

test('two enrolled courses render linked tabs with only Opiekun active', () => {
  const panels = getProcedureHubCards([{ slug: 'pielegniarstwo' }, { slug: 'opiekun-medyczny' }])
    .map(card => ({ id: card.slug, label: card.title, content: card.description }))
  const html = renderToStaticMarkup(createElement(ProceduresHubLayout, { panels }))
  assert.match(html, /role="tablist" aria-label="Kurs procedur"/)
  assert.match(html, /id="procedures-hub-tab-opiekun-medyczny"[^>]*aria-selected="true"/)
  assert.match(html, /id="procedures-hub-tab-pielegniarstwo"[^>]*aria-selected="false"/)
  assert.match(html, /id="procedures-hub-panel-pielegniarstwo"[^>]*hidden=""/)
  assert.match(html, /Poznaj procedury medyczne/)
  assert.match(html, /aria-label="Wolfek i strzykawka — odtwórz animację"/)
  assert.doesNotMatch(html, /Wolfek przegląda arkusz/)
})

test('single course renders its panel without redundant tabs', () => {
  const html = renderToStaticMarkup(createElement(ProceduresHubLayout, {
    panels: [{ id: 'pielegniarstwo', label: 'Pielęgniarstwo', content: 'Nursing panel' }],
  }))
  assert.doesNotMatch(html, /role="tab(list|panel)"/)
  assert.match(html, /Nursing panel/)
})

test('exam welcome retains the sheet animation', () => {
  const html = renderToStaticMarkup(createElement(ExamWolfekWelcome, { active: 'theory' }))
  assert.match(html, /Wolfek przegląda arkusz/)
  assert.doesNotMatch(html, /Wolfek i strzykawka/)
})

test('empty hub preserves the no-access message without navigation', () => {
  const html = renderToStaticMarkup(createElement(ProceduresHubLayout, { panels: [] }))
  assert.match(html, /Brak dostępu do procedur/)
  assert.doesNotMatch(html, /role="tab(list|panel)"/)
})

test('shared statistics render zero counts and retain the exam implementation', () => {
  const stats = [
    { icon: null, label: 'procedur', value: '0' },
    { icon: null, label: 'szacowany czas nauki', value: '~45 godz.' },
  ]
  const html = renderToStaticMarkup(createElement(HubStats, { stats }))
  assert.match(html, /<dd[^>]*>0<\/dd>/)
  assert.match(html, /~45 godz\./)
  assert.equal(html, renderToStaticMarkup(createElement(ExamHubStats, { stats })))
})
