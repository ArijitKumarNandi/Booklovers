import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { IoSearchOutline } from 'react-icons/io5'
import { TbSparkles } from 'react-icons/tb'
import Item from '../components/Item'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'

const Recommendations = () => {
  const { axios, user } = useContext(ShopContext)
  const [query, setQuery] = useState('')
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [recommendationInfo, setRecommendationInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [currPage, setCurrPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const searchText = query.trim()

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/product/recommendations', {
          params: { q: searchText },
        })

        if (data.success) {
          setRecommendedBooks(data.products)
          setRecommendationInfo(data)
          setHasLoaded(true)
          setCurrPage(1)
        }
      } catch (error) {
        toast.error(error.message)
        setRecommendedBooks([])
        setHasLoaded(true)
      } finally {
        setLoading(false)
      }
    }, searchText ? 350 : 0)

    return () => clearTimeout(timeoutId)
  }, [axios, query, user])

  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'smooth'})
  }, [currPage])

  const preferenceChips = [
    ...(recommendationInfo?.preferenceSummary?.genres ?? []),
    ...(recommendationInfo?.preferenceSummary?.subgenres ?? []),
    ...(recommendationInfo?.preferenceSummary?.authors ?? []),
  ].slice(0, 8)
  const totalPages = Math.ceil(recommendedBooks.length / itemsPerPage)
  const paginatedBooks = recommendedBooks.slice((currPage - 1) * itemsPerPage, currPage * itemsPerPage)

  return (
    <div className='max-padd-container py-16 pt-28 min-h-[70vh]'>
      <Title title1={'Book'} title2={'Recommendations'} titleStyles={'pb-8'} />

      <div className='mb-10 rounded-2xl bg-primary p-5 shadow-sm ring-1 ring-slate-900/5'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <div className='flex items-center gap-2 text-secondary'>
              <TbSparkles className='text-xl' />
              <span className='text-sm font-bold uppercase tracking-wide'>
                {recommendationInfo?.mode === 'personalized' ? 'Personalized Picks' : 'Recommended Picks'}
              </span>
            </div>
            <h3 className='h4 mt-2'>{user ? 'Books matched to your reading taste' : 'Popular books to start with'}</h3>
          </div>
          <div className='flex w-full max-w-xl items-center gap-3 rounded-full bg-white px-5 py-3 ring-1 ring-slate-900/10'>
            <IoSearchOutline className='shrink-0 text-xl' />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type='text'
              placeholder='Refine by title, author, genre, or keyword...'
              className='regular-15 w-full bg-transparent outline-none placeholder:text-gray-50'
            />
          </div>
        </div>

        {preferenceChips.length > 0 && (
          <div className='mt-5 flex flex-wrap gap-2'>
            {preferenceChips.map((item) => (
              <span key={item.label} className='rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-slate-900/5'>
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {loading && <p className='medium-16 mb-8'>Finding books...</p>}

      {hasLoaded && !loading && recommendedBooks.length === 0 && (
        <h4 className='h4'>No recommendations found.</h4>
      )}

      {recommendedBooks.length > 0 && (
        <>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-8'>
            {paginatedBooks.map((book) => (
              <Item key={book._id} book={book} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className='flexCenter flex-wrap gap-2 sm:gap-4 mt-14 mb-10'>
              <button disabled={currPage === 1} onClick={() => setCurrPage((prev) => prev - 1)} className={`${currPage === 1 && 'opacity-50 cursor-not-allowed'} btn-dark !py-1 !px-3`}>Previous</button>
              {Array.from({length: totalPages}, (_, index) => (
                <button key={index + 1} onClick={() => setCurrPage(index + 1)} className={`${currPage === index + 1 && 'bg-secondary !text-white'} btn-light !py-1 !px-3`}>{index + 1}</button>
              ))}
              <button disabled={currPage === totalPages} onClick={() => setCurrPage((prev) => prev + 1)} className={`${currPage === totalPages && 'opacity-50 cursor-not-allowed'} btn-white bg-tertiary !py-1 !px-3`}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Recommendations
