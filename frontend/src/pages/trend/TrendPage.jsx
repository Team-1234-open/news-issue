
import { useEffect, useState } from 'react'
import useSearchHistory from '../../hooks/useSearchHistory'
import { useSearchNaverNews } from '../../hooks/useSearchNaverNews'
import { useGetNaverNews } from '../../hooks/useGetNaverNews'
import { analyzeNewsKeywords } from '../../utils/analyzeNewsKeywords'

const EMPTY_NEWS = []

const TrendPage = () => {
  const [keyword, setKeyword] = useState('')
  const [searchedKeyword, setSearchedKeyword] = useState('')
  const [showAllResults, setShowAllResults] = useState(false)

  // 검색 결과 관리
  const {
    data: searchData,
    isLoading,
    isError,
    error,
  } = useSearchNaverNews(searchedKeyword)

  const searchResults = searchData?.items ?? []

  // 처음에는 뉴스 5개만 표시
  const displayedSearchResults = showAllResults
    ? searchResults
    : searchResults.slice(0, 5)

  // 전체 뉴스 데이터 가져오기
  const {
    data: allNewsData,
    isLoading: isAllNewsLoading,
    isError: isAllNewsError,
  } = useGetNaverNews()

  const allNews = Array.isArray(allNewsData)
    ? allNewsData
    : allNewsData?.items ?? EMPTY_NEWS

  // 전체 뉴스 키워드 분석 상태
  const [topKeywords, setTopKeywords] = useState([])
  const [isAnalyzingKeywords, setIsAnalyzingKeywords] = useState(false)

  // 전체 뉴스 주요 키워드 TOP 5
  useEffect(() => {
    let cancelled = false

    const analyzeKeywords = async () => {
      if (allNews.length === 0) {
        setTopKeywords([])
        setIsAnalyzingKeywords(false)
        return
      }

      setIsAnalyzingKeywords(true)

      try {
        const result = await analyzeNewsKeywords(allNews)

        if (!cancelled) {
          setTopKeywords(result)
        }
      } catch (error) {
        console.error('뉴스 키워드 분석 실패:', error)

        if (!cancelled) {
          setTopKeywords([])
        }
      } finally {
        if (!cancelled) {
          setIsAnalyzingKeywords(false)
        }
      }
    }

    analyzeKeywords()

    return () => {
      cancelled = true
    }
  }, [allNews])

  // 검색 기록 및 즐겨찾기 관리
  const {
    recentSearches,
    favorites,
    searchLogs,
    addRecentSearch,
    toggleFavorite,
    clearRecentSearches,
    removeRecentSearch,
    removeSearchLogs,
  } = useSearchHistory()

  // 검색어별 검색 횟수 계산
  const searchKeywordStats = Object.values(
    searchLogs.reduce((acc, log) => {
      const keyword = log.keyword
      const normalizedKeyword = keyword.toLowerCase()

      if (!acc[normalizedKeyword]) {
        acc[normalizedKeyword] = {
          keyword,
          count: 0,
        }
      }

      acc[normalizedKeyword].count += 1

      return acc
    }, {}),
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 검색 실행
  const handleSearch = (searchKeyword = keyword) => {
    const trimmedKeyword = searchKeyword.trim()

    if (!trimmedKeyword) return

    addRecentSearch(trimmedKeyword)
    setSearchedKeyword(trimmedKeyword)
    setShowAllResults(false)
    setKeyword('')
  }

  // 즐겨찾기 여부 확인
  const isFavorite = (searchKeyword) =>
    favorites.some(
      (item) => item.toLowerCase() === searchKeyword.toLowerCase(),
    )

  // 네이버 뉴스 제목 및 설명의 HTML 태그 제거
  const cleanText = (text) =>
    text?.replace(/<[^>]*>/g, '') ?? ''

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        검색 트렌드
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        검색어를 입력해 네이버 뉴스를 검색하고 최근 조회 기록과 즐겨찾기를 관리해 보세요.
      </p>

      {/* 검색창 */}
      <form
        className="mt-6 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          handleSearch()
        }}
      >
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="검색어 입력 (예: 인공지능)"
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600"
        />

        <button
          type="submit"
          disabled={!keyword.trim() || isLoading}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          조회
        </button>
      </form>

      {/* 검색 결과 */}
      {searchedKeyword && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-gray-900">
            '{searchedKeyword}' 검색 결과
          </h2>

          {isLoading && (
            <p className="mt-4 rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
              뉴스를 검색하고 있습니다...
            </p>
          )}

          {isError && (
            <p className="mt-4 rounded-lg bg-red-50 p-5 text-sm text-red-600">
              뉴스 검색에 실패했습니다.
              {error?.message}
            </p>
          )}

          {!isLoading && !isError && searchResults.length === 0 && (
            <p className="mt-4 rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
              검색 결과가 없습니다.
            </p>
          )}

          {!isLoading && !isError && searchResults.length > 0 && (
            <>
              <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
                {displayedSearchResults.map((item, index) => (
                  <li key={item.link || index} className="px-4 py-4">
                    <a
                      href={item.link || item.originallink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-gray-800 hover:text-blue-600"
                    >
                      {cleanText(item.title)}
                    </a>

                    <p className="mt-2 text-sm text-gray-600">
                      {cleanText(item.description)}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      {item.pubDate}
                    </p>
                  </li>
                ))}
              </ul>

              {searchResults.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllResults((prev) => !prev)}
                  className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  {showAllResults
                    ? '뉴스 접기'
                    : `뉴스 ${searchResults.length - 5}개 더 보기`}
                </button>
              )}
            </>
          )}
        </section>
      )}

      {/* 최근 조회 */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            최근 조회
          </h2>

          <button
            type="button"
            onClick={clearRecentSearches}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            전체 삭제
          </button>
        </div>

        {recentSearches.length === 0 ? (
          <p className="mt-4 rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
            아직 조회한 검색어가 없습니다.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
            {recentSearches.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <button
                  type="button"
                  onClick={() => handleSearch(item)}
                  className="min-w-0 flex-1 break-words text-left text-gray-800 hover:text-blue-600"
                >
                  {item}
                </button>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleFavorite(item)}
                    aria-label={
                      isFavorite(item)
                        ? `${item} 즐겨찾기 해제`
                        : `${item} 즐겨찾기 추가`
                    }
                    className="text-xl text-yellow-500"
                  >
                    {isFavorite(item) ? '★' : '☆'}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeRecentSearch(item)}
                    aria-label={`${item} 최근 조회에서 삭제`}
                    className="text-sm text-gray-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 즐겨찾기 */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-gray-900">
          즐겨찾기
        </h2>

        {favorites.length === 0 ? (
          <p className="mt-4 rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
            즐겨찾기한 검색어가 없습니다.
            최근 조회 목록의 ☆ 버튼을 눌러 추가해 보세요.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
            {favorites.map((item) => (
              <li
                key={item}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <button
                  type="button"
                  onClick={() => handleSearch(item)}
                  className="min-w-0 flex-1 break-words text-left text-gray-800 hover:text-blue-600"
                >
                  {item}
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(item)}
                  aria-label={`${item} 즐겨찾기 해제`}
                  className="text-xl text-yellow-500"
                >
                  ★
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 전체 뉴스 키워드 TOP 5 */}
      <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            전체 뉴스 키워드 TOP 5
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            전체 뉴스의 제목과 설명을 분석한 주요 키워드입니다.
          </p>
        </div>

        {(isAllNewsLoading || isAnalyzingKeywords) && (
          <p className="mt-6 rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
            뉴스 데이터를 분석하고 있습니다...
          </p>
        )}

        {isAllNewsError && (
          <p className="mt-6 rounded-lg bg-red-50 p-5 text-sm text-red-600">
            뉴스 데이터를 불러오지 못했습니다.
          </p>
        )}

        {!isAllNewsLoading &&
          !isAllNewsError &&
          !isAnalyzingKeywords &&
          topKeywords.length === 0 && (
            <p className="mt-6 rounded-lg bg-gray-50 p-5 text-sm text-gray-500">
              분석할 키워드가 없습니다.
            </p>
          )}

        {!isAllNewsLoading &&
          !isAllNewsError &&
          !isAnalyzingKeywords &&
          topKeywords.length > 0 && (
            <div className="mt-8 space-y-6">
              {topKeywords.map((item, index) => (
                <div key={item.keyword}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-400">
                        0{index + 1}
                      </span>

                      <span className="font-semibold text-gray-800">
                        {item.keyword}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-gray-600">
                      {item.count}건
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{
                        width: `${(item.count / topKeywords[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

        <p className="mt-6 text-xs text-gray-400">
          ※ 한 뉴스에서 동일 키워드는 한 번만 집계합니다.
          뉴스 제목과 설명에 등장한 단어의 빈도를 기준으로 합니다.
        </p>
      </section>

      {/* 내 검색 기록 TOP 5 */}
      <section className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            내 검색 기록 TOP 5
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            내가 자주 검색한 키워드를 횟수별로 보여줍니다.
          </p>
        </div>

        {searchKeywordStats.length === 0 ? (
          <p className="mt-6 rounded-lg bg-gray-50 p-5 text-center text-sm text-gray-500">
            아직 검색 기록이 없습니다. 검색어를 입력해 보세요!
          </p>
        ) : (
          <div className="mt-8 space-y-6">
            {searchKeywordStats.map((item, index) => {
              const percentage =
                (item.count / searchKeywordStats[0].count) * 100

              return (
                <div key={item.keyword}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-sm font-bold text-gray-400">
                        0{index + 1}
                      </span>

                      <span className="break-words font-semibold text-gray-800">
                        {item.keyword}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600">
                        {item.count}회
                      </span>

                      <button
                        type="button"
                        onClick={() => removeSearchLogs(item.keyword)}
                        aria-label={`${item.keyword} 검색 통계 삭제`}
                        className="text-sm text-gray-400 hover:text-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400">
          ※ 검색할 때마다 기록되며, 같은 검색어도 각각 집계됩니다.
          삭제 버튼을 누르면 해당 검색어의 통계 기록 전체가 삭제됩니다.
        </p>
      </section>
    </main>
  )
}

export default TrendPage
