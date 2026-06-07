import React, { useContext } from 'react'
import { ShopContext } from '../../context/ShopContext'
import { FaSquarePlus } from 'react-icons/fa6'
import { FaChartPie, FaListAlt, FaUsers } from 'react-icons/fa'
import { MdFactCheck } from "react-icons/md"
import { MdRateReview } from "react-icons/md"
import { BiLogOut } from "react-icons/bi"
import { Link, NavLink, Outlet } from 'react-router-dom'
import toast from 'react-hot-toast'

const Sidebar = () => {
  const {navigate, axios} = useContext(ShopContext)

  const navItems = [
    {path: "/admin", label: "Dashboard", icon: <FaChartPie />},
    {path: "/admin/add", label: "Add Product", icon: <FaSquarePlus />},
    {path: "/admin/list", label: "List", icon: <FaListAlt />},
    {path: "/admin/users", label: "Users", icon: <FaUsers />},
    {path: "/admin/orders", label: "Orders", icon: <MdFactCheck />},
    {path: "/admin/reviews", label: "Reviews", icon: <MdRateReview />},
  ];

  const logout = async ()=>{
    try {
        const {data} = await axios.post('/api/admin/logout')
        if(data.success){
            toast.success(data.message)
            navigate('/')
        }else{
            toast.error(data.message)
        }
    } catch (error) {
        toast.error(error.message)
    }
  }

  return (
    <div className='mx-auto max-w-[1440px] flex flex-col sm:flex-row'>
        {/* SIDEBAR */}
        <div className='max-sm:flexCenter max-sm:pb-3 bg-primary pb-3 m-2 sm:min-w-[20%] sm:min-h-[97vh] rounded-2xl shadow-sm ring-1 ring-slate-900/5'>
            <div className='flex h-full flex-col gap-y-6 max-sm:items-center sm:flex-col pt-4 sm:pt-12'>
                {/* LOGO */}
                <Link to={'/admin'} className='bold-20 md:bold-24 uppercase font-paci lg:pl-[15%]'>Bookloversa<span className='text-secondary bold-28'>.</span></Link>
                <p className='hidden px-6 text-xs uppercase tracking-[0.2em] text-gray-50 sm:block lg:pl-[15%]'>Admin workspace</p>
                <div className='flex sm:flex-col sm:gap-x-5 gap-y-3 sm:pt-6'>
                    {navItems.map((link)=>(
                        <NavLink key={link.label} to={link.path} end={link.path === "/admin"} className={({ isActive }) => isActive ? "mx-2 flexStart gap-x-3 rounded-xl bg-white p-4 lg:pl-10 medium-15 cursor-pointer text-secondary shadow-sm ring-1 ring-slate-900/5 max-sm:border-b-4 sm:border-r-4 border-secondary" : "mx-2 flexStart gap-x-3 rounded-xl p-4 lg:pl-10 medium-15 cursor-pointer transition hover:bg-white/70"}>
                            <span className='text-lg'>{link.icon}</span>
                            <div className="hidden sm:flex">{link.label}</div>
                        </NavLink>
                    ))}
                    <div className="max-sm:ml-5 sm:mt-auto sm:pt-28">
                        <button onClick={logout} className='mx-2 flexStart gap-x-3 rounded-xl p-4 lg:pl-10 medium-15 cursor-pointer text-red-500 transition hover:bg-red-50'>
                            <BiLogOut className='text-lg'/>
                            <div className="hidden sm:flex">Logout</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <Outlet />
    </div>
  )
}

export default Sidebar
