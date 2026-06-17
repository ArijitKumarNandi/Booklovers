import React from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const Loading = () => {

    const {axios, navigate, fetchBooks} = useContext(ShopContext)
    let {search} = useLocation()
    const query = new URLSearchParams(search)
    const nextUrl = query.get('next')
    const sessionId = query.get('session_id')

    useEffect(()=>{
        const finishLoading = async () => {
            if(sessionId){
                await axios.post('/api/order/stripe/confirm', {sessionId}).catch(() => {})
                await fetchBooks()
            }

            setTimeout(() => {
                navigate(`/${nextUrl}`)
            }, 1500);
        }

        if(nextUrl){
            finishLoading()
        }
    }, [axios, fetchBooks, navigate, nextUrl, sessionId])

  return (
    <div className='flexCenter h-screen'>
        <div className='animate-spin h-24 w-24 border-4 border-gray-300 border-t-secondary rounded-full'/>
    </div>
  )
}

export default Loading
