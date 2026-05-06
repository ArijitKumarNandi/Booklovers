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
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quisquam repellendus aliquam at nostrum commodi, ullam consequatur sunt cumque doloribus nihil maxime voluptates placeat sit nesciunt, iste necessitatibus voluptatibus ea quam.</p>
          </div>
        </div>
        <div className='flexCenter gap-x-4 p-2 rounded-3xl'>
          <div className='text-3xl'><TbTruckDelivery className='mb-3 text-red-500' /></div>
          <div>
            <h4 className="h4 capitalize">Fast Delivery</h4>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Pariatur cupiditate inventore, asperiores cumque provident eum harum illo? Corrupti quis, corporis modi tempora esse impedit eius sapiente odio minima, asperiores qui.</p>
          </div>
        </div>
        <div className='flexCenter gap-x-4 p-2 rounded-3xl'>
          <div className='text-3xl'><RiSecurePaymentLine className="mb-3 text-blue-500"/></div>
          <div>
            <h4 className="h4 capitalize">secure payment</h4>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eligendi illum ipsa inventore delectus, temporibus deserunt possimus amet, ab quae tempore pariatur exercitationem quia doloribus culpa explicabo omnis. Odio, atque nam.</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProductFeatures