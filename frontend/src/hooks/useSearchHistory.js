
import { useEffect, useState } from 'react'

const HISTORY_KEY = 'news-issue-search-history'
const FAVORITES_KEY = 'news-issue-search-favorites'
const SEARCH_LOG_KEY = 'news-issue-search-log'

const MAX_HISTORY = 10

const readStorage = (key) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const useSearchHistory = () => {
  const [recentSearches, setRecentSearches] = useState(() =>
    readStorage(HISTORY_KEY),
  )

  const [favorites, setFavorites] = useState(() =>
    readStorage(FAVORITES_KEY),
  )

  // 검색 이벤트 기록
  const [searchLogs, setSearchLogs] = useState(() =>
    readStorage(SEARCH_LOG_KEY),
  )

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(recentSearches))
  }, [recentSearches])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem(SEARCH_LOG_KEY, JSON.stringify(searchLogs))
  }, [searchLogs])

  // 검색어를 최근 조회 기록에 추가
  const addRecentSearch = (keyword) => {
    const trimmedKeyword = keyword.trim()

    if (!trimmedKeyword) return

    // 최근 검색어는 중복 없이 최대 10개 유지
    setRecentSearches((previous) => [
      trimmedKeyword,
      ...previous.filter(
        (item) => item.toLowerCase() !== trimmedKeyword.toLowerCase(),
      ),
    ].slice(0, MAX_HISTORY))

    // 검색할 때마다 별도의 로그에 저장
    setSearchLogs((previous) => [
      ...previous,
      {
        keyword: trimmedKeyword,
        searchedAt: new Date().toISOString(),
      },
    ])
  }

  // 즐겨찾기 추가 또는 해제
  const toggleFavorite = (keyword) => {
    const trimmedKeyword = keyword.trim()

    if (!trimmedKeyword) return

    setFavorites((previous) =>
      previous.some(
        (item) => item.toLowerCase() === trimmedKeyword.toLowerCase(),
      )
        ? previous.filter(
            (item) => item.toLowerCase() !== trimmedKeyword.toLowerCase(),
          )
        : [...previous, trimmedKeyword],
    )
  }

  // 최근 조회 기록 전체 삭제
  const clearRecentSearches = () => {
    setRecentSearches([])
  }

  // 최근 조회 기록에서 검색어 하나 삭제
  const removeRecentSearch = (keyword) => {
    setRecentSearches((previous) =>
      previous.filter((item) => item !== keyword),
    )
  }

  return {
    recentSearches,
    favorites,
    searchLogs,
    addRecentSearch,
    toggleFavorite,
    clearRecentSearches,
    removeRecentSearch,
  }
}

export default useSearchHistory
