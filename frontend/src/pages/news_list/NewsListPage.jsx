import { useState } from 'react'
import { useGetNaverNews } from '../../hooks/useGetNaverNews'

const PAGE_SIZE = 10

const toPlainText = (value) => {
  const document = new DOMParser().parseFromString(value ?? '', 'text/html')
  document.querySelectorAll('script, style').forEach((element) => element.remove())
  return document.body.textContent.trim()
}

const formatPublishedDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('ko-KR')
}

const NewsListPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const { data, isPending, isError, refetch, isFetching } = useGetNaverNews()
  const newsItems = (data?.items ?? []).slice(0, 100)
  const totalPages = Math.ceil(newsItems.length / PAGE_SIZE)
  const activePage = Math.min(currentPage, Math.max(totalPages, 1))
  const startIndex = (activePage - 1) * PAGE_SIZE
  const currentNewsList = newsItems.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <main className="px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900">뉴스 목록</h1>

        {isPending ? (
          <p role="status" className="mt-6 text-gray-600">뉴스를 불러오는 중입니다.</p>
        ) : isError ? (
          <div role="alert" className="mt-6">
            <p className="text-red-700">뉴스를 불러오지 못했습니다.</p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-3 rounded border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-100 disabled:opacity-50"
            >
              {isFetching ? '불러오는 중' : '다시 시도'}
            </button>
          </div>
        ) : newsItems.length === 0 ? (
          <p role="status" className="mt-6 text-gray-600">표시할 뉴스가 없습니다.</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-gray-600" role="status">
              총 {newsItems.length}개 · {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, newsItems.length)}번째 뉴스
            </p>

            <ul className="mt-6 grid grid-cols-2 gap-4">
              {currentNewsList.map((news, index) => {
                const title = toPlainText(news.title) || '제목 없음'
                const description = toPlainText(news.description)
                const publishedDate = formatPublishedDate(news.pubDate)
                const href = news.originallink || news.link
                const content = (
                  <article>
                    <h2 className="text-lg font-semibold leading-relaxed break-words text-gray-900">{title}</h2>
                    {description && (
                      <p className="mt-2 leading-relaxed break-words text-gray-700">{description}</p>
                    )}
                    {publishedDate && (
                      <time dateTime={new Date(news.pubDate).toISOString()} className="mt-3 block text-sm text-gray-500">
                        {publishedDate}
                      </time>
                    )}
                  </article>
                )

                return (
                  <li key={`${news.link || news.originallink || 'news'}-${startIndex + index}`}>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${title} (새 탭에서 열기)`}
                        className="block h-full rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                      >
                        {content}
                      </a>
                    ) : (
                      <div className="h-full rounded-lg border border-gray-200 bg-white p-5">{content}</div>
                    )}
                  </li>
                )
              })}
            </ul>

            <nav aria-label="뉴스 페이지" className="mt-8 flex flex-wrap justify-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  aria-label={`${page}페이지`}
                  aria-current={activePage === page ? 'page' : undefined}
                  className={`flex h-10 w-10 items-center justify-center rounded border text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                    activePage === page
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </>
        )}
      </div>
    </main>
  )
}

export default NewsListPage
