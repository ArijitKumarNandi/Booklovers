import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { FaBoxOpen, FaChartLine, FaShoppingBag, FaTruck, FaUsers } from 'react-icons/fa'
import { MdDeliveryDining, MdLocalShipping, MdOutlineDoneAll, MdRateReview } from 'react-icons/md'
import { ShopContext } from '../../context/ShopContext'

const emptyDashboard = {
  thisMonthRevenue: 0,
  totalUsers: 0,
  allTimeRevenue: 0,
  totalOrdersThisMonth: 0,
  totalProducts: 0,
  newCustomersThisMonth: 0,
  revenueGrowthRate: 0,
  orderStatus: {
    shipped: 0,
    outForDelivery: 0,
    delivered: 0,
  },
  monthlySales: [],
  topProducts: [],
  recentActivities: [],
}

const Dashboard = () => {
  const { axios, currency } = useContext(ShopContext)
  const [dashboard, setDashboard] = useState(emptyDashboard)
  const [loading, setLoading] = useState(true)

  const money = useMemo(() => new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }), [])

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/admin/dashboard')
      if (data.success) {
        setDashboard(data.dashboard)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [axios])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const maxRevenue = Math.max(...dashboard.monthlySales.map((item) => item.revenue), 1)
  const linePoints = dashboard.monthlySales.map((item, index) => {
    const x = dashboard.monthlySales.length === 1 ? 260 : 64 + (index * (372 / (dashboard.monthlySales.length - 1)))
    const y = 178 - ((item.revenue / maxRevenue) * 146)
    return `${x},${y}`
  }).join(' ')

  const statusTotal = Math.max(
    dashboard.orderStatus.shipped + dashboard.orderStatus.outForDelivery + dashboard.orderStatus.delivered,
    1
  )
  const shippedPercent = (dashboard.orderStatus.shipped / statusTotal) * 100
  const outPercent = (dashboard.orderStatus.outForDelivery / statusTotal) * 100
  const deliveredPercent = (dashboard.orderStatus.delivered / statusTotal) * 100
  const donutBackground = `conic-gradient(#0ea5e9 0 ${shippedPercent}%, #facc15 ${shippedPercent}% ${shippedPercent + outPercent}%, #22c55e ${shippedPercent + outPercent}% ${shippedPercent + outPercent + deliveredPercent}%, #e5e7eb 0)`
  const bestProduct = dashboard.topProducts[0]
  const statCards = [
    { label: "This Month's Revenue", value: `${currency}${money.format(dashboard.thisMonthRevenue)}`, icon: <FaChartLine />, tone: 'text-emerald-600', accent: '#10b981', bg: 'linear-gradient(135deg, rgba(16,185,129,0.16), var(--theme-surface) 58%)' },
    { label: 'Total Users', value: dashboard.totalUsers, icon: <FaUsers />, tone: 'text-blue-600', accent: '#2563eb', bg: 'linear-gradient(135deg, rgba(37,99,235,0.16), var(--theme-surface) 58%)' },
    { label: 'All Time Revenue', value: `${currency}${money.format(dashboard.allTimeRevenue)}`, icon: <FaShoppingBag />, tone: 'text-secondary', accent: '#a855f7', bg: 'linear-gradient(135deg, rgba(168,85,247,0.18), var(--theme-surface) 58%)' },
  ]

  const statusItems = [
    { label: 'Shipped', value: dashboard.orderStatus.shipped, icon: <MdLocalShipping />, color: 'bg-sky-500', panel: 'bg-sky-500/10 text-sky-700' },
    { label: 'Out for delivery', value: dashboard.orderStatus.outForDelivery, icon: <MdDeliveryDining />, color: 'bg-yellow-400', panel: 'bg-amber-400/15 text-amber-700' },
    { label: 'Delivered', value: dashboard.orderStatus.delivered, icon: <MdOutlineDoneAll />, color: 'bg-green-500', panel: 'bg-emerald-500/10 text-emerald-700' },
  ]

  const getTimeAgo = (date) => {
    const seconds = Math.max(Math.floor((Date.now() - new Date(date).getTime()) / 1000), 0)
    const intervals = [
      { label: 'year', value: 31536000 },
      { label: 'month', value: 2592000 },
      { label: 'day', value: 86400 },
      { label: 'hour', value: 3600 },
      { label: 'minute', value: 60 },
    ]
    const interval = intervals.find((item) => seconds >= item.value)

    if(!interval) return 'Just now'

    const count = Math.floor(seconds / interval.value)
    return `${count} ${interval.label}${count === 1 ? '' : 's'} ago`
  }

  const recentActivities = dashboard.recentActivities ?? []

  return (
    <div className='m-2 h-[97vh] w-full overflow-y-scroll rounded-xl bg-primary px-3 py-8 sm:px-6 lg:w-4/5'>
      <div className='mb-6'>
        <p className='medium-14'>Admin Panel / Dashboard</p>
        <h1 className='bold-32 mt-3'>Dashboard</h1>
        <p className='mt-2 mb-3'>Check this month's sales, order status, and best-selling books.</p>
      </div>

      {loading ? (
        <div className='surface-card rounded-xl p-8'>Loading dashboard...</div>
      ) : (
        <div className='grid gap-5'>
          <div className='grid gap-4 lg:grid-cols-3'>
            {statCards.map((card) => (
              <div key={card.label} className='surface-card overflow-hidden rounded-xl p-5 shadow-sm ring-1 ring-slate-900/5' style={{ background: card.bg, borderTop: `4px solid ${card.accent}` }}>
                <div className='flex items-center justify-between gap-4'>
                  <div>
                    <p className='medium-14'>{card.label}</p>
                    <h2 className='bold-28 mt-2'>{card.value}</h2>
                  </div>
                  <span className={`flexCenter h-12 w-12 rounded-full bg-white/70 text-xl shadow-sm ${card.tone}`}>{card.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div className='grid gap-5 lg:grid-cols-2'>
            <section className='surface-card rounded-xl p-5 shadow-sm ring-1 ring-purple-500/15'>
              <div className='flex items-center gap-3'>
                <span className='h-8 w-1.5 rounded-full bg-secondary' />
                <h2 className='bold-18'>Monthly Sales</h2>
              </div>
              <div className='mt-4 overflow-hidden'>
                <svg viewBox='0 0 500 220' preserveAspectRatio='none' className='h-44 w-full'>
                  <line x1='64' y1='178' x2='436' y2='178' stroke='var(--theme-border)' strokeWidth='2' />
                  <line x1='64' y1='32' x2='64' y2='178' stroke='var(--theme-border)' strokeWidth='2' />
                  {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                    <g key={tick}>
                      <line x1='64' x2='436' y1={178 - tick * 146} y2={178 - tick * 146} stroke='var(--theme-border)' strokeDasharray='4 6' />
                      <text x='26' y={183 - tick * 146} className='fill-current text-[11px]'>{money.format(maxRevenue * tick)}</text>
                    </g>
                  ))}
                  {linePoints && <polyline points={linePoints} fill='none' stroke='var(--color-secondary)' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />}
                  {dashboard.monthlySales.map((item, index) => {
                    const x = dashboard.monthlySales.length === 1 ? 260 : 64 + (index * (372 / (dashboard.monthlySales.length - 1)))
                    const y = 178 - ((item.revenue / maxRevenue) * 146)
                    return (
                      <g key={item.label}>
                        <circle cx={x} cy={y} r='5' fill='var(--theme-surface)' stroke='var(--color-secondary)' strokeWidth='3' />
                        <text x={x} y='205' textAnchor='middle' className='fill-current text-[10px]'>{item.label}</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </section>

            <section className='surface-card rounded-xl p-4 shadow-sm ring-1 ring-emerald-500/15'>
              <div className='flex items-center gap-3'>
                <span className='h-8 w-1.5 rounded-full bg-emerald-500' />
                <h2 className='bold-18'>Order Status</h2>
              </div>
              <div className='mt-4 flex flex-col items-center gap-8 sm:flex-row sm:justify-center'>
                <div className='relative h-32 w-32 shrink-0 rounded-full' style={{ background: donutBackground }}>
                  <div className='absolute inset-8 rounded-full bg-[var(--theme-surface)]' />
                </div>
                <div className='flex items-center gap-10'>
                  <div className='-ml-4'>
                    <div className='bold-36 leading-none'>{statusTotal === 1 && shippedPercent === 0 && outPercent === 0 && deliveredPercent === 0 ? 0 : statusTotal}</div>
                    <div className='medium-14'>orders</div>
                  </div>
                  <div className='grid gap-3'>
                    {statusItems.map((item) => (
                      <div key={item.label} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${item.panel}`}>
                        <span className={`h-3 w-3 rounded-full ${item.color}`} />
                        <span className='text-lg'>{item.icon}</span>
                        <span className='medium-14 min-w-28'>{item.label}</span>
                        <span className='bold-16'>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className='surface-card rounded-xl p-5 shadow-sm ring-1 ring-amber-500/15'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <span className='h-8 w-1.5 rounded-full bg-amber-500' />
                <h2 className='bold-18'>Recent Activities</h2>
              </div>
              <span className='rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white'>Live</span>
            </div>
            <div className='mt-5 grid gap-3'>
              {recentActivities.length === 0 ? (
                <p>No recent orders or reviews yet.</p>
              ) : recentActivities.map((activity) => (
                <Link
                  key={`${activity.type}-${activity.id}`}
                  to={activity.to}
                  className='grid items-center gap-4 rounded-xl border border-transparent px-4 py-3 transition hover:border-[var(--theme-border)] hover:bg-primary/70 sm:grid-cols-[48px_minmax(0,1fr)_96px]'
                >
                  <span className={`flexCenter h-11 w-11 rounded-full text-lg ${activity.type === 'Order' ? 'bg-orange-100 text-orange-600' : 'bg-violet-100 text-violet-600'}`}>
                    {activity.type === 'Order' ? <FaShoppingBag /> : <MdRateReview />}
                  </span>
                  <span className='min-w-0'>
                    <span className='block font-semibold text-[var(--theme-text)]'>
                      {activity.user} <span className='font-normal'>{activity.action}</span>
                    </span>
                    <span className='mt-1 block text-sm text-gray-50'>{getTimeAgo(activity.createdAt)}</span>
                  </span>
                  <span className={`justify-self-start rounded-full px-3 py-1 text-sm font-semibold sm:justify-self-end ${activity.type === 'Order' ? 'bg-orange-500/15 text-orange-600' : 'bg-secondary/15 text-secondary'}`}>
                    {activity.type}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <div className='grid gap-5 xl:grid-cols-[1.6fr_0.9fr]'>
            <section className='surface-card rounded-xl p-5 shadow-sm ring-1 ring-sky-500/15'>
              <div className='flex items-center gap-3'>
                <span className='h-8 w-1.5 rounded-full bg-sky-500' />
                <h2 className='bold-18'>Top Products</h2>
              </div>
              <p className='mt-1'>Products having most sales</p>
              <div className='mt-5 overflow-x-auto'>
                <div className='min-w-[760px]'>
                  <div className='grid items-center rounded-lg px-4 py-3 bold-14' style={{ gridTemplateColumns: '96px minmax(0, 1fr) 180px 120px', background: 'linear-gradient(90deg, rgba(14,165,233,0.16), rgba(34,197,94,0.12))' }}>
                    <span>Image</span>
                    <span>Title</span>
                    <span>Genre</span>
                    <span>Total Sold</span>
                  </div>
                  {dashboard.topProducts.length === 0 ? (
                    <div className='p-4'>No products sold yet.</div>
                  ) : dashboard.topProducts.map((product) => (
                    <div key={product.id} className='grid items-center border-b border-[var(--theme-border)] px-4 py-3' style={{ gridTemplateColumns: '96px minmax(0, 1fr) 180px 120px' }}>
                      <img src={product.image} alt={product.title} className='h-12 w-12 rounded-lg bg-primary object-cover' />
                      <span className='medium-14 line-clamp-1'>{product.title}</span>
                      <span>{product.genre}</span>
                      <span className='bold-15'>{product.totalSold}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className='surface-card rounded-xl p-5 shadow-sm ring-1 ring-violet-500/15'>
              <div className='flex items-center gap-3'>
                <span className='h-8 w-1.5 rounded-full bg-violet-500' />
                <h2 className='bold-18'>Summary</h2>
              </div>
              <p className='mt-1'>Summary of key metrics for the current month</p>
              <div className='mt-5 grid gap-5'>
                <div className='flex items-start gap-3'>
                  <span className='flexCenter h-10 w-10 rounded-full bg-primary text-emerald-600'><FaChartLine /></span>
                  <div>
                    <h3 className='bold-15'>Total Sales This Month</h3>
                    <p>This month's sales: {currency}{money.format(dashboard.thisMonthRevenue)}</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <span className='flexCenter h-10 w-10 rounded-full bg-primary text-blue-600'><FaBoxOpen /></span>
                  <div>
                    <h3 className='bold-15'>Total Orders Placed</h3>
                    <p>Total orders placed: {dashboard.totalOrdersThisMonth}</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <span className='flexCenter h-10 w-10 rounded-full bg-primary text-secondary'><FaTruck /></span>
                  <div>
                    <h3 className='bold-15'>Top Selling Product</h3>
                    <p>{bestProduct ? `${bestProduct.title} (${bestProduct.totalSold} sold)` : 'No sales yet'}</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <span className='flexCenter h-10 w-10 rounded-full bg-primary text-purple-600'><FaChartLine /></span>
                  <div>
                    <h3 className='bold-15'>Revenue Growth Rate</h3>
                    <p>Revenue {dashboard.revenueGrowthRate >= 0 ? 'up' : 'down'} by {Math.abs(dashboard.revenueGrowthRate).toFixed(1)}% compared to last month</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <span className='flexCenter h-10 w-10 rounded-full bg-primary text-amber-600'><FaUsers /></span>
                  <div>
                    <h3 className='bold-15'>New Customers This Month</h3>
                    <p>New customers joined: {dashboard.newCustomersThisMonth}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
