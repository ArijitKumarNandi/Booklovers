import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { FaMinus, FaPlus } from "react-icons/fa6"
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi'
import CartTotal from '../components/CartTotal'

const Cart = () => {
  const {books, currency, cartItems, updateQuantity} = useContext(ShopContext);

  return books && cartItems ? (
    <div className='max-padd-container py-16 pt-28'>
      <div className='flex flex-col xl:flex-row gap-20 xl:gap-28'>
        {/* LEFT SIDE */}
        <div className='flex flex-[2] flex-col gap-3'>
          <div className='pb-5'>
            <p className='medium-14 text-secondary'>Checkout / Cart</p>
            <div className='mt-2 flex items-center gap-3'>
              <span className='flexCenter h-12 w-12 rounded-full bg-primary text-2xl text-secondary'><FiShoppingBag /></span>
              <div>
                <h1 className='bold-32'>Cart Overview</h1>
                <p className='mt-1'>Check your selected books, update quantities, or remove items before checkout.</p>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-[6fr_1fr_2fr] text-base font-medium bg-primary p-3 rounded-xl shadow-sm ring-1 ring-slate-900/5'>
            <h5 className="h5 text-left">Product Details</h5>
            <h5 className="h5 text-center">Subtotal</h5>
            <h5 className="h5 text-center">Action</h5>
          </div>
          {books.map((book)=>{
            const quantity = cartItems[book._id]
            if(quantity > 0){
              return (
                <div key={book._id} className='grid grid-cols-[6fr_1fr_2fr] items-center bg-primary p-3 rounded-xl shadow-sm ring-1 ring-slate-900/5'>
                  <div className='flex items-center md:gap-6 gap-3'>
                    <div className='flex rounded-xl bg-white p-1 shadow-sm'>
                      <img src={book.image?.[0]} alt="bookImage" className='h-16 w-12 rounded-lg object-contain' />
                    </div>
                    <div>
                      <h5 className='h5 hidden sm:block line-clamp-1'>{book.name}</h5>
                      <div className='flexBetween mt-2'>
                        <div className='flex items-center ring-1 ring-slate-900/5 p-0.5 rounded-full overflow-hidden bg-white'>
                          <button onClick={()=>updateQuantity(book._id, quantity - 1)} className='p-1.5 bg-primary rounded-full cursor-pointer'>
                            <FaMinus className='text-xs' />
                          </button>
                          <p className='px-2'>{quantity}</p>
                          <button onClick={()=>updateQuantity(book._id, quantity + 1)} className='p-1.5 bg-primary rounded-full cursor-pointer'>
                            <FaPlus className='text-xs' />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className='text-center'>{currency}{book.offerPrice * quantity}</p>
                  <button onClick={()=>updateQuantity(book._id, 0)} className='flexCenter mx-auto h-10 w-10 rounded-full bg-white text-red-500 shadow-sm ring-1 ring-red-100'>
                    <FiTrash2 />
                  </button>
                </div>
              )
            }
            return null
          })}
        </div>
        {/* RIGHT SIDE */}
        <div className='flex flex-1 flex-col'>
          <div className='max-w-[410px] w-full bg-primary p-5 py-8 max-md:mt-16 rounded-2xl shadow-sm ring-1 ring-slate-900/5'>
            <CartTotal />
          </div>
        </div>
      </div>
    </div>
  ) : null
}

export default Cart
