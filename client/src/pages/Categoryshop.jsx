import React, { useContext, useEffect, useState } from 'react'
import Title from '../components/Title'
import Item from '../components/Item'
import { ShopContext } from '../context/ShopContext'
import { useParams } from 'react-router-dom'
import { matchesGenreFilter } from '../assets/genreTree'


const CategoryShop = () => {
  const {books, searchQuery, getAvailableQuantity} = useContext(ShopContext)
  const [filteredBooks, setFilteredBooks] = useState([])
  const [currPage, setCurrPage] = useState(1)
  const itemsPerPage = 10
  const {category, genrePath} = useParams()
  const selectedGenre = genrePath ? decodeURIComponent(genrePath).split(' > ').pop() : category

  

  useEffect(()=>{
    let result=books;

    // Filter by genre from URL. The category fallback keeps old links working.
    if(selectedGenre){
      result = result.filter((book) => matchesGenreFilter(book, selectedGenre))
    }

    if(searchQuery.length > 0){
      const query = searchQuery.toLowerCase()
      setFilteredBooks(result= result.filter((book)=> [
        book.name,
        book.description,
        ...(book.genres ?? []),
        ...(book.subgenres ?? []),
        ...(book.genrePaths ?? []),
        book.category,
      ].filter(Boolean).join(' ').toLowerCase().includes(query)))
    }
    setFilteredBooks(result);

    setCurrPage(1) // Reset to first page on search/filter change
  }, [books, searchQuery, selectedGenre]);

  const availableBooks = filteredBooks.filter((book) => getAvailableQuantity(book) > 0)
  const totalPages = Math.ceil(availableBooks.length / itemsPerPage);
  useEffect(()=>{
    window.scrollTo({top: 0, behavior: "smooth"})
  }, [currPage])

  return (
    <div className='max-padd-container py-16 pt-28'>
      <Title title1={selectedGenre} title2={"Books"} titleStyles={"pb-10"} />
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

export default CategoryShop
