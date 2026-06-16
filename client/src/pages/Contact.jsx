import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { FiClock, FiMail, FiMapPin, FiMessageCircle, FiPhone, FiSend } from 'react-icons/fi'

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })

  const submitHandler = (event) => {
    event.preventDefault()
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())

    if (!form.name.trim() || !validEmail || !form.message.trim()) {
      toast.error('Please fill all fields with a valid email')
      return
    }

    toast.success('Message sent successfully')
    setForm({ name: '', email: '', message: '' })
  }

  const contactCards = [
    { icon: <FiMail />, title: 'Email', text: 'support@booklovers.com' },
    { icon: <FiPhone />, title: 'Phone', text: '+1 555 123 4567' },
    { icon: <FiMapPin />, title: 'Location', text: 'Readers Avenue, New York, USA' },
    { icon: <FiClock />, title: 'Support Hours', text: 'Mon - Sat, 9:00 AM - 6:00 PM' },
  ]

  return (
    <main className='max-padd-container py-16 pt-28'>
      <section className='rounded-2xl bg-primary p-8 lg:p-12'>
        <div className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
          <div>
            <p className='medium-16 text-secondary'>Contact Booklovers</p>
            <h1 className='bold-44 mt-2'>We would love to hear from you</h1>
            <p className='regular-18 mt-4 max-w-2xl'>
              Have a question about books, orders, delivery, or your account? Send us a message and our team will help you as soon as possible.
            </p>
          </div>
          <div className='surface-card rounded-xl p-6 shadow-sm ring-1 ring-slate-900/10'>
            <div className='flex items-center gap-3'>
              <span className='flexCenter h-12 w-12 rounded-full bg-primary text-secondary'><FiMessageCircle className='text-xl' /></span>
              <div>
                <h2 className='bold-20'>Quick Support</h2>
                <p>Friendly help for every reader.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
        {contactCards.map((card) => (
          <div key={card.title} className='surface-card rounded-xl p-5 shadow-sm ring-1 ring-slate-900/10'>
            <span className='flexCenter h-11 w-11 rounded-full bg-primary text-secondary'>{card.icon}</span>
            <h2 className='bold-18 mt-4'>{card.title}</h2>
            <p className='mt-1'>{card.text}</p>
          </div>
        ))}
      </section>

      <section className='mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]'>
        <div className='rounded-2xl bg-gradient-to-br from-violet-100 via-white to-sky-100 p-8'>
          <h2 className='bold-28'>Visit or message us anytime</h2>
          <p className='mt-4'>
            Whether you need help finding your next read, tracking an order, or understanding a return, Booklovers is here to make the experience smooth.
          </p>
          <div className='mt-6 grid gap-3'>
            <div className='rounded-lg bg-white/70 p-4'>
              <h3 className='bold-16'>For orders</h3>
              <p className='mt-1'>Share your order ID so we can check status quickly.</p>
            </div>
            <div className='rounded-lg bg-white/70 p-4'>
              <h3 className='bold-16'>For recommendations</h3>
              <p className='mt-1'>Tell us your favorite genre, subgenre, and reading mood.</p>
            </div>
          </div>
        </div>

        <form onSubmit={submitHandler} className='surface-card rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/10 lg:p-8'>
          <h2 className='bold-28'>Send a Message</h2>
          <div className='mt-6 grid gap-4'>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder='Your name'
              className='profile-input'
            />
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder='Email address'
              className='profile-input'
            />
            <textarea
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder='Write your message'
              rows={6}
              className='profile-input resize-none'
            />
            <button type='submit' className='btn-secondary flexCenter gap-2 rounded-md'>
              <FiSend />
              Send Message
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default Contact
