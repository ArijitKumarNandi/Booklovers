import React, { useContext } from 'react'
import { Toaster } from 'react-hot-toast'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Categoryshop from './pages/Categoryshop'
import ProductDetails from './pages/ProductDetails'
import Blog from './pages/Blog'
import BlogDetails from './pages/BlogDetails'
import Contact from './pages/Contact'
import FooterInfo from './pages/FooterInfo'
import FAQs from './pages/FAQs'
import Recommendations from './pages/Recommendations'
import Header from './components/Header'
import Footer from './components/Footer'
import Cart from './pages/Cart'
import AddressForm from './pages/AddressForm'
import MyOrders from './pages/MyOrders'
import MyReviews from './pages/MyReviews'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
import { ShopContext } from './context/ShopContext'
import Login from './pages/Login'
import Sidebar from './components/admin/Sidebar'
import AdminLogin from './components/admin/AdminLogin'
import AddProduct from './pages/admin/AddProduct'
import ProductList from './pages/admin/ProductList'
import Orders from './pages/admin/Orders'
import Loading from './pages/Loading'
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import Reviews from './pages/admin/Reviews'


const App = () => {
  const {showUserLogin, isAdmin} = useContext(ShopContext)
  const isAdminPath = useLocation().pathname.includes('admin')

  return (
    <main className='app-shell'>
      {showUserLogin && <Login />}
      {!isAdminPath && <Header />}
      <Toaster position='bottom-right'/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/shop' element={<Shop />} />
        <Route path='/recommendations' element={<Recommendations />} />
        <Route path='/shop/:category' element={<Categoryshop />} />
        <Route path='/shop/:category/:id' element={<ProductDetails />} />
        <Route path='/blog' element={<Blog />} />
        <Route path='/blog/:id' element={<BlogDetails />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/info/:slug' element={<FooterInfo />} />
        <Route path='/faqs' element={<FAQs />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/address-form' element={<AddressForm />} />
        <Route path='/my-orders' element={<MyOrders />} />
        <Route path='/my-reviews' element={<MyReviews />} />
        <Route path='/notifications' element={<Notifications />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path='/loader' element={<Loading />} />
        <Route path='/admin' element={isAdmin ? <Sidebar /> : <AdminLogin />}>
          <Route index element={isAdmin ? <Dashboard /> : null} />
          <Route path='add' element={<AddProduct />} />
          <Route path='list' element={<ProductList />} />
          <Route path='users' element={<Users />} />
          <Route path='orders' element={<Orders />} />
          <Route path='reviews' element={<Reviews />} />
        </Route>
      </Routes>
      {!isAdminPath && <Footer />}
    </main>
  )
}

export default App
