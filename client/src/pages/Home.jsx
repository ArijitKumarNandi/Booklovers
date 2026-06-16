import React from 'react'
import Hero from '../components/Hero'
import Genres from '../components/Genres'
import NewArrivals from '../components/NewArrivals'
import FeaturedBooks from '../components/FeaturedBooks'
import PopularBooks from '../components/PopularBooks'
import NewsLetter from '../components/NewsLetter'
import Achievements from '../components/Achievements'

const Home = () => {
  return (
    <>
      <Hero />
      <Genres />
      <NewArrivals />
      <FeaturedBooks />
      <PopularBooks />
      <Achievements />
      <NewsLetter />
    </>
  )
}

export default Home
