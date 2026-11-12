import axios from 'axios'

// 키워드로 네이버 뉴스 검색
export const searchNaverNews = async (keyword) => {
  try {
    if (!keyword || !keyword.trim()) {
      return []
    }

    const response = await axios.get('/api/naver/news', {
      params: {
        query: keyword.trim(),
        display: 100,
        start: 1,
        sort: 'date',
        format: 'json',
      },
    })

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorBody = error.response?.data
      const message = errorBody?.error?.message
        ?? errorBody?.errorMessage
        ?? error.message
      const status = error.response?.status

      throw new Error(
        status ? `${message} (${status})` : message,
        { cause: error }
      )
    }

    throw error
  }
}
