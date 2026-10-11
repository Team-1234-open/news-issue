import { useQuery } from '@tanstack/react-query'
import { getNaverNews } from '../apis/naverNews'

// 쿼리 키에 네이버 뉴스 데이터 저장
export const useGetNaverNews = () => useQuery({
  queryKey: ['naverNews'],
  queryFn: getNaverNews,
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
  retryOnMount: false,
})
