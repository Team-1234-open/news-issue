import { Outlet, Link } from 'react-router-dom'

const RootLayout = () => {
  return (
    <div className='h-screen'>
      <Link to="/" className='flex items-center p-5 font-bold text-gray-900 text-lg cursor-pointer'>
        Home
      </Link>
      <Outlet />
    </div>
  )
}

export default RootLayout
