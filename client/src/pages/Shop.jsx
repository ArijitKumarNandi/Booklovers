import React, { useContext, useEffect, useState } from 'react'
import Title from '../components/Title'
import Item from '../components/Item'
import { ShopContext } from '../context/ShopContext'
import { genreTree, matchesGenreFilter } from '../assets/genreTree'


const Shop = () => {
  const {books, searchQuery, getAvailableQuantity} = useContext(ShopContext)
  const [filteredBooks, setFilteredBooks] = useState([])
  const [currPage, setCurrPage] = useState(1)
  const [selectedGenre, setSelectedGenre] = useState('')
  const itemsPerPage = 10

  useEffect(()=>{
    const query = searchQuery.toLowerCase()
    const result = books.filter((book) => {
      const searchText = [
        book.name,
        book.description,
        ...(book.genres ?? []),
        ...(book.subgenres ?? []),
        ...(book.genrePaths ?? []),
        book.category,
      ].filter(Boolean).join(' ').toLowerCase()

      return (!query || searchText.includes(query)) && matchesGenreFilter(book, selectedGenre)
    })
    setFilteredBooks(result)

    setCurrPage(1) // Reset to first page on search/filter change
  }, [books, searchQuery, selectedGenre])

  const availableBooks = filteredBooks.filter((book) => getAvailableQuantity(book) > 0)
  const totalPages = Math.ceil(availableBooks.length / itemsPerPage);
  useEffect(()=>{
    window.scrollTo({top: 0, behavior: "smooth"})
  }, [currPage])

  return (
    <div className='max-padd-container py-16 pt-24'>
      <div className='mb-8 rounded-xl bg-primary p-4 shadow-sm ring-1 ring-slate-900/5'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <h2 className='bold-24'>Filter Books By Genre</h2>
            <p className='mt-1'>Choose a genre to quickly find books that match your reading mood.</p>
          </div>
          <div className='flex flex-col gap-2 sm:min-w-80'>
            <label htmlFor='genre-filter' className='medium-14'>Genre</label>
            <select
              id='genre-filter'
              value={selectedGenre}
              onChange={(event) => setSelectedGenre(event.target.value)}
              className='rounded-lg bg-white px-3 py-2 outline-none ring-1 ring-slate-900/10'
            >
              <option value=''>All genres</option>
              {genreTree.map((genre) => (
                <option key={genre.name} value={genre.name}>{genre.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-8'>
        {availableBooks.length > 0 ? (
          availableBooks.slice((currPage - 1) * itemsPerPage, currPage * itemsPerPage).map((book)=>
            <Item key={book._id} book={book} />
          )
        ) : (
          <h4 className="h4">Oops! Nothing matched your search</h4>
        )}
      </div>
      {/* PAGINATION */}
      <div className='flexCenter flex-wrap gap-2 sm:gap-4 mt-14 mb-10'>
        <button disabled={currPage===1} onClick={()=>setCurrPage(prev=>prev-1)} className={`${currPage===1 && "opacity-50 cursor-not-allowed"} btn-dark !py-1 !px-3`}>Previous</button>
        {Array.from({length: totalPages}, (_, index)=>(
          <button key={index+1} onClick={()=>setCurrPage(index+1)} className={`${currPage=== index + 1 && "bg-secondary !text-white"} btn-light !py-1 !px-3`}>{index + 1}</button>
        ))}
        <button disabled={currPage===totalPages} onClick={()=>setCurrPage(prev=>prev+1)} className={`${currPage=== totalPages && "opacity-50 cursor-not-allowed"} btn-white bg-tertiary !py-1 !px-3`}>Next</button>
      </div>
    </div>
  )
}

export default Shop
