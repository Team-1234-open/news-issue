import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './layout/RootLayout';
import HomePage from './pages/home/HomePage';
import NewsListPage from './pages/news_list/NewsListPage';
import TopTenPage from './pages/top_10/TopTenPage';
import RelatedPage from './pages/related/RelatedPage';
import TrendPage from './pages/trend/TrendPage';

// 페이지 라우팅 구조
const routes = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage />},
      { path: "news-list", element: <NewsListPage /> },
      { path: "top-10", element: <TopTenPage /> },
      { path: "related", element: <RelatedPage /> },
      { path: "trend", element: <TrendPage /> },
    ],
  },
];

const router = createBrowserRouter(routes);

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
