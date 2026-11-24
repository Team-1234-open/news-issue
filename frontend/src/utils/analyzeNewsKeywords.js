
const STOP_WORDS = [
  '그리고', '그러나', '때문에', '대한', '통해',
  '위해', '관련', '이번', '오늘', '지난',
  '이후', '현재', '가운데', '등', '것',
  '수', '및', '더', '또', '첫',
  '뉴스', '속보', '기자', '보도',
  '단독', '종합', '영상', '사진',
  '오전', '오후', '어제', '내일',
]

const cleanText = (text = '') =>
  text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '')
    .replace(/&amp;/g, ' ')
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/[^\w가-힣\s]/g, ' ')
    .trim()

export const analyzeNewsKeywords = (newsList = []) => {
  const keywordCounts = {}

  newsList.forEach((news) => {
    const text = cleanText(
      `${news.title ?? ''} ${news.description ?? ''}`,
    )

    const words = text
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 2)
      .filter((word) => !STOP_WORDS.includes(word))

    const uniqueWords = [...new Set(words)]

    uniqueWords.forEach((word) => {
      keywordCounts[word] = (keywordCounts[word] ?? 0) + 1
    })
  })

  return Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}
