// api 호출하는 
import axios from 'axios'

export const getNaverNews = async () => {
  try {
    const response = await axios.get('/api/naver/news', {
      params: {
        query: '\uB274\uC2A4',
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

      throw new Error(status ? `${message} (${status})` : message, { cause: error })
    }

    throw error
  }
}
