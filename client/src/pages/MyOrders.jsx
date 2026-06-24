import React, { useCallback, useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiPackage, FiRefreshCw, FiX } from 'react-icons/fi'

const MyOrders = () => {
  const {currency, user, axios} = useContext(ShopContext)
  const [orders, setOrders] = useState([])
  const [requestModal, setRequestModal] = useState(null)
  const [requestReason, setRequestReason] = useState('')
  const [submittingRequest, setSubmittingRequest] = useState(false)

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

  const canCancelOrder = (order) => ['Order Placed', 'Packing'].includes(order.status)
  const canReturnOrder = (order) => order.status === 'Delivered'
  const isPaymentDone = (order) => order.isPaid || order.status === 'Delivered' || order.status === 'Return Requested' || order.status === 'Return Approved' || order.status === 'Return Rejected'

  const openRequestModal = (order, type) => {
    setRequestModal({order, type})
    setRequestReason('')
  }

  const submitOrderRequest = async () => {
    if(!requestModal) return

    const reason = requestReason.trim()
    if(!reason){
      toast.error('Please enter a reason')
      return
    }

    setSubmittingRequest(true)
    try {
      const endpoint = requestModal.type === 'cancel' ? '/api/order/cancel-request' : '/api/order/return-request'
      const {data} = await axios.post(endpoint, {
        orderId: requestModal.order._id,
        reason,
      })

      if(data.success){
        toast.success(data.message)
        setRequestModal(null)
        setRequestReason('')
        await loadOrderData()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmittingRequest(false)
    }
  }

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
            {order.items.map((item,index)=>{
              const product = item.product
              const image = item.snapshot?.image || product?.image?.[0]
              const name = item.snapshot?.name || product?.name || 'Book unavailable'
              const price = item.snapshot?.offerPrice ?? product?.offerPrice ?? 0

              return (
              <div key={index} className='flex gap-x-3 rounded-xl bg-white p-3 ring-1 ring-slate-900/5'>
                <div className='flexCenter rounded-lg overflow-hidden bg-primary'>
                  {image ? (
                    <img src={image} alt={name} className='h-20 w-16 object-contain' />
                  ) : (
                    <div className='flex h-20 w-16 items-center justify-center text-xs font-semibold text-gray-500'>No image</div>
                  )}
                </div>
                <div className='w-full block'>
                  <h5 className='h5 capitalize line-clamp-1'>{name}</h5>
                  <div className='flex flex-wrap gap-3 max-sm:gap-y-1 mt-1'>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='medium-14'>Price:</h5>
                      <p>{currency}{price}</p>
                    </div>
                    <div className='flex items-center gap-x-2'>
                      <h5 className='medium-14'>Quantity:</h5>
                      <p>{item.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
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
            <div className='flex gap-3'>
              <div className='flex items-center gap-x-2'>
                <h5 className='medium-14'>Status:</h5>
                <div className='flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-slate-900/5'>
                  <span className='min-w-2 h-2 rounded-full bg-green-500' />
                  <p>{order.status}</p>

                </div>
              </div>
              <button onClick={loadOrderData} className='btn-secondary !py-2 !px-4 !text-xs !rounded-full'>Track Order</button>
              {canCancelOrder(order) && (
                <button onClick={() => openRequestModal(order, 'cancel')} className='rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700'>
                  Cancel Order
                </button>
              )}
              {canReturnOrder(order) && (
                <button onClick={() => openRequestModal(order, 'return')} className='rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-gray-900 shadow-sm transition hover:bg-amber-300'>
                  Request Return
                </button>
              )}
            </div>
          </div>
          {order.cancelRequest?.reason && (
            <div className='mt-4 rounded-xl bg-white p-3 ring-1 ring-slate-900/5'>
              <h4 className='bold-14'>Cancellation Request</h4>
              <p className='mt-1'>{order.cancelRequest.reason}</p>
              {order.cancelRequest.adminNote && <p className='mt-1'>Admin note: {order.cancelRequest.adminNote}</p>}
            </div>
          )}
          {order.returnRequest?.reason && (
            <div className='mt-4 rounded-xl bg-white p-3 ring-1 ring-slate-900/5'>
              <h4 className='bold-14'>Return Request ({order.returnRequest.status})</h4>
              <p className='mt-1'>{order.returnRequest.reason}</p>
              {order.returnRequest.adminNote && <p className='mt-1'>Admin note: {order.returnRequest.adminNote}</p>}
            </div>
          )}
        </div>
      ))}
      {requestModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
          <div className='w-full max-w-md rounded-2xl bg-white p-5 shadow-xl'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='bold-22'>{requestModal.type === 'cancel' ? 'Cancel Order' : 'Request Return'}</h2>
                <p className='mt-1'>Tell us the reason so admin can review your request.</p>
              </div>
              <button onClick={() => setRequestModal(null)} className='flexCenter h-9 w-9 rounded-full bg-primary text-lg'>
                <FiX />
              </button>
            </div>
            <textarea
              value={requestReason}
              onChange={(event) => setRequestReason(event.target.value)}
              rows={4}
              placeholder='Write your reason...'
              className='mt-4 w-full rounded-xl bg-primary p-3 outline-none ring-1 ring-slate-900/10'
            />
            <div className='mt-4 flex justify-end gap-3'>
              <button onClick={() => setRequestModal(null)} className='btn-light !rounded-xl'>Close</button>
              <button onClick={submitOrderRequest} disabled={submittingRequest} className='btn-secondary !rounded-xl disabled:cursor-not-allowed disabled:opacity-60'>
                {submittingRequest ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrders
