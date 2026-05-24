import React, { useContext, useEffect, useState } from 'react'
import { IoSearchOutline } from 'react-icons/io5'
import Item from '../components/Item'
import Title from '../components/Title'
import { ShopContext } from '../context/ShopContext'

const Recommendations = () => {
  const { axios } = useContext(ShopContext)
  const [query, setQuery] = useState('')
  const [recommendedBooks, setRecommendedBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const searchText = query.trim()

    if (!searchText) {
      setRecommendedBooks([])
      setHasSearched(false)
      setLoading(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/product/recommendations', {
          params: { q: searchText },
        })

        if (data.success) {
          setRecommendedBooks(data.products)
          setHasSearched(true)
        }
      } catch (error) {
        console.log(error.message)
        setRecommendedBooks([])
        setHasSearched(true)
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [axios, query])

  return (
    <div className='max-padd-container py-16 pt-28 min-h-[70vh]'>
      <Title title1={'Book'} title2={'Recommendations'} titleStyles={'pb-8'} />

      <div className='max-w-2xl mb-10'>
        <div className='flex items-center gap-3 bg-primary rounded-full px-5 py-3 ring-1 ring-slate-900/10'>
          <IoSearchOutline className='text-xl shrink-0' />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type='text'
            placeholder='Type a title, author, category, or keyword...'
            className='w-full bg-transparent outline-none regular-15 placeholder:text-gray-50'
          />
        </div>
      </div>

      {loading && <p className='medium-16 mb-8'>Finding books...</p>}

      {!query.trim() && (
        <div className='bg-primary rounded-xl p-8 max-w-2xl'>
          <h3 className='h4 mb-2'>Start typing to get recommendations</h3>
          <p>Search by the text stored with your books, such as title, description, or category.</p>
        </div>
      )}

      {hasSearched && !loading && recommendedBooks.length === 0 && (
        <h4 className='h4'>No recommendations matched your text.</h4>
      )}

      {recommendedBooks.length > 0 && (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-8'>
          {recommendedBooks.map((book) => (
            <Item key={book._id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Recommendations
