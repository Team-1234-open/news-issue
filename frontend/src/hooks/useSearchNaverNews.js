import { useQuery } from '@tanstack/react-query'
import { searchNaverNews } from '../apis/searchNaverNews'

// 키워드별 네이버 뉴스 검색 결과 관리
export const useSearchNaverNews = (keyword) => {
  const searchKeyword = keyword?.trim() ?? ''

  return useQuery({
    queryKey: ['searchNaverNews', searchKeyword],
    queryFn: () => searchNaverNews(searchKeyword),

    enabled: !!searchKeyword,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,

    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

    retry: false,
  })
}
