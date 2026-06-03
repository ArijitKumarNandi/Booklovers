import React, { useState } from 'react'
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi'

const questions = [
  {
    question: 'How do I place an order on Booklovers?',
    answer: 'Browse the shop, open a book you like, add it to your cart, and continue through checkout with your address and payment method.',
  },
  {
    question: 'Can I track my order?',
    answer: 'Yes. After placing an order, open My Orders to see the order date, amount, payment status, and latest delivery status.',
  },
  {
    question: 'What if I receive the wrong or damaged book?',
    answer: 'Contact support with your order details. Keep the packaging and book condition visible so the return or replacement request can be reviewed quickly.',
  },
  {
    question: 'Do I need an account to buy books?',
    answer: 'You need to log in before checkout so your cart, address, and order history can stay connected to your account.',
  },
  {
    question: 'How do I update my profile image or account details?',
    answer: 'Open the user image menu, choose Profile, then update your name, email, password, or avatar from the profile page.',
  },
]

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <main className='max-padd-container py-16 pt-28'>
      <section className='rounded-2xl bg-primary p-8 lg:p-12'>
        <div className='flex items-center gap-4'>
          <span className='flexCenter h-14 w-14 rounded-full bg-white text-2xl text-secondary shadow-sm'><FiHelpCircle /></span>
          <div>
            <p className='medium-16 text-secondary'>Booklovers Support</p>
            <h1 className='bold-40'>Frequently Asked Questions</h1>
          </div>
        </div>
        <p className='mt-5 max-w-3xl regular-18'>Find quick answers about ordering, delivery, returns, accounts, and profile settings.</p>
      </section>

      <section className='mx-auto mt-8 max-w-4xl'>
        {questions.map((item, index) => {
          const isOpen = openIndex === index
          return (
            <div key={item.question} className='surface-card mb-4 rounded-xl ring-1 ring-slate-900/10'>
              <button type='button' onClick={() => setOpenIndex(isOpen ? -1 : index)} className='flex w-full items-center justify-between gap-4 p-5 text-left'>
                <span className='bold-18'>{item.question}</span>
                <FiChevronDown className={`shrink-0 text-xl transition-transform ${isOpen ? 'rotate-180 text-secondary' : ''}`} />
              </button>
              {isOpen && (
                <div className='border-t border-[var(--theme-border)] px-5 pb-5 pt-4'>
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </section>
    </main>
  )
}

export default FAQs
