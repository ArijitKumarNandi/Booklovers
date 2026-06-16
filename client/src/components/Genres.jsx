import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { genreTree } from '../assets/genreTree'
import Title from './Title'
import academic from '../assets/categories/academic.png'
import adventure from '../assets/categories/adventure.png'
import business from '../assets/categories/business.png'
import children from '../assets/categories/children.png'
import health from '../assets/categories/health.png'
import history from '../assets/categories/history.png'
import horror from '../assets/categories/horror.png'

const genreImages = {
  Action: adventure,
  Adventure: adventure,
  Art: academic,
  Biography: history,
  Business: business,
  Children: children,
  Crime: horror,
  Education: academic,
  Fantasy: adventure,
  Fiction: children,
  Health: health,
  'Historical Fiction': history,
  History: history,
  Horror: horror,
  Mystery: horror,
  Nature: health,
  Philosophy: academic,
  Science: academic,
  'Science Fiction': academic,
  'Self Help': health,
  Technology: academic,
  Thriller: horror,
}

const fallbackImages = [academic, adventure, business, children, health, history, horror]

const Genres = () => {
  const { navigate } = useContext(ShopContext)
  const [page, setPage] = useState(1)
  const genresPerPage = 6
  const totalPages = Math.ceil(genreTree.length / genresPerPage)
  const colors = ['bg-[#dbeafe]', 'bg-[#f3e8ff]', 'bg-[#fce7f3]', 'bg-[#fef9c3]', 'bg-[#dcfce7]', 'bg-[#fee2e2]']
  const visibleGenres = genreTree.slice((page - 1) * genresPerPage, page * genresPerPage)

  const browseGenre = (genre) => {
    navigate(`/shop/genre/${encodeURIComponent(genre)}`)
    scrollTo(0, 0)
  }

  return (
    <section className='max-padd-container pt-16 pb-4'>
      <Title title1={'Browse By'} title2={'Genre'} titleStyles={'pb-6'} paraStyles={'hidden'} />
      <div className='flex flex-wrap justify-center gap-4 sm:gap-6'>
        {visibleGenres.map((genre, index) => (
          <button
            key={genre.name}
            type='button'
            onClick={() => browseGenre(genre.name)}
            className={`flexCenter h-36 w-36 flex-col rounded-xl text-center font-semibold text-gray-900 shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-1 hover:shadow-md sm:h-40 sm:w-40 ${colors[index % colors.length]}`}
          >
            <img
              src={genreImages[genre.name] || fallbackImages[index % fallbackImages.length]}
              alt={genre.name}
              className='h-12 w-12 object-contain'
            />
            <span className='mt-5'>{genre.name}</span>
          </button>
        ))}
      </div>

      <div className='flexCenter mt-8 flex-wrap gap-2'>
        <button
          type='button'
          disabled={page === 1}
          onClick={() => setPage((value) => Math.max(value - 1, 1))}
          className={`${page === 1 ? 'cursor-not-allowed opacity-60' : ''} rounded-full bg-gray-500 px-4 py-2 font-semibold text-white shadow-sm`}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            type='button'
            onClick={() => setPage(index + 1)}
            className={`flexCenter h-10 w-10 rounded-full font-semibold shadow-sm ${page === index + 1 ? 'bg-secondary text-white' : 'bg-primary text-gray-900'}`}
          >
            {index + 1}
          </button>
        ))}
        <button
          type='button'
          disabled={page === totalPages}
          onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
          className={`${page === totalPages ? 'cursor-not-allowed opacity-60' : ''} rounded-full bg-yellow-300 px-4 py-2 font-semibold text-gray-900 shadow-sm`}
        >
          Next
        </button>
      </div>
    </section>
  )
}

export default Genres
