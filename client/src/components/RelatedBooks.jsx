import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import Item from './Item'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';


// import required modules
import { Autoplay } from 'swiper/modules';

const RelatedBooks = ({book, id}) => {
  const [relatedBooks, setRelatedBooks] = useState([])
  const {books} = useContext(ShopContext)

  useEffect(()=>{
    if(books.length > 0 && book){
      let booksCopy = books.slice()
      booksCopy = booksCopy.filter((item)=>item.category === book.category && id !== item._id)
      setRelatedBooks(booksCopy.slice(0, 6))
    }
  }, [books, book, id])

  return (
    <section className='py-16'>
      
      <Title title1={"Related"} title2={"Books"} titleStyles={"pb-10"} />
      {/*CONTAINER*/}
      {
        <Swiper
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            355: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            600: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            900: {
              slidesPerView: 4,
              spaceBetween: 30,
            },
            1200: {
              slidesPerView: 5,
              spaceBetween: 30,
            }
          }}
          modules={[Autoplay]}
          className="min-h-[333px]"
        >
          {
            relatedBooks.map((book) => (
              <SwiperSlide key={book._id}>
                <Item book={book} />

              </SwiperSlide>
            ))
          }

        </Swiper>
      }
    </section>
  )
}

export default RelatedBooks
