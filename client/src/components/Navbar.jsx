import React from 'react'
import { TbBrandBlogger, TbHome } from "react-icons/tb"
import { IoLibraryOutline, IoSparklesOutline } from "react-icons/io5"
import { PiEnvelopeDuotone } from "react-icons/pi"
import { NavLink } from 'react-router-dom'
const Navbar = ({containerStyles, setMenuOpened}) => {
  const navItems = [
    {to: "/", label: "Home", icon: <TbHome />},
    {to: "/shop", label: "Shop", icon: <IoLibraryOutline />},
    {to: "/recommendations", label: "Recommend", icon: <IoSparklesOutline />},
    {to: "/blog", label: "Blog", icon: <TbBrandBlogger />},
    {to: "/contact", label: "Contact", icon: <PiEnvelopeDuotone />},
  ]
  return (
    <nav className={containerStyles}>
      {navItems.map(({to, label, icon})=>(
        <div key={label}>
          <NavLink onClick={()=>setMenuOpened(false)} to={to} className={({isActive})=>`${isActive ? "surface-card ring-1 ring-slate-900/10" : ""} flexCenter gap-x-2 lg:gap-x-1.5 px-3 lg:px-3 py-1.5 lg:py-1.5 rounded-full`} >
            <span className='text-xl'>{icon}</span>
            <span className='medium-16 lg:medium-15 xl:medium-16'>{label}</span>
          </NavLink>

        </div>
      ))}

    </nav>
  )
}

export default Navbar
