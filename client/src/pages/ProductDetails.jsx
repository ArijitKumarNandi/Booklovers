import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link, useParams } from 'react-router-dom'
import { TbStarFilled, TbStarHalfFilled, TbShoppingBagPlus, TbHeart, TbShare3 } from 'react-icons/tb'
import { FaTruckFast } from 'react-icons/fa6'
import toast from 'react-hot-toast'
import ProductDescription from '../components/ProductDescription'
import ProductFeatures from '../components/ProductFeatures'
import RelatedBooks from '../components/RelatedBooks'

const getWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem('booklovers-wishlist')) ?? []
  } catch {
    return []
  }
}

const ProductDetails = () => {
  const {books, currency, addToCart} = useContext(ShopContext)
  const {id} = useParams()
  const book = books.find((b)=> b._id === id)
  const [selectedImage, setSelectedImage] = useState(null)
  const [wishlist, setWishlist] = useState(getWishlist)
  const image = selectedImage?.bookId === id ? selectedImage.src : book?.image[0]
  const isWishlisted = wishlist.includes(id)

  const toggleWishlist = () => {
    const updatedWishlist = isWishlisted
      ? wishlist.filter((bookId) => bookId !== id)
      : [...wishlist, id]

    setWishlist(updatedWishlist)
    localStorage.setItem('booklovers-wishlist', JSON.stringify(updatedWishlist))
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const copyPageUrl = async () => {
    const pageUrl = window.location.href

    try {
      await navigator.clipboard.writeText(pageUrl)
      toast.success('Book link copied')
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = pageUrl
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()

      const copied = document.execCommand('copy')
      document.body.removeChild(textArea)
      copied ? toast.success('Book link copied') : toast.error('Unable to copy the book link')
    }
  }

  useEffect(()=>{
    if(book){
      window.scrollTo({top: 0, behavior: "smooth"})
    }
  }, [book, id])

  return (
    book && (
      <div className='max-padd-container py-16 pt-28'>
        <p>
          <Link to={`/`}>Home</Link> /
          <Link to={`/shop`}>Shop</Link> /
          <Link to={`/shop/${book.category}`}>{book.category}</Link> /
          <span>{book.name}</span>
        </p>
        {/*BOOK DATA*/}
        <div className='flex gap-10 flex-col xl:flex-row my-6'>
          {/*IMAGE*/}
          <div className='flex gap-x-2 max-w-[433px] rounded-xl'>
            <div className='flex-1 flexCenter flex-col gap-[7px] flex-wrap'>
              {book.image.map((item, index)=>(
                <div key={index}>
                  <img onClick={()=>setSelectedImage({ bookId: id, src: item })} src={item} alt="bookImg" className='rounded-lg overflow-hidden'/>
                </div>
              ))}
            </div>
            <div className='flex flex-[4]'>
              <img src={image} alt="bookImg" className='rounded-lg overflow-hidden'/>
            </div>
          </div>
          {/*INFO*/}
          <div className='px-5 py-3 w-full bg-primary rounded-xl pt-8'>
            <h3 className="h3 leading-none">{book.name}</h3>
            <div className='flex items-center gap-x-2 pt-2'>
              <div className='flex gap-x-2 text-yellow-400'>
                <TbStarFilled />
                <TbStarFilled />
                <TbStarFilled />
                <TbStarFilled />
                <TbStarHalfFilled />
              </div>
              <p className='medium-12'>(22)</p>
            </div>
            <div className='h4 flex items-baseline gap-4 my-2'>
              <h3 className='h3 line-through text-secondary'>{currency}{book.price}.00</h3>
              <h4 className="h4">{currency}{book.offerPrice}.00</h4>
            </div>
            <p className='max-w-[555px]'>{book.description}</p>
            <div className='flex items-center gap-x-4 mt-6'>
              <button onClick={()=>addToCart(book._id)} className="btn-dark sm:w-1/2 flexCenter gap-x-2 capitalize !rounded-md">Add to Cart <TbShoppingBagPlus /></button>
              <button
                type='button'
                onClick={toggleWishlist}
                className='btn-secondary !rounded-md'
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isWishlisted}
              >
                <TbHeart className={`text-xl transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>
            </div>
            <button onClick={copyPageUrl} className='mt-3 flex items-center gap-x-2 medium-14 text-secondary hover:underline cursor-pointer'>
              <TbShare3 className='text-lg' />
              Share this book
            </button>
            <div className='flex items-center gap-x-2 mt-3'>
              <FaTruckFast className="text-lg"/>
              <span className='medium-14'>Free Delivery on orders over 500$</span>
            </div>
            <hr className='my-3 w-2/3' />
            <div className='mt-2 flex flex-col gap-1 text-gray-30 text-[14px]'>
              <p>Authenticity You Can Trust</p>
              <p>Enjoy Cash on Delivery for Your Convenience</p>
              <p>Easy Returns and Exchanges Within 7 Days</p>
            </div>
          </div>
        </div>
        <ProductDescription description={book.description} productId={book._id} />
        <ProductFeatures />
        <RelatedBooks book={book} id={id}/>
      </div>
    )
  )
}

export default ProductDetails
