import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGetNaverNews } from '../../hooks/useGetNaverNews'
import { analyzeKeywordRanking } from '../../utils/keywordRanking'

const TopTenPage = () => {
  const { data, isPending, isError, refetch, isFetching } = useGetNaverNews()
  const { sampleCount, articleCount, rankings } = useMemo(
    () => analyzeKeywordRanking(data?.items), [data?.items],
  )
  return (
    <main className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900">이슈 TOP10</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          ‘뉴스’ 검색 결과 중 최신순 최대 100개 기사 표본의 제목과 요약을 분석합니다.
          네이버 공식 실시간 인기검색어 순위가 아닙니다.
        </p>
        {isPending ? (
          <p role="status" className="mt-6 text-gray-600">뉴스를 불러오는 중입니다.</p>
        ) : isError ? (
          <div role="alert" className="mt-6">
            <p className="text-red-700">뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
            <button type="button" onClick={() => refetch()} disabled={isFetching}
              className="mt-3 rounded border border-gray-300 px-4 py-2 hover:bg-gray-100 disabled:opacity-50">
              {isFetching ? '불러오는 중' : '다시 시도'}
            </button>
          </div>
        ) : (
          <>
            <p role="status" className="mt-5 text-sm text-gray-700">
              수집 표본 {sampleCount}개 · 중복·빈 기사 제외 분석 {articleCount}개
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              기사당 제목 2점 + 요약 1점. 각 영역의 반복 단어는 한 번만 계산하며,
              등장 기사 수는 기사당 한 번 계산합니다. 동점은 기사 수, 키워드 문자 순으로 정렬합니다.
            </p>
            {rankings.length === 0 ? (
              <p role="status" className="mt-6 text-gray-600">
                {articleCount === 0 ? '분석할 뉴스가 없습니다.' : '분석 가능한 키워드가 없습니다.'}
              </p>
            ) : (
              <ol className="mt-6 space-y-3" aria-label="이슈 키워드 순위">
                {rankings.map(({ rank, keyword, articleCount: count, score }) => (
                  <li key={keyword}>
                    <Link to={`/related?${new URLSearchParams({ keyword })}`}
                      className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:p-5">
                      <span className="w-8 shrink-0 text-center text-xl font-bold text-blue-700">{rank}</span>
                      <span className="min-w-0 flex-1 break-words font-semibold text-gray-900">{keyword}</span>
                      <span className="shrink-0 text-right text-sm text-gray-600">
                        {count}개 기사<span className="mt-1 block">{score}점</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default TopTenPage
