
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetNaverNews } from '../../hooks/useGetNaverNews';
import { analyzeKeywordRanking } from '../../utils/keywordRanking';

// 뉴스에 포함된 HTML 태그를 제거하고 텍스트 추출
const toPlainText = (value) => {
  const doc = new DOMParser().parseFromString(value ?? '', 'text/html');
  return doc.body.textContent ?? '';
};

const RelatedPage = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword')?.trim() || '';

  // TOP10 키워드 버튼 표시 여부
  const showKeywordButtons =
    !keyword || searchParams.get('view') === 'select';

  // 네이버 뉴스 데이터 가져오기
  const { data, isPending, isError } = useGetNaverNews();

  // 전체 뉴스 목록
  const newsItems = data?.items ?? [];

  // TOP10 키워드 순위 계산
  const { rankings } = useMemo(
    () => analyzeKeywordRanking(data?.items),
    [data?.items]
  );

  // 선택한 키워드가 포함된 뉴스만 추출
  const relatedNews = keyword
    ? newsItems.filter((news) => {
        const title = toPlainText(news.title);
        const description = toPlainText(news.description);
        const text = `${title} ${description}`.toLowerCase();

        return text.includes(keyword.toLowerCase());
      })
    : [];

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        {keyword || '키워드를 선택해주세요'}
      </h1>

      {showKeywordButtons && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-gray-500">
            실시간 이슈 TOP10
          </p>

          <div className="flex flex-wrap gap-1">
            {rankings.slice(0, 10).map(({ rank, keyword: rankedKeyword }) => (
              <Link
                key={rankedKeyword}
                to={`/related?${new URLSearchParams({
                  keyword: rankedKeyword,
                  view: 'select'
                })}`}
                className={`rounded-md border px-2 py-1 text-xs ${
                  keyword === rankedKeyword
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {rank}. {rankedKeyword}
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 className="mt-6 text-xl font-semibold">
        관련 뉴스
      </h2>

      {!keyword ? (
        <p>먼저 키워드를 선택해주세요.</p>
      ) : isPending ? (
        <p>뉴스를 불러오는 중입니다.</p>
      ) : isError ? (
        <p>뉴스를 가져오지 못했습니다.</p>
      ) : relatedNews.length === 0 ? (
        <p>관련 뉴스가 없습니다.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {relatedNews.map((news, index) => (
            <li
              key={news.link || index}
              className="rounded-lg border border-gray-200 bg-white p-5"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {index + 1}. {toPlainText(news.title)}
              </h3>
              <p className="mt-2 text-gray-700">
                {toPlainText(news.description)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {new Date(news.pubDate).toLocaleString('ko-KR')}
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-xl font-semibold">
        연관 키워드
      </h2>
      <p>여기에 연관 키워드가 표시됩니다.</p>
    </main>
  );
};

export default RelatedPage;
