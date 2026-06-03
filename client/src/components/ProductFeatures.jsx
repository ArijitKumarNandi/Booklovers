import React from 'react'
import { TbArrowBackUp, TbTruckDelivery } from 'react-icons/tb'
import { RiSecurePaymentLine } from "react-icons/ri"

const ProductFeatures = () => {
  return (
    <div className='mt-12 bg-primary rounded-lg'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 rounded-xl'>
        <div className='flexCenter gap-x-4 p-2 rounded-3xl'>
          <div className='text-3xl'><TbArrowBackUp className='mb-3 text-yellow-500' /></div>
          <div>
            <h4 className="h4 capitalize">Easy Return</h4>
            <p>Changed your mind? Request a return within 7 days of delivery and we will help you through the process.</p>
          </div>
        </div>
        <div className='flexCenter gap-x-4 p-2 rounded-3xl'>
          <div className='text-3xl'><TbTruckDelivery className='mb-3 text-red-500' /></div>
          <div>
            <h4 className="h4 capitalize">Fast Delivery</h4>
            <p>Your books are packed carefully and dispatched quickly, with order tracking available after shipment.</p>
          </div>
        </div>
        <div className='flexCenter gap-x-4 p-2 rounded-3xl'>
          <div className='text-3xl'><RiSecurePaymentLine className="mb-3 text-blue-500"/></div>
          <div>
            <h4 className="h4 capitalize">Secure Payment</h4>
            <p>Checkout securely with protected payment options, or choose cash on delivery for added convenience.</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProductFeatures
