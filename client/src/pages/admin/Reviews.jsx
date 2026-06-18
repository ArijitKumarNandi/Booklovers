import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FaHeart, FaRegCommentDots, FaRegHeart, FaStar, FaTrash } from 'react-icons/fa'
import { MdRateReview } from 'react-icons/md'
import { ShopContext } from '../../context/ShopContext'
import { getBookGenreLabels, getRootGenres } from '../../assets/genreTree'

const Reviews = () => {
  const { axios } = useContext(ShopContext)
  const [reviews, setReviews] = useState([])
  const [replyDrafts, setReplyDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [heartFilter, setHeartFilter] = useState('all')
  const [replyFilter, setReplyFilter] = useState('all')

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }), [])

  const fetchReviews = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/admin/reviews')
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
  }, [axios])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const saveReply = async (reviewId) => {
    try {
      const { data } = await axios.patch('/api/admin/reviews/reply', {
        reviewId,
        message: replyDrafts[reviewId],
      })

      if(data.success){
        toast.success(data.message)
        setReplyDrafts((drafts) => ({ ...drafts, [reviewId]: '' }))
        await fetchReviews()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const toggleHeart = async (reviewId) => {
    try {
      const { data } = await axios.patch('/api/admin/reviews/heart', { reviewId })
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

  const deleteReply = async (reviewId) => {
    try {
      const { data } = await axios.delete(`/api/admin/reviews/${reviewId}/reply`)
      if(data.success){
        toast.success(data.message)
        setReplyDrafts((drafts) => ({ ...drafts, [reviewId]: '' }))
        await fetchReviews()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteReview = async (reviewId) => {
    try {
      const { data } = await axios.delete(`/api/admin/reviews/${reviewId}`)
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
  const repliedCount = reviews.filter((review) => review.adminReply?.message).length
  const heartedCount = reviews.filter((review) => review.adminLiked).length
  const filteredReviews = reviews.filter((review) => {
    if(heartFilter === 'hearted' && !review.adminLiked){
      return false
    }

    if(heartFilter === 'not-hearted' && review.adminLiked){
      return false
    }

    if(replyFilter === 'replied' && !review.adminReply?.message){
      return false
    }

    if(replyFilter === 'not-replied' && review.adminReply?.message){
      return false
    }

    return true
  })

  return (
    <div className='m-2 h-[97vh] w-full overflow-y-scroll rounded-xl bg-primary px-3 py-8 sm:px-6 lg:w-4/5'>
      <div className='mb-6 rounded-2xl bg-white/60 p-5 shadow-sm ring-1 ring-slate-900/5 lg:p-6'>
        <p className='medium-14 text-secondary'>Admin Panel / Reviews</p>
        <div className='mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <span className='flexCenter h-16 w-16 rounded-full bg-white text-3xl text-secondary shadow-sm ring-1 ring-slate-900/5'>
              <MdRateReview />
            </span>
            <div>
              <h1 className='bold-32'>Customer Reviews</h1>
              <p className='mt-1'>Read feedback, reply to customers, and highlight loved reviews.</p>
              <div className='mt-4 flex flex-wrap gap-2'>
                <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Book feedback</span>
                <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Customer replies</span>
                <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Admin highlights</span>
              </div>
            </div>
          </div>
          <div className='grid min-w-[340px] grid-cols-3 gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5'>
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
              <h3 className='bold-24'>{repliedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='surface-card rounded-xl p-8 shadow-sm'>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className='surface-card rounded-xl p-8 text-center shadow-sm ring-1 ring-slate-900/5'>
          <MdRateReview className='mx-auto mb-3 text-5xl text-secondary' />
          <h2 className='bold-22'>No reviews yet</h2>
          <p className='mt-2'>Customer ratings will appear here after users review purchased books.</p>
        </div>
      ) : (
        <div className='grid gap-5'>
          <div className='surface-card flex flex-col gap-3 rounded-xl p-4 shadow-sm ring-1 ring-slate-900/5 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-col gap-2 sm:flex-row'>
              <select
                value={heartFilter}
                onChange={(event) => setHeartFilter(event.target.value)}
                className='rounded-lg bg-primary px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-900/10'
              >
                <option value='all'>All heart status</option>
                <option value='hearted'>Hearted reviews</option>
                <option value='not-hearted'>Not hearted reviews</option>
              </select>
              <select
                value={replyFilter}
                onChange={(event) => setReplyFilter(event.target.value)}
                className='rounded-lg bg-primary px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-900/10'
              >
                <option value='all'>All reply status</option>
                <option value='replied'>Replied reviews</option>
                <option value='not-replied'>Not replied reviews</option>
              </select>
            </div>
            <p className='text-sm text-gray-500'>Showing {filteredReviews.length} of {reviews.length} reviews</p>
          </div>

          {filteredReviews.length === 0 ? (
            <div className='surface-card rounded-xl p-8 text-center shadow-sm ring-1 ring-slate-900/5'>
              No reviews matched your filters.
            </div>
          ) : filteredReviews.map((review) => (
            <article key={review._id} className='surface-card overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md'>
              <div className='grid gap-5 p-4 xl:grid-cols-[300px_minmax(0,1fr)] lg:p-5'>
                <div className='rounded-2xl bg-primary p-4 ring-1 ring-slate-900/5'>
                  <div className='flex gap-4'>
                    <img
                      src={review.productId?.image?.[0]}
                      alt={review.productId?.name ?? 'Reviewed book'}
                      className='h-28 w-24 rounded-xl bg-white object-contain shadow-sm ring-1 ring-slate-900/5'
                    />
                    <div className='min-w-0'>
                      <p className='medium-14 text-secondary'>Reviewed Book</p>
                      <h3 className='bold-18 mt-1 line-clamp-3'>{review.productId?.name ?? 'Deleted book'}</h3>
                      <span className='mt-3 inline-flex rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>{getRootGenres(getBookGenreLabels(review.productId)).join(', ') || 'No genre'}</span>
                    </div>
                  </div>
                  <div className='mt-5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5'>
                    <p className='medium-14 text-secondary'>Customer</p>
                    <div className='mt-2 flex items-center gap-3'>
                      {review.userId?.avatar ? (
                        <img src={review.userId.avatar} alt={review.userId?.name} className='h-11 w-11 rounded-full object-cover ring-2 ring-primary' />
                      ) : (
                        <span className='flexCenter h-11 w-11 rounded-full bg-secondary text-white bold-16 ring-2 ring-primary'>
                          {(review.userId?.name ?? 'B').charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className='min-w-0'>
                        <h4 className='bold-15 line-clamp-1'>{review.userId?.name ?? 'Booklover'}</h4>
                        <p className='line-clamp-1'>{review.userId?.email ?? 'No email'}</p>
                      </div>
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
                          Hearted
                        </span>
                      )}
                    </div>
                    <p>{dateFormatter.format(new Date(review.createdAt))}</p>
                  </div>

                  <div className='mt-4 rounded-2xl border border-[var(--theme-border)] bg-white p-4'>
                    <p className='medium-14 text-secondary'>Customer Review</p>
                    <p className='mt-2 text-[15px]'>{review.comment}</p>
                  </div>

                  {review.adminReply?.message && (
                    <div className='mt-3 rounded-2xl bg-primary p-4 ring-1 ring-secondary/20'>
                      <div className='flex flex-wrap items-center justify-between gap-3'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <FaRegCommentDots className='text-secondary' />
                          <h4 className='bold-15'>Admin Reply</h4>
                          {review.adminReply.repliedAt && (
                            <p>{dateFormatter.format(new Date(review.adminReply.repliedAt))}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteReply(review._id)}
                          className='flexCenter h-10 w-10 rounded-full bg-white text-red-500 shadow-sm ring-1 ring-red-200 transition hover:bg-red-50'
                          aria-label='Delete admin reply'
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <p className='mt-2'>{review.adminReply.message}</p>
                    </div>
                  )}

                  <div className='mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_160px]'>
                    <textarea
                      value={replyDrafts[review._id] ?? ''}
                      onChange={(event) => setReplyDrafts((drafts) => ({ ...drafts, [review._id]: event.target.value }))}
                      placeholder='Write an admin reply...'
                      className='min-h-28 w-full rounded-2xl bg-primary p-4 outline-none ring-1 ring-slate-900/10 transition focus:bg-white focus:ring-secondary'
                      maxLength={1000}
                    />
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1'>
                      <button onClick={() => saveReply(review._id)} className='btn-secondary flexCenter !rounded-xl !px-4'>
                        Save Reply
                      </button>
                      <button
                        onClick={() => toggleHeart(review._id)}
                        className={`flexCenter gap-2 rounded-xl px-4 py-3 medium-14 transition ${review.adminLiked ? 'bg-red-500 text-white shadow-sm' : 'bg-white text-red-500 ring-1 ring-red-200 hover:bg-red-50'}`}
                      >
                        {review.adminLiked ? <FaHeart /> : <FaRegHeart />}
                        {review.adminLiked ? 'Hearted' : 'Heart'}
                      </button>
                      <button onClick={() => deleteReview(review._id)} className='flexCenter gap-2 rounded-xl bg-red-600 px-4 py-3 medium-14 text-white transition hover:bg-red-700'>
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
          <div className='mb-2 rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-900/5'>
            <p>{heartedCount} review{heartedCount === 1 ? '' : 's'} currently highlighted with an admin heart.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reviews
