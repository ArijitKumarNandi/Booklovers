import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FaHeart, FaRegCommentDots, FaStar, FaTrash } from 'react-icons/fa'
import { MdRateReview } from 'react-icons/md'
import { ShopContext } from '../context/ShopContext'

const MyReviews = () => {
  const { axios, user, navigate } = useContext(ShopContext)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }), [])

  const fetchReviews = useCallback(async () => {
    if(!user){
      setReviews([])
      setLoading(false)
      return
    }

    try {
      const { data } = await axios.get('/api/review/my-reviews')
      if(data.success){
        setReviews(data.reviews)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [axios, user])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const deleteReview = async (reviewId) => {
    try {
      const { data } = await axios.delete(`/api/review/${reviewId}`)
      if(data.success){
        toast.success(data.message)
        await fetchReviews()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const averageRating = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0'
  const adminReplies = reviews.filter((review) => review.adminReply?.message).length

  return (
    <div className='max-padd-container py-16 pt-28'>
      <div className='mb-8 flex flex-col gap-3'>
        <p className='medium-14 text-secondary'>Account / Reviews</p>
        <h1 className='bold-32 leading-tight'>My Review Ratings</h1>
      </div>

      <div className='mb-6 grid gap-5 overflow-hidden rounded-xl bg-primary p-5 shadow-sm ring-1 ring-slate-900/5 md:grid-cols-[1fr_auto] md:items-center lg:p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
          <span className='flexCenter h-16 w-16 rounded-full bg-white text-3xl text-secondary shadow-sm ring-1 ring-slate-900/5'>
            <MdRateReview />
          </span>
          <div>
            <h1 className='bold-28'>Your Book Reviews</h1>
            <p className='mt-1'>Track your ratings, admin replies, and highlighted reviews.</p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Rated books</span>
              <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Admin replies</span>
              <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Loved reviews</span>
            </div>
          </div>
        </div>
        <div className='grid min-w-[290px] grid-cols-3 gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5'>
          <div>
            <p className='medium-14'>Reviews</p>
            <h3 className='bold-24'>{reviews.length}</h3>
          </div>
          <div className='border-x border-[var(--theme-border)] px-4'>
            <p className='medium-14'>Avg Rating</p>
            <h3 className='bold-24'>{averageRating}</h3>
          </div>
          <div>
            <p className='medium-14'>Replies</p>
            <h3 className='bold-24'>{adminReplies}</h3>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='surface-card rounded-xl p-8 shadow-sm ring-1 ring-slate-900/5'>Loading your reviews...</div>
      ) : !user ? (
        <div className='surface-card rounded-xl p-8 text-center shadow-sm ring-1 ring-slate-900/5'>
          <MdRateReview className='mx-auto mb-3 text-5xl text-secondary' />
          <h2 className='bold-22'>Login to view your reviews</h2>
          <button onClick={() => navigate('/')} className='btn-secondary mt-5 !rounded-md'>Go Home</button>
        </div>
      ) : reviews.length === 0 ? (
        <div className='surface-card rounded-xl p-8 text-center shadow-sm ring-1 ring-slate-900/5'>
          <MdRateReview className='mx-auto mb-3 text-5xl text-secondary' />
          <h2 className='bold-22'>No reviews yet</h2>
          <p className='mt-2'>After you review purchased books, your ratings will appear here.</p>
          <button onClick={() => navigate('/shop')} className='btn-secondary mt-5 !rounded-md'>Browse Books</button>
        </div>
      ) : (
        <div className='grid gap-5'>
          {reviews.map((review) => (
            <article key={review._id} className='surface-card rounded-xl p-4 shadow-sm ring-1 ring-slate-900/5 lg:p-5'>
              <div className='grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]'>
                <div className='rounded-xl bg-primary p-4'>
                  <div className='flex gap-3'>
                    <img
                      src={review.productId?.image?.[0]}
                      alt={review.productId?.name ?? 'Reviewed book'}
                      className='h-28 w-24 rounded-lg bg-white object-contain shadow-sm'
                    />
                    <div className='min-w-0'>
                      <p className='medium-14'>Reviewed Book</p>
                      <h3 className='bold-16 mt-1 line-clamp-3'>{review.productId?.name ?? 'Deleted book'}</h3>
                      <p className='mt-1'>{review.productId?.category ?? 'No category'}</p>
                    </div>
                  </div>
                </div>

                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <div className='flex gap-1 text-yellow-400'>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <FaStar key={value} className={value <= review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <span className='rounded-full bg-primary px-3 py-1 medium-14'>{review.rating}/5</span>
                      {review.adminLiked && (
                        <span className='flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-red-500 medium-14 ring-1 ring-red-100'>
                          <FaHeart />
                          Loved by admin
                        </span>
                      )}
                    </div>
                    <p>{dateFormatter.format(new Date(review.createdAt))}</p>
                  </div>

                  <div className='mt-4 rounded-xl border border-[var(--theme-border)] p-4'>
                    <p className='medium-14'>Your Review</p>
                    <p className='mt-2 text-[15px]'>{review.comment}</p>
                  </div>

                  {review.adminReply?.message && (
                    <div className='mt-3 rounded-xl bg-primary p-4 ring-1 ring-secondary/20'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <FaRegCommentDots className='text-secondary' />
                        <h4 className='bold-15'>Admin Reply</h4>
                        {review.adminReply.repliedAt && (
                          <p>{dateFormatter.format(new Date(review.adminReply.repliedAt))}</p>
                        )}
                      </div>
                      <p className='mt-2'>{review.adminReply.message}</p>
                    </div>
                  )}

                  <div className='mt-4 flex justify-end'>
                    <button onClick={() => deleteReview(review._id)} className='flexCenter gap-2 rounded-md bg-red-600 px-5 py-3 medium-14 text-white'>
                      <FaTrash />
                      Delete Review
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyReviews
