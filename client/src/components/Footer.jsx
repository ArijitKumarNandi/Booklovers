import React from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/logo.png' // Update path if needed

const Footer = () => {
  const linkSections = [
    {
      title: 'Quick Links',
      links: [
        { label: 'Home', to: '/' },
        { label: 'Best Sellers', to: '/info/best-sellers' },
        { label: 'Offers & Deals', to: '/info/offers-deals' },
        { label: 'Contact Us', to: '/contact' },
        { label: 'FAQs', to: '/faqs' },
      ],
    },
    {
      title: 'Need Help?',
      links: [
        { label: 'Delivery Information', to: '/info/delivery-information' },
        { label: 'Return & Refund Policy', to: '/info/return-refund-policy' },
        { label: 'Payment Methods', to: '/info/payment-methods' },
        { label: 'Track your Order', to: '/info/track-your-order' },
        { label: 'Contact Us', to: '/contact' },
      ],
    },
    {
      title: 'Follow Us',
      links: [
        { label: 'Instagram', href: 'https://www.instagram.com' },
        { label: 'Twitter', href: 'https://twitter.com' },
        { label: 'Facebook', href: 'https://www.facebook.com' },
        { label: 'Youtube', href: 'https://www.youtube.com' },
      ],
    },
  ];
  return (
    <footer className='theme-footer max-padd-container'>
      <div className='flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30'>
        <div>
          {/* LOGO */}
          <div className='flex flex-1'>
            <Link to={"/"} className="bold-22 xl:bold-28 flex items-end gap-1">
              <img src={logoImg} alt="" className='h-9' />
              <div className='relative top-1.5'>
                Booklovers<span className='text-secondary'>a.</span>
              </div>

            </Link>

          </div>
          <p className='max-w-[410px] mt-6'>
            At Booklovers, we are passionate about connecting readers with the perfect books. Our mission is to provide a seamless and enjoyable shopping experience, offering a wide selection of titles, competitive prices, and exceptional customer service. Whether you're a casual reader or a book enthusiast, we strive to be your go-to destination for all things literary.
          </p>
        </div>
        <div className='flex flex-wrap justify-between w-full md:w-[45%] gap-5'>
          {linkSections.map((section, index) => (
            <div key={index}>
              <h3 className='font-semibold text-base md:mb-5 mb-2'>
                {section.title}
              </h3>
              <ul className='text-sm space-y-2'>
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a href={link.href} target='_blank' rel='noreferrer' className='hover:underline transition'>
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to} className='hover:underline transition'>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
    
      </div>
      <p className='py-4 text-center'>
        Copyright 2026 Booklovers. All rights reserved.
      </p>
      
    </footer>
  );
};

export default Footer
