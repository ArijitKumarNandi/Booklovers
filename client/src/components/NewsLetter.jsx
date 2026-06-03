import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { FaDribbble, FaFacebookF, FaInstagram } from "react-icons/fa6"

const NewsLetter = () => {
  const [email, setEmail] = useState('')

  const socialLinks = [
    { label: 'Facebook', href: 'https://www.facebook.com', icon: <FaFacebookF /> },
    { label: 'Instagram', href: 'https://www.instagram.com', icon: <FaInstagram /> },
    { label: 'Dribbble', href: 'https://dribbble.com', icon: <FaDribbble /> },
  ]

  const submitHandler = (event) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)

    if (!isValidEmail) {
      toast.error('Please enter a valid email address')
      return
    }

    toast.success('Email added successfully')
    setEmail('')
  }

  return (
    <section className='max-padd-container py-8 mt-2'>
      <div className='flexBetween flex-wrap gap-7'>
        <div>
          <h4 className="bold-14 uppercase tracking-wider">Subscribe newsletter</h4>
          <p>Get latest information on Events, Sales & Offers.</p>
        </div>
        <div>
          <form onSubmit={submitHandler} className='flex bg-primary'>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email Address.." className="p-4 bg-primary w-[222px] sm:w-[266px] outline-none text-[13px]" />
            <button type='submit' className='btn-secondary !rounded-none !text-[13px] !font-bold uppercase'>Submit</button>
          </form>
        </div>
        <div className='flex gap-x-3 pr-14'>
          {socialLinks.map((social) => (
            <a key={social.label} href={social.href} target='_blank' rel='noreferrer' aria-label={social.label} className='h-8 w-8 rounded-full hover:bg-secondary hover:text-white flexCenter transition-all duration-500'>
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewsLetter
