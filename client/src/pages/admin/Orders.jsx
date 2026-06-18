import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ShopContext } from '../../context/ShopContext'
import toast from 'react-hot-toast'
import { FiSearch } from 'react-icons/fi'

const orderStatusOptions = [
  'Order Placed',
  'Packing',
  'Shipped',
  'Out for delivery',
  'Delivered',
  'Cancellation Requested',
  'Cancelled',
  'Return Requested',
  'Return Approved',
  'Return Rejected',
]

const Orders = () => {
  const {currency, axios} = useContext(ShopContext)
  const [orders, setOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [requestFilter, setRequestFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
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

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const queryTokens = query.split(/\s+/).filter(Boolean)
    const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      const customerName = `${order.address?.firstName ?? ''} ${order.address?.lastName ?? ''}`.trim()
      const registeredUser = typeof order.userId === 'object' && order.userId !== null ? order.userId : null
      const bookText = order.items?.map((item) => [
        item.product?.name,
        item.product?.author,
        item.product?.category,
        ...(item.product?.genres ?? []),
        ...(item.product?.subgenres ?? []),
        ...(item.product?.genrePaths ?? []),
      ].filter(Boolean).join(' ')).join(' ') ?? ''
      const searchText = [
        customerName,
        registeredUser?.name,
        registeredUser?.email,
        order.address?.phone,
        order.address?.email,
        order._id,
        bookText,
      ].filter(Boolean).join(' ').toLowerCase()

      if(queryTokens.length > 0 && !queryTokens.every((token) => searchText.includes(token))){
        return false
      }

      if(statusFilter !== 'all' && order.status !== statusFilter){
        return false
      }

      if(paymentFilter === 'done' && !isPaymentDone(order)){
        return false
      }

      if(paymentFilter === 'pending' && isPaymentDone(order)){
        return false
      }

      if(methodFilter !== 'all' && order.paymentMethod?.toLowerCase() !== methodFilter){
        return false
      }

      if(requestFilter === 'cancellation' && !order.cancelRequest?.requested && order.status !== 'Cancellation Requested'){
        return false
      }

      if(requestFilter === 'return' && order.returnRequest?.status !== 'Pending' && order.status !== 'Return Requested'){
        return false
      }

      if(requestFilter === 'none' && (order.cancelRequest?.requested || order.returnRequest?.status === 'Pending' || ['Cancellation Requested', 'Return Requested'].includes(order.status))){
        return false
      }

      if(fromDate && orderDate < fromDate){
        return false
      }

      if(toDate && orderDate > toDate){
        return false
      }

      return true
    })
  }, [dateFrom, dateTo, orders, paymentFilter, methodFilter, requestFilter, searchQuery, statusFilter])

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setMethodFilter('all')
    setRequestFilter('all')
    setDateFrom('')
    setDateTo('')
  }

  useEffect(()=>{
    fetchAllOrders()
  }, [fetchAllOrders])

  return (
    <div className='px-2 sm:px-6 py-12 m-2 h-[97vh] bg-primary overflow-y-scroll lg:w-4/5 rounded-xl'>
      <div className='mb-5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5'>
        <div className='grid gap-3 xl:grid-cols-[minmax(240px,1.5fr)_repeat(5,minmax(130px,1fr))_auto]'>
          <div className='flex items-center gap-2 rounded-lg bg-primary px-3 py-2 ring-1 ring-slate-900/10'>
            <FiSearch className='shrink-0 text-gray-500' />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              type='text'
              placeholder='Search customer or book...'
              className='w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-gray-500'
            />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className='rounded-lg bg-primary px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-900/10'>
            <option value='all'>All statuses</option>
            {orderStatusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className='rounded-lg bg-primary px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-900/10'>
            <option value='all'>All payments</option>
            <option value='done'>Payment done</option>
            <option value='pending'>Payment pending</option>
          </select>
          <select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)} className='rounded-lg bg-primary px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-900/10'>
            <option value='all'>All methods</option>
            <option value='cod'>COD</option>
            <option value='stripe'>Stripe</option>
          </select>
          <select value={requestFilter} onChange={(event) => setRequestFilter(event.target.value)} className='rounded-lg bg-primary px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-900/10'>
            <option value='all'>All requests</option>
            <option value='cancellation'>Cancellation requests</option>
            <option value='return'>Return requests</option>
            <option value='none'>No active request</option>
          </select>
          <div className='grid grid-cols-2 gap-2'>
            <input value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} type='date' className='min-w-0 rounded-lg bg-primary px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-900/10' aria-label='Filter orders from date' />
            <input value={dateTo} onChange={(event) => setDateTo(event.target.value)} type='date' className='min-w-0 rounded-lg bg-primary px-3 py-2 text-sm font-semibold outline-none ring-1 ring-slate-900/10' aria-label='Filter orders to date' />
          </div>
          <button type='button' onClick={resetFilters} className='rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90'>
            Reset
          </button>
        </div>
        <p className='mt-3 text-sm text-gray-500'>Showing {filteredOrders.length} of {orders.length} orders</p>
      </div>

      {filteredOrders.length === 0 ? (
        <div className='rounded-xl bg-white p-6 text-center font-semibold shadow-sm ring-1 ring-slate-900/5'>No orders matched your filters.</div>
      ) : filteredOrders.map((order)=> (
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
