import React from 'react'
import { Link } from 'react-router-dom'
import logoImg from '../assets/logo.png' // Update path if needed

const Footer = () => {
  const linkSections = [
    {
      title: 'Quick Links',
      links: ['Home', 'Best Sellers', 'Offers & Deals', 'Contact Us', 'FAQs'],
    },
    {
      title: 'Need Help?',
      links: ['Delivery Information', 'Return & Refund Policy', 'Payment Methods', 'Track your Order', 'Contact Us'],
    },
    {
      title: 'Follow Us',
      links: ['Instagram', 'Twitter', 'Facebook', 'Youtube'],
    },
  ];
  return (
    <footer className='max-padd-container bg-gradient-to-l from-primary via-white to-primary'>
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
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className='hover:underline transition'>
                      {link}
                    </a>
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