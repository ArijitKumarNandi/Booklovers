import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaHeart, FaRegCommentDots } from 'react-icons/fa'
import { TbStarFilled, TbTrash } from 'react-icons/tb'
import { ShopContext } from '../context/ShopContext'

const ProductDescription = ({ description, productId }) => {
  const { axios, user, setShowUserLogin } = useContext(ShopContext)
  const [activeTab, setActiveTab] = useState('description')
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const formatReviewDate = (date) => new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))

  const loadReviews = async () => {
    try {
      const { data } = await axios.get(`/api/review/${productId}`)
      if(data.success){
        setReviews(data.reviews)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    let isActive = true

    axios.get(`/api/review/${productId}`)
      .then(({ data }) => {
        if(isActive && data.success){
          setReviews(data.reviews)
        }
      })
      .catch((error) => {
        if(isActive){
          toast.error(error.message)
        }
      })

    return () => {
      isActive = false
    }
  }, [axios, productId])

  const submitReview = async (event) => {
    event.preventDefault()

    if(!user){
      setShowUserLogin(true)
      return toast.error('Please login before posting a review')
    }

    try {
      const { data } = await axios.post('/api/review/add', {productId, rating, comment})
      if(data.success){
        toast.success(data.message)
        setRating(0)
        setComment('')
        await loadReviews()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const deleteReview = async (reviewId) => {
    try {
      const { data } = await axios.delete(`/api/review/${reviewId}`)
      if(data.success){
        toast.success(data.message)
        await loadReviews()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='mt-14 ring-1 ring-slate-900/10 rounded-lg'>
      <div className='flex gap-3'>
        <button onClick={() => setActiveTab('description')} className={`medium-14 p-3 w-32 ${activeTab === 'description' ? 'border-b-2 border-secondary' : ''}`}>Description</button>
        <button onClick={() => setActiveTab('reviews')} className={`medium-14 p-3 w-32 ${activeTab === 'reviews' ? 'border-b-2 border-secondary' : ''}`}>Reviews ({reviews.length})</button>
      </div>
      <hr className='h-[1px] w-full border-gray-500/30' />
      {activeTab === 'description' ? (
        <div className='p-4'>
          <p className='text-sm'>{description}</p>
        </div>
      ) : (
        <div className='p-4'>
          <form onSubmit={submitReview} className='mb-8'>
            <h4 className='h4 mb-3'>Leave a Review</h4>
            <div className='flex gap-1 mb-3'>
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type='button' onClick={() => setRating(value)} aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}>
                  <TbStarFilled className={`text-xl ${value <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder='Write your review...'
              className='surface-card min-h-28 w-full rounded-lg p-3 outline-none ring-1 ring-slate-900/10'
              maxLength={1000}
              required
            />
            <button type='submit' className='btn-secondary mt-3 !rounded-md'>Submit Review</button>
          </form>

          <h4 className='h4 mb-3'>Customer Reviews</h4>
          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review this book after purchasing it.</p>
          ) : (
            <div className='grid gap-3'>
              {reviews.map((review) => (
                <div key={review._id} className='bg-primary rounded-xl p-4'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-3'>
                        <h5 className='h5'>{review.userId?.name ?? 'Booklover'}</h5>
                        <div className='flex gap-0.5'>
                          {[1, 2, 3, 4, 5].map((value) => (
                            <TbStarFilled key={value} className={value <= review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                        <p>{formatReviewDate(review.createdAt)}</p>
                        {review.adminLiked && (
                          <span className='flex items-center gap-1 rounded-full bg-white px-3 py-1 text-red-500 medium-14'>
                            <FaHeart />
                            Loved by admin
                          </span>
                        )}
                      </div>
                      <p className='mt-2'>{review.comment}</p>
                    </div>
                    {user?._id === review.userId?._id && (
                      <button type='button' onClick={() => deleteReview(review._id)} className='text-red-500' aria-label='Delete your review'>
                        <TbTrash className='text-lg' />
                      </button>
                    )}
                  </div>

                  {review.adminReply?.message && (
                    <div className='mt-4 rounded-xl bg-white p-4 ring-1 ring-secondary/20'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <FaRegCommentDots className='text-secondary' />
                        <h5 className='h5'>Reply from Booklovers</h5>
                        {review.adminReply.repliedAt && (
                          <p>{formatReviewDate(review.adminReply.repliedAt)}</p>
                        )}
                      </div>
                      <p className='mt-2'>{review.adminReply.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductDescription
