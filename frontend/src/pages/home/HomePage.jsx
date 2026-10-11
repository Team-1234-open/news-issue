import { Link } from 'react-router-dom'

const menuItems = [
  { title: '뉴스 목록', path: '/news-list' },
  { title: 'TOP 10 키워드', path: '/top-10' },
  { title: '연관 뉴스 및 키워드', path: '/related' },
  { title: '검색 트렌드', path: '/trend' },
]

const HomePage = () => {
  return (
    <main className="px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-2xl font-bold leading-snug break-keep text-gray-900 sm:text-3xl">
          네이버 뉴스 API 기반 실시간 이슈 분석 플랫폼
        </h1>

        <nav aria-label="주요 서비스" className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex min-h-36 items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-8 text-center text-xl font-semibold break-keep text-gray-800 shadow-sm transition-colors hover:border-blue-600 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}

export default HomePage
