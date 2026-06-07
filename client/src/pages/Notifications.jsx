import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FaBell, FaHeart, FaShoppingBag, FaStar } from 'react-icons/fa'
import { FaTruckFast } from 'react-icons/fa6'
import { MdRateReview } from 'react-icons/md'
import { ShopContext } from '../context/ShopContext'

const notificationIcon = {
  order_placed: <FaShoppingBag />,
  order_status: <FaTruckFast />,
  review_reply: <MdRateReview />,
  review_liked: <FaHeart />,
}

const notificationTone = {
  order_placed: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
  order_status: 'bg-sky-500/10 text-sky-600 ring-sky-500/20',
  review_reply: 'bg-secondary/10 text-secondary ring-secondary/20',
  review_liked: 'bg-red-500/10 text-red-500 ring-red-500/20',
}

const Notifications = () => {
  const { axios, user, navigate } = useContext(ShopContext)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const dateFormatter = useMemo(() => new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }), [])

  const fetchNotifications = useCallback(async () => {
    if(!user){
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      const { data } = await axios.get('/api/notification')
      if(data.success){
        setNotifications(data.notifications)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [axios, user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const openNotification = async (notification) => {
    try {
      await axios.patch(`/api/notification/${notification._id}/read`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      navigate(notification.targetPath)
    }
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <div className='max-padd-container py-16 pt-28'>
      <div className='mb-8 flex flex-col gap-3'>
        <p className='medium-14 text-secondary'>Account / Notifications</p>
        <h1 className='bold-32 leading-tight'>My Notifications</h1>
      </div>

      <div className='mb-6 grid gap-5 overflow-hidden rounded-xl bg-primary p-5 shadow-sm ring-1 ring-slate-900/5 md:grid-cols-[1fr_auto] md:items-center lg:p-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
          <span className='flexCenter h-16 w-16 rounded-full bg-white text-3xl text-secondary shadow-sm ring-1 ring-slate-900/5'>
            <FaBell />
          </span>
          <div>
            <h1 className='bold-28'>Notification Center</h1>
            <p className='mt-1'>Order updates, payment confirmations, and admin review activity stay here.</p>
            <div className='mt-4 flex flex-wrap gap-2'>
              <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Orders</span>
              <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Payments</span>
              <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Reviews</span>
              <span className='rounded-full bg-white px-3 py-1 medium-14 shadow-sm ring-1 ring-slate-900/5'>Admin replies</span>
            </div>
          </div>
        </div>
        <div className='grid min-w-[230px] grid-cols-2 gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5'>
          <div>
            <p className='medium-14'>Total</p>
            <h3 className='bold-24'>{notifications.length}</h3>
          </div>
          <div className='border-l border-[var(--theme-border)] pl-4'>
            <p className='medium-14'>Unread</p>
            <h3 className='bold-24'>{unreadCount}</h3>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='surface-card rounded-xl p-8 shadow-sm ring-1 ring-slate-900/5'>Loading notifications...</div>
      ) : !user ? (
        <div className='surface-card rounded-xl p-8 text-center shadow-sm ring-1 ring-slate-900/5'>
          <FaBell className='mx-auto mb-3 text-5xl text-secondary' />
          <h2 className='bold-22'>Login to view notifications</h2>
          <button onClick={() => navigate('/')} className='btn-secondary mt-5 !rounded-md'>Go Home</button>
        </div>
      ) : notifications.length === 0 ? (
        <div className='surface-card rounded-xl p-8 text-center shadow-sm ring-1 ring-slate-900/5'>
          <FaBell className='mx-auto mb-3 text-5xl text-secondary' />
          <h2 className='bold-22'>No notifications yet</h2>
          <p className='mt-2'>Your order and review updates will appear here.</p>
        </div>
      ) : (
        <div className='grid gap-3'>
          {notifications.map((notification) => (
            <button
              key={notification._id}
              onClick={() => openNotification(notification)}
              className={`surface-card grid w-full gap-4 rounded-xl p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center ${notification.isRead ? 'opacity-80' : 'ring-secondary/20'}`}
            >
              <span className={`flexCenter h-12 w-12 rounded-full text-xl ring-1 ${notificationTone[notification.type] ?? 'bg-primary text-secondary ring-secondary/20'}`}>
                {notificationIcon[notification.type] ?? <FaStar />}
              </span>
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h3 className='bold-16'>{notification.title}</h3>
                  {!notification.isRead && (
                    <span className='rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-white'>New</span>
                  )}
                </div>
                <p className='mt-1 text-[15px]'>{notification.message}</p>
              </div>
              <p className='text-right'>{dateFormatter.format(new Date(notification.createdAt))}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
