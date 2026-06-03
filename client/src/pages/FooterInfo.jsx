import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiClock, FiCreditCard, FiGift, FiPackage, FiRefreshCw, FiStar, FiTruck } from 'react-icons/fi'

const infoPages = {
  'best-sellers': {
    title: 'Best Sellers',
    subtitle: 'Reader favorites that keep moving from shelf to shelf.',
    icon: <FiStar />,
    accent: 'from-amber-200 via-white to-sky-100',
    points: [
      'Explore books with strong customer interest across academic, children, business, health, horror, history, and adventure categories.',
      'Our best sellers are selected from popular demand, repeat purchases, and titles that readers consistently recommend.',
      'Use this section to quickly discover trusted reads when you want a book that already has momentum.',
    ],
  },
  'offers-deals': {
    title: 'Offers & Deals',
    subtitle: 'Smart ways to buy more books while spending less.',
    icon: <FiGift />,
    accent: 'from-violet-200 via-white to-rose-100',
    points: [
      'Find seasonal discounts, limited-time price drops, and value picks across different book categories.',
      'Deal collections are designed for students, families, casual readers, and anyone building a personal library.',
      'Check back often because offers may change when new stock arrives or special reading events begin.',
    ],
  },
  'delivery-information': {
    title: 'Delivery Information',
    subtitle: 'Clear delivery guidance from checkout to doorstep.',
    icon: <FiTruck />,
    accent: 'from-emerald-100 via-white to-sky-100',
    points: [
      'Orders are processed after successful checkout and prepared carefully so books arrive in good condition.',
      'Delivery time may vary by address, order volume, and availability of selected books.',
      'You can review your order status from the orders area after placing an order.',
    ],
  },
  'return-refund-policy': {
    title: 'Return & Refund Policy',
    subtitle: 'Simple support when something is not right.',
    icon: <FiRefreshCw />,
    accent: 'from-rose-100 via-white to-amber-100',
    points: [
      'Returns are accepted for eligible books that arrive damaged, incorrect, or meaningfully different from the order.',
      'Please keep packaging and order details ready when contacting support about a return.',
      'Refunds are reviewed after the return request is approved and processed according to the payment method.',
    ],
  },
  'payment-methods': {
    title: 'Payment Methods',
    subtitle: 'Flexible payment choices for a smoother checkout.',
    icon: <FiCreditCard />,
    accent: 'from-sky-100 via-white to-violet-100',
    points: [
      'Booklovers supports available checkout methods such as cash on delivery and online payment where configured.',
      'Payment status is attached to your order so you can confirm whether it is pending or completed.',
      'Always complete payment through the official checkout flow for a secure purchase experience.',
    ],
  },
  'track-your-order': {
    title: 'Track Your Order',
    subtitle: 'Stay updated as your books move toward you.',
    icon: <FiPackage />,
    accent: 'from-lime-100 via-white to-cyan-100',
    points: [
      'After placing an order, open your orders page to review status, date, amount, and payment method.',
      'Order status can move through stages such as placed, packing, shipped, out for delivery, and delivered.',
      'Tracking details help you understand where your order is and when to expect the next update.',
    ],
  },
}

const FooterInfo = () => {
  const { slug } = useParams()
  const page = infoPages[slug]

  if (!page) {
    return (
      <div className='max-padd-container min-h-[60vh] py-16 pt-28'>
        <h1 className='bold-32'>Page not found</h1>
        <Link to='/' className='mt-4 inline-flex items-center gap-2 underline bold-14'><FiArrowLeft /> Back home</Link>
      </div>
    )
  }

  return (
    <main className='max-padd-container py-16 pt-28'>
      <Link to='/' className='inline-flex items-center gap-2 underline bold-14'><FiArrowLeft /> Back home</Link>

      <section className={`mt-6 rounded-2xl bg-gradient-to-br ${page.accent} p-8 lg:p-12`}>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-3xl'>
            <p className='medium-16 text-secondary'>Booklovers Help</p>
            <h1 className='bold-44 mt-2'>{page.title}</h1>
            <p className='regular-18 mt-4 max-w-2xl'>{page.subtitle}</p>
          </div>
          <div className='flexCenter h-24 w-24 rounded-full bg-white/70 text-4xl text-secondary shadow-sm'>
            {page.icon}
          </div>
        </div>
      </section>

      <section className='mt-8 grid gap-5 md:grid-cols-3'>
        {page.points.map((point, index) => (
          <div key={point} className='surface-card rounded-xl p-6 shadow-sm ring-1 ring-slate-900/10'>
            <span className='flexCenter h-10 w-10 rounded-full bg-primary text-secondary'><FiCheckCircle /></span>
            <h2 className='bold-18 mt-4'>Point {index + 1}</h2>
            <p className='mt-2'>{point}</p>
          </div>
        ))}
      </section>

      <section className='mt-8 surface-card rounded-xl p-6 ring-1 ring-slate-900/10'>
        <div className='flex items-start gap-4'>
          <span className='flexCenter h-11 w-11 rounded-full bg-primary text-secondary'><FiClock /></span>
          <div>
            <h2 className='bold-20'>Need more help?</h2>
            <p className='mt-1'>Contact our support team for order-specific questions or account assistance.</p>
            <Link to='/contact' className='btn-secondary mt-4 inline-block rounded-md'>Contact Us</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default FooterInfo
