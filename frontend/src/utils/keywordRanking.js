const STOP_WORDS = new Set([
  '기자', '뉴스', '관련', '대한', '위한', '통해', '대해', '이번', '지난',
  '오늘', '내일', '올해', '현재', '이날', '오전', '오후', '사진', '제공',
  '무단', '전재', '재배포', '금지', '연합뉴스', '뉴시스', '밝혔다', '말했다',
  '있다', '있는', '한다', '했다', '됐다', '된다', '따르면', '것으로',
  '그리고', '하지만', '또한', '위해', '등을', 'the', 'and', 'for', 'with',
  'from', 'this', 'that', 'are', 'was', 'news', 'https', 'http', 'www',
])
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  middot: '·', hellip: '…', ndash: '–', mdash: '—',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
}

export const toPlainText = (value) => {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_, entity) => {
      if (!entity.startsWith('#')) return ENTITIES[entity.toLowerCase()] ?? ' '
      const hex = entity[1].toLowerCase() === 'x'
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10)
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
        ? String.fromCodePoint(code) : ' '
    })
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

const tokenize = (text) => {
  const tokens = text.toLowerCase().match(/[가-힣a-z0-9]+/g) ?? []
  return new Set(tokens.map((token) => {
    // 긴 조사부터 한 번만 제거하고, 두 글자 이상 어근을 보존한다.
    const stripped = token.replace(/(?:으로부터|에서부터|에게서|에서는|으로는|이라는|이라고|까지는|부터는|에게|에서|으로|와의|과의|에는|에도|까지|부터|처럼|보다|은|는|이|가|을|를|의|에|와|과|도|로)$/, '')
    return stripped.length >= 2 ? stripped : token
  }).filter((token) => token.length >= 2 && !/^\d+$/.test(token) && !STOP_WORDS.has(token)))
}

// 최대 100개 표본에서 URL 또는 정규화한 제목이 같으면 첫 기사만 사용한다.
export const analyzeKeywordRanking = (items) => {
  const sample = Array.isArray(items) ? items.slice(0, 100) : []
  const seenUrls = new Set()
  const seenTitles = new Set()
  const keywords = new Map()
  let articleCount = 0
  for (const item of sample) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const title = toPlainText(item.title)
    const description = toPlainText(item.description)
    if (!title && !description) continue
    const titleKey = (title || description).toLowerCase().replace(/[^가-힣a-z0-9]/g, '')
    const urls = [item.originallink, item.link]
      .filter((url) => typeof url === 'string' && url.trim())
      .map((url) => url.trim().replace(/#.*$/, '').replace(/\/$/, ''))
    if (urls.some((url) => seenUrls.has(url)) || (titleKey && seenTitles.has(titleKey))) continue
    urls.forEach((url) => seenUrls.add(url))
    if (titleKey) seenTitles.add(titleKey)
    articleCount += 1
    const titleTokens = tokenize(title)
    const descriptionTokens = tokenize(description)
    for (const keyword of new Set([...titleTokens, ...descriptionTokens])) {
      const entry = keywords.get(keyword) ?? { keyword, articleCount: 0, score: 0 }
      entry.articleCount += 1
      entry.score += (titleTokens.has(keyword) ? 2 : 0) + (descriptionTokens.has(keyword) ? 1 : 0)
      keywords.set(keyword, entry)
    }
  }
  const rankings = [...keywords.values()]
    .sort((a, b) => b.score - a.score || b.articleCount - a.articleCount ||
      (a.keyword < b.keyword ? -1 : a.keyword > b.keyword ? 1 : 0))
    .slice(0, 10)
    .map((entry, index) => ({ rank: index + 1, ...entry }))
  return { sampleCount: sample.length, articleCount, rankings }
}
