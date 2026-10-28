import test from 'node:test'
import assert from 'node:assert/strict'
import { analyzeKeywordRanking, toPlainText } from '../src/utils/keywordRanking.js'
import { newsFixture } from './fixtures/news.js'

const analyze = (items) => analyzeKeywordRanking(items).rankings

test('정상 표본: 기사 수와 제목·요약 가중치', () => {
  const result = analyzeKeywordRanking(newsFixture)
  assert.equal(result.articleCount, 3)
  assert.deepEqual(result.rankings[0], { rank: 1, keyword: 'ai', articleCount: 2, score: 5 })
  assert.equal(result.rankings.find((row) => row.keyword === '반도체').score, 4)
})

test('데이터 0개', () => {
  assert.deepEqual(analyzeKeywordRanking([]), { sampleCount: 0, articleCount: 0, rankings: [] })
})

test('동일 URL 또는 정리된 동일 제목 중복 제거', () => {
  const result = analyzeKeywordRanking([
    { title: '<b>반도체 성장</b>', link: 'https://example.test/a#top' },
    { title: '다른 제목', link: 'https://example.test/a' },
    { title: '반도체 성장!', link: 'https://example.test/b' },
  ])
  assert.equal(result.articleCount, 1)
  assert.equal(result.rankings.find((row) => row.keyword === '반도체').score, 2)
})

test('HTML·문자/숫자 엔티티와 스크립트 정리', () => {
  assert.equal(toPlainText('<b>AI</b>&nbsp;&amp; &#48152;&#xB3C4;체<script>광고</script>'), 'AI & 반도체')
  assert.equal(toPlainText('&#99999999; &unknown; <style>광고</style>'), '')
  assert.equal(toPlainText('&lt;b&gt;반도체&lt;/b&gt;'), '반도체')
})

test('한글 조사·영문 대소문자·숫자 혼합 토큰', () => {
  const rows = analyze([{ title: '반도체는 반도체를 AI ai AI는 GPT4 2026 !' }])
  assert.deepEqual(rows.map((row) => row.keyword).sort(), ['ai', 'gpt4', '반도체'].sort())
})

test('불용어와 한 글자 토큰 제거', () => {
  assert.deepEqual(analyze([{ title: '기자 뉴스 관련 사진 제공 the and 가 123' }]), [])
})

test('같은 기사 내 반복은 영역마다 한 번, 기사 수는 한 번', () => {
  assert.deepEqual(analyze([{ title: 'AI AI ai', description: 'AI ai' }]), [
    { rank: 1, keyword: 'ai', articleCount: 1, score: 3 },
  ])
})

test('TOP10 내림차순 및 순위 연속성', () => {
  const items = Array.from({ length: 15 }, (_, index) => ({ title: `topic${index}`, description: index === 14 ? 'topic14' : '' }))
  const rows = analyze(items)
  assert.equal(rows.length, 10)
  assert.equal(rows[0].keyword, 'topic14')
  assert.deepEqual(rows.map((row) => row.rank), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})

test('동점은 기사 수 우선, 그다음 문자 순서; 입력 순서와 무관', () => {
  const items = [
    { title: 'alpha beta', description: 'gamma' },
    { title: 'unique', description: 'gamma' },
  ]
  const rows = analyze(items)
  assert.deepEqual(rows.map((row) => row.keyword), ['gamma', 'alpha', 'beta', 'unique'])
  assert.deepEqual(rows, analyze([...items].reverse()))
})

test('null 및 비정상 최상위 입력', () => {
  for (const input of [null, undefined, 123, 'news', {}, { items: [] }]) {
    assert.deepEqual(analyze(input), [])
  }
})

test('비정상 기사와 필드 무시', () => {
  const result = analyzeKeywordRanking([null, false, 3, [], {}, { title: {}, description: 5 }, { description: '반도체' }])
  assert.equal(result.articleCount, 1)
  assert.equal(result.rankings[0].score, 1)
})

test('최대 100개만 사용하고 원본 불변', () => {
  const items = Array.from({ length: 101 }, (_, index) => ({ title: `topic${index}` }))
  const original = structuredClone(items)
  const result = analyzeKeywordRanking(items)
  assert.equal(result.sampleCount, 100)
  assert.equal(result.articleCount, 100)
  assert.deepEqual(items, original)
})
