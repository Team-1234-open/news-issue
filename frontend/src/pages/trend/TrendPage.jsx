
import { useState } from 'react'
import useSearchHistory from '../../hooks/useSearchHistory'
import { useSearchNaverNews } from '../../hooks/useSearchNaverNews'

const TrendPage = () => {
  const [keyword, setKeyword] = useState('')
  const [searchedKeyword, setSearchedKeyword] = useState('')

  // 검색 결과 관리
  const {
    data: searchData,
    isLoading,
    isError,
    error,
  } = useSearchNaverNews(searchedKeyword)

  // 검색 결과 목록
  const searchResults = searchData?.items ?? []

  // 최근 조회 및 즐겨찾기 관리
  const {
    recentSearches,
    favorites,
    addRecentSearch,
    toggleFavorite,
    clearRecentSearches,
    removeRecentSearch,
  } = useSearchHistory()

  // 검색 실행
  const handleSearch = (searchKeyword = keyword) => {
    const trimmedKeyword = searchKeyword.trim()

    if (!trimmedKeyword) return

    addRecentSearch(trimmedKeyword)
    setSearchedKeyword(trimmedKeyword)
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
            <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
              {searchResults.map((item, index) => (
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

      {/* 트렌드 그래프 */}
      <section className="mt-10 rounded-lg border border-dashed border-gray-300 p-6">
        <h2 className="font-bold text-gray-800">
          검색 트렌드 그래프
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          실제 트렌드 그래프는 데이터 API 연결 후 구현할 예정입니다.
        </p>
      </section>
    </main>
  )
}

export default TrendPage
