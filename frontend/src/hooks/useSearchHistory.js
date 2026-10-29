
import { useEffect, useState } from 'react'

const HISTORY_KEY = 'news-issue-search-history'
const FAVORITES_KEY = 'news-issue-search-favorites'
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

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(recentSearches))
  }, [recentSearches])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  // 검색어를 최근 조회 기록에 추가
  const addRecentSearch = (keyword) => {
    const trimmedKeyword = keyword.trim()

    if (!trimmedKeyword) return

    setRecentSearches((previous) => [
      trimmedKeyword,
      ...previous.filter(
        (item) => item.toLowerCase() !== trimmedKeyword.toLowerCase(),
      ),
    ].slice(0, MAX_HISTORY))
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
    addRecentSearch,
    toggleFavorite,
    clearRecentSearches,
    removeRecentSearch,
  }
}

export default useSearchHistory
