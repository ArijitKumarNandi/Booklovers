import React, { useCallback, useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiPackage, FiRefreshCw } from 'react-icons/fi'

const MyOrders = () => {
  const {currency, user, axios} = useContext(ShopContext)
  const [orders, setOrders] = useState([])

  const loadOrderData = useCallback(async ()=>{
    if(!user) return
    try {
      const {data} = await axios.post("/api/order/userorders")
      if(data.success){
        setOrders(data.orders)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios, user])

  useEffect(()=>{
    loadOrderData()
  },[loadOrderData])

  return (
    <div className='max-padd-container py-16 pt-28'>
      <div className='mb-8 flex flex-col gap-3'>
        <p className='medium-14 text-secondary'>Account / Orders</p>
        <h1 className='bold-32 leading-tight'>My Orders</h1>
      </div>

      <div className='mb-6 grid gap-5 rounded-xl bg-primary p-5 shadow-sm ring-1 ring-slate-900/5 md:grid-cols-[1fr_auto] md:items-center lg:p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
          <span className='flexCenter h-16 w-16 rounded-full bg-white text-3xl text-secondary shadow-sm ring-1 ring-slate-900/5'>
            <FiPackage />
          </span>
          <div>
            <h2 className='bold-28'>Order History</h2>
            <p className='mt-1'>Track your purchases, payment details, and delivery progress.</p>
          </div>
        </div>
        <button onClick={loadOrderData} className='btn-secondary flexCenter gap-2 !rounded-xl'>
          <FiRefreshCw />
          Refresh Orders
        </button>
      </div>
      {orders?.map((order)=> (
        <div key={order._id} className='bg-primary p-4 mt-4 rounded-2xl shadow-sm ring-1 ring-slate-900/5'>
          {/* BOOK LIST */}
          <div className='grid gap-4 mb-4 md:grid-cols-2 xl:grid-cols-3'>
            {order.items.map((item,index)=>(
              <div key={index} className='flex gap-x-3 rounded-xl bg-white p-3 ring-1 ring-slate-900/5'>
                <div className='flexCenter rounded-lg overflow-hidden bg-primary'>
                  <img src={item.product.image[0]} alt="orderImg" className='h-20 w-16 object-contain' />
                </div>
                <div className='w-full block'>
                  <h5 className='h5 capitalize line-clamp-1'>{item.product.name}</h5>
                  <div className='flex flex-wrap gap-3 max-sm:gap-y-1 mt-1'>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='medium-14'>Price:</h5>
                      <p>{currency}{item.product.offerPrice}</p>
                    </div>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='medium-14'>Quantity:</h5>
                      <p>{item.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-t border-[var(--theme-border)] pt-4'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-x-2'>
                <h5 className='medium-14'>OrderId:</h5>
                <p className='text-gray-400 text-xs break-all'>{order._id}</p>
              </div>
              <div className='flex gap-4'>
                <div className='flex items-center gap-x-2'>
                  <h5 className='medium-14'>Payment Status:</h5>
                  <p>{order.isPaid ? "Done" : "Pending"}</p>
                  <div className='flex items-center gap-x-2'>
                    <h5 className='medium-14'>Method:</h5>
                    <p className='text-gray-400 text-sm'>{order.paymentMethod}</p>
                  </div>
                </div>
              </div>
              <div className='flex gap-4'>
                <div className='flex items-center gap-x-2'>
                  <h5 className='medium-14'>Date:</h5>
                  <p className='text-gray-400 text-sm'>{new Date(order.createdAt).toDateString()}</p>
                </div>
                <div className='flex items-center gap-x-2'>
                  <h5 className='medium-14'>Amount:</h5>
                  <p className='text-gray-400 text-sm'>{currency}{order.amount}</p>
                </div>
              </div>
            </div>
            <div className='flex gap-3'>
              <div className='flex items-center gap-x-2'>
                <h5 className='medium-14'>Status:</h5>
                <div className='flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-900/5'>
                  <span className='min-w-2 h-2 rounded-full bg-green-500' />
                  <p>{order.status}</p>

                </div>
              </div>
              <button onClick={loadOrderData} className='btn-secondary !py-2 !px-4 !text-xs !rounded-full'>Track Order</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MyOrders
