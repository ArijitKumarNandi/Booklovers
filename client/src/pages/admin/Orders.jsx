import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ShopContext } from '../../context/ShopContext'
import toast from 'react-hot-toast'

const Orders = () => {
  const {currency, axios} = useContext(ShopContext)
  const [orders, setOrders] = useState([])
  const normalStatusFlow = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered']
  const lockedStatuses = ['Delivered', 'Cancelled', 'Return Approved', 'Return Rejected', 'Cancellation Requested', 'Return Requested']

  const fetchAllOrders = useCallback(async ()=>{
    try {
      const { data } = await axios.post("/api/order/list")
      if (data.success) {
        setOrders(data.orders)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios])

  const statusHandler = async (event, orderId)=>{
    try {
      const { data } = await axios.post("/api/order/status", {orderId, status:event.target.value})
      if (data.success) {
        await fetchAllOrders()
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const requestActionHandler = async (orderId, type, action)=>{
    try {
      const endpoint = type === 'cancel' ? '/api/order/cancel-action' : '/api/order/return-action'
      const {data} = await axios.post(endpoint, {orderId, action})
      if(data.success){
        toast.success(data.message)
        await fetchAllOrders()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getStatusOptions = (status) => {
    const currentIndex = normalStatusFlow.indexOf(status)
    if(currentIndex === -1) return [status]

    return normalStatusFlow.slice(currentIndex)
  }

  const isStatusLocked = (status) => lockedStatuses.includes(status)
  const isPaymentDone = (order) => order.isPaid || ['Delivered', 'Return Requested', 'Return Approved', 'Return Rejected'].includes(order.status)

  useEffect(()=>{
    fetchAllOrders()
  }, [fetchAllOrders])

  return (
    <div className='px-2 sm:px-6 py-12 m-2 h-[97vh] bg-primary overflow-y-scroll lg:w-4/5 rounded-xl'>
      {orders.map((order)=> (
        <div key={order._id} className='bg-white p-2 mt-3 rounded-lg'>
          {/* BOOK LIST */}
          <div className='flex flex-col lg:flex-row gap-4 mb-3'>
            {order.items.map((item,index)=>(
              <div key={index} className='flex gap-x-3'>
                <div className='flexCenter rounded-lg overflow-hidden'>
                  <img src={item.product.image[0]} alt="orderImg" className='max-h-20 max-w-32 aspect-square object-contain' />
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
          <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-t border-gray-300 pt-3'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center gap-x-2'>
                <h5 className='medium-14'>OrderId:</h5>
                <p className='text-gray-400 text-xs break-all'>{order._id}</p>
              </div>
              <div className='flex gap-4'>
                <div className='flex items-center gap-x-2'>
                  <h5 className='medium-14'>Customer:</h5>
                  <p className='text-xs'>{order.address.firstName} {order.address.lastName}</p>
                </div>
                <div className='flex items-center gap-x-2'>
                  <h5 className='medium-14'>Phone:</h5>
                  <p className='text-xs'>{order.address.phone}</p>
                </div>
              </div>
              <div className='flex items-center gap-x-2'>
                  <h5 className='medium-14'>Address:</h5>
                  <p className='text-xs'>{" "} {order.address.street}, {order.address.city},{" "} {order.address.state}, {order.address.country},{" "} {order.address.zipcode}</p>
              </div>
              <div className='flex gap-4'>
                <div className='flex items-center gap-x-2'>
                  <h5 className='medium-14'>Payment Status:</h5>
                  <p>{isPaymentDone(order) ? "Done" : "Pending"}</p>
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
            <div className='flex items-center gap-2'>
             <h5 className="medium-14">Status:</h5>
             <select
              onChange={(event)=>statusHandler(event, order._id)}
              value={order.status}
              disabled={isStatusLocked(order.status)}
              className='text-xs font-semibold p-1 ring-1 ring-slate-900/5 rounded max-w-40 bg-primary disabled:cursor-not-allowed disabled:opacity-70'
             >
              {getStatusOptions(order.status).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
             </select>
            </div>
          </div>
          {order.cancelRequest?.requested && (
            <div className='mt-3 rounded-xl bg-red-50 p-4 ring-1 ring-red-100'>
              <h4 className='bold-15 text-red-700'>Cancellation Requested</h4>
              <p className='mt-1 text-red-700'>{order.cancelRequest.reason}</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                <button onClick={() => requestActionHandler(order._id, 'cancel', 'approve')} className='rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700'>Approve Cancellation</button>
                <button onClick={() => requestActionHandler(order._id, 'cancel', 'reject')} className='rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition hover:bg-red-100'>Reject</button>
              </div>
            </div>
          )}
          {order.returnRequest?.status === 'Pending' && (
            <div className='mt-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100'>
              <h4 className='bold-15 text-amber-700'>Return Requested</h4>
              <p className='mt-1 text-amber-700'>{order.returnRequest.reason}</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                <button onClick={() => requestActionHandler(order._id, 'return', 'approve')} className='rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-amber-300'>Approve Return</button>
                <button onClick={() => requestActionHandler(order._id, 'return', 'reject')} className='rounded-md bg-white px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100'>Reject</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default Orders
