
import { Garu } from 'garu-ko'

const STOP_WORDS = [
  // 일반적인 단어
  '그리고', '그러나', '때문에', '대한', '통해',
  '위해', '관련', '이번', '오늘', '지난',
  '이후', '현재', '가운데', '등', '것',
  '수', '및', '더', '또', '첫',

  // 장소·범위·상황
  '국내', '해외', '전국', '지역', '현지',
  '함께', '모두', '각각', '전체', '당시',
  '최근', '이날', '이곳', '올해', '내년',
  '지난해', '이달', '이번달',

  // 뉴스 관련 표현
  '뉴스', '속보', '기자', '보도',
  '단독', '종합', '영상', '사진',
  '오전', '오후', '어제', '내일',

  // 언론사
  '연합뉴스', '뉴시스', '뉴스1',
]

// 날짜 및 숫자 필터링
const isDateWord = (word) =>
  /^\d+$/.test(word) ||
  /^\d+(일|년|월|일자)$/.test(word)

// HTML 및 특수문자 정리
const cleanText = (text = '') =>
  text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '')
    .replace(/&amp;/g, ' ')
    .replace(/&lt;/g, '')
    .replace(/&gt;/g, '')
    .replace(/[^\w가-힣\s]/g, ' ')
    .trim()

// Garu 초기화
let garuInstance = null

const getGaru = async () => {
  if (!garuInstance) {
    garuInstance = await Garu.load()
  }

  return garuInstance
}

// 뉴스 키워드 분석
export const analyzeNewsKeywords = async (newsList = []) => {
  const garu = await getGaru()
  const keywordCounts = {}

  for (const news of newsList) {
    const text = cleanText(
      `${news.title ?? ''} ${news.description ?? ''}`,
    )

    // 명사 추출
    const nouns = garu.nouns(text)

    // 불필요한 단어 필터링
    const words = nouns
      .map((word) => word.trim())
      .filter((word) => word.length >= 2)
      .filter((word) => !STOP_WORDS.includes(word))
      .filter((word) => !isDateWord(word))

    // 뉴스 한 건 안에서 중복 제거
    const uniqueWords = [...new Set(words)]

    uniqueWords.forEach((word) => {
      keywordCounts[word] = (keywordCounts[word] ?? 0) + 1
    })
  }

  return Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}
