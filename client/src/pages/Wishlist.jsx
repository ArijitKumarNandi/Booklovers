import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi'
import { TbSparkles } from 'react-icons/tb'
import { ShopContext } from '../context/ShopContext'
import { getBookGenreDisplayLabels } from '../assets/genreTree'

const Wishlist = () => {
  const { axios, user, navigate, currency, addToCart, toggleWishlist, setWishlistItems } = useContext(ShopContext)
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = useCallback(async () => {
    if(!user){
      setWishlist([])
      setLoading(false)
      return
    }

    try {
      const { data } = await axios.get('/api/user/wishlist')
      if(data.success){
        setWishlist(data.wishlist)
        setWishlistItems(data.wishlist.map((book) => book._id))
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [axios, setWishlistItems, user])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const removeFromWishlist = async (bookId) => {
    const result = await toggleWishlist(bookId)
    if(result?.success){
      setWishlist((prev) => prev.filter((book) => book._id !== bookId))
    }
  }

  const totalValue = useMemo(() => {
    return wishlist.reduce((total, book) => total + Number(book.offerPrice || 0), 0)
  }, [wishlist])

  const totalSavings = useMemo(() => {
    return wishlist.reduce((total, book) => total + Math.max(Number(book.price || 0) - Number(book.offerPrice || 0), 0), 0)
  }, [wishlist])

  return (
    <div className='max-padd-container py-16 pt-28'>
      <div className='mb-8 flex flex-col gap-3'>
        <p className='medium-14 text-secondary'>Account / Wishlists</p>
        <h1 className='bold-32 leading-tight'>My Wishlists</h1>
      </div>

      <section className='mb-6 overflow-hidden rounded-xl bg-primary shadow-sm ring-1 ring-slate-900/5'>
        <div className='grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-6'>
          <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
            <span className='flexCenter h-16 w-16 rounded-full bg-white text-3xl text-red-500 shadow-sm ring-1 ring-slate-900/5'>
              <FaHeart />
            </span>
            <div>
              <h2 className='bold-28'>Saved For Later</h2>
              <p className='mt-1 max-w-2xl'>Your loved books stay here so you can return to them when the next reading mood arrives.</p>
              <div className='mt-4 flex flex-wrap gap-2'>
                <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Loved books</span>
                <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Quick cart</span>
                <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Reader picks</span>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5'>
            <div>
              <p className='medium-14'>Books</p>
              <h3 className='bold-24'>{wishlist.length}</h3>
            </div>
            <div className='border-x border-[var(--theme-border)] px-4'>
              <p className='medium-14'>Value</p>
              <h3 className='bold-20'>{currency}{totalValue.toFixed(2)}</h3>
            </div>
            <div>
              <p className='medium-14'>Saved</p>
              <h3 className='bold-20'>{currency}{totalSavings.toFixed(2)}</h3>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className='surface-card rounded-xl p-8 shadow-sm ring-1 ring-slate-900/5'>Loading your wishlist...</div>
      ) : !user ? (
        <div className='surface-card rounded-xl p-8 text-center shadow-sm ring-1 ring-slate-900/5'>
          <FaRegHeart className='mx-auto mb-3 text-5xl text-secondary' />
          <h2 className='bold-22'>Login to save books</h2>
          <p className='mt-2'>Wishlist items are connected to your account, so no book is saved until you log in.</p>
          <button onClick={() => navigate('/')} className='btn-secondary mt-5 !rounded-md'>Go Home</button>
        </div>
      ) : wishlist.length === 0 ? (
        <div className='surface-card rounded-xl p-8 text-center shadow-sm ring-1 ring-slate-900/5'>
          <TbSparkles className='mx-auto mb-3 text-5xl text-secondary' />
          <h2 className='bold-22'>Your wishlist is waiting</h2>
          <p className='mx-auto mt-2 max-w-lg'>Tap the heart on any book you love, and it will appear here for easy access later.</p>
          <button onClick={() => navigate('/shop')} className='btn-secondary mt-5 !rounded-md'>Discover Books</button>
        </div>
      ) : (
        <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          {wishlist.map((book) => (
            <article key={book._id} className='surface-card overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md'>
              <button onClick={() => navigate(`/shop/book/${book._id}`)} className='block w-full bg-primary p-5 text-left'>
                <div className='mx-auto flex h-64 max-w-[190px] items-center justify-center rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5'>
                  <img src={book.image?.[0]} alt={book.name} className='max-h-full rounded-lg object-contain' />
                </div>
              </button>

              <div className='p-5'>
                <div className='mb-3 flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='medium-14 text-secondary'>{getBookGenreDisplayLabels(book).join(', ') || 'No genre'}</p>
                    <h3 className='bold-18 mt-1 line-clamp-2'>{book.name}</h3>
                  </div>
                  <span className='flexCenter h-10 w-10 shrink-0 rounded-full bg-red-50 text-red-500 ring-1 ring-red-100'>
                    <FaHeart />
                  </span>
                </div>

                <p className='line-clamp-2'>{book.description}</p>

                <div className='mt-4 flex items-baseline gap-3'>
                  <span className='bold-22'>{currency}{Number(book.offerPrice || 0).toFixed(2)}</span>
                  <span className='medium-16 text-secondary line-through'>{currency}{Number(book.price || 0).toFixed(2)}</span>
                </div>

                <div className='mt-5 grid grid-cols-[1fr_auto] gap-3'>
                  <button onClick={() => addToCart(book._id)} className='btn-dark flexCenter gap-2 !rounded-md'>
                    <FiShoppingBag />
                    Add To Cart
                  </button>
                  <button
                    type='button'
                    onClick={() => removeFromWishlist(book._id)}
                    className='flexCenter h-12 w-12 rounded-md bg-red-50 text-red-500 ring-1 ring-red-100 transition hover:bg-red-100'
                    aria-label={`Remove ${book.name} from wishlist`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist
