
import { useSearchParams } from 'react-router-dom';
import { useGetNaverNews } from '../../hooks/useGetNaverNews';

// 뉴스에 포함된 HTML 태그를 제거하고 텍스트 추출
const toPlainText = (value) => {
  const doc = new DOMParser().parseFromString(value ?? '', 'text/html');
  return doc.body.textContent ?? '';
};

const RelatedPage = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('keyword')?.trim() || '';

  // 네이버 뉴스 데이터 가져오기
  const { data, isPending, isError } = useGetNaverNews();

  // 전체 뉴스 목록
  const newsItems = data?.items ?? [];

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
            <li key={news.link || index}>
              {index + 1}. {toPlainText(news.title)}
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
