import { useState } from 'react'
import useSearchHistory from '../../hooks/useSearchHistory'

const TrendPage = () => {
  const [keyword, setKeyword] = useState('')

  const {
    recentSearches,
    favorites,
    addRecentSearch,
    toggleFavorite,
    clearRecentSearches,
    removeRecentSearch,
  } = useSearchHistory()

  const handleSearch = (searchKeyword = keyword) => {
    const trimmedKeyword = searchKeyword.trim()

    if (!trimmedKeyword) return

    addRecentSearch(trimmedKeyword)
    setKeyword('')
  }

  const isFavorite = (searchKeyword) =>
    favorites.some(
      (item) => item.toLowerCase() === searchKeyword.toLowerCase(),
    )

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        검색 트렌드
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        검색어를 입력해 최근 조회 기록과 즐겨찾기를 관리해 보세요.
      </p>

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
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          조회
        </button>
      </form>

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
