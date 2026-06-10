import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'
import logoImg from '../assets/logo.png';
import userImg from '../assets/user.png';
import {FaBars, FaBarsStaggered} from "react-icons/fa6";
import {FaSearch} from "react-icons/fa";
import {RiUserLine} from "react-icons/ri";
import { FiBell, FiBox, FiHeart, FiLogOut, FiStar, FiUser } from 'react-icons/fi'
import Navbar from "./Navbar";
import { ShopContext } from '../context/ShopContext';
import ThemeSelector from './ThemeSelector';

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const {navigate, user, searchQuery, setSearchQuery, getCartCount, setShowUserLogin, logoutUser} = useContext(ShopContext)
  const isShopPage = useLocation().pathname.endsWith("/shop")

  const toggleMenu = ()=> setMenuOpened(prev=> !prev)

  const closeUserMenu = () => setUserMenuOpen(false)

  const navigateFromUserMenu = (path) => {
    navigate(path)
    closeUserMenu()
  }

  const logoutFromUserMenu = async () => {
    closeUserMenu()
    await logoutUser()
  }

  useEffect(()=>{
    if(searchQuery.length > 0 && !isShopPage){
      navigate('/shop')
    }
  }, [isShopPage, navigate, searchQuery]) // Navigate to shop page on search query change, only if not already on shop page

  useEffect(()=>{
    if(!userMenuOpen) return

    const handlePointerDown = (event) => {
      if(userMenuRef.current && !userMenuRef.current.contains(event.target)){
        closeUserMenu()
      }
    }

    const handleKeyDown = (event) => {
      if(event.key === "Escape"){
        closeUserMenu()
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [userMenuOpen])

  return (
    <header className="absolute top-0 left-0 right-0 max-padd-container flexBetween gap-4 py-2">
      {/* LOGO */}
      <div className="flex flex-1">
        <Link to={'/'} className="bold-22 xl:bold-28 flex items-end gap-1">
        <img src={logoImg} alt="" className="hidden sm:block h-9"/>
        <div className="sm:relative top-1.5">Booklovers<span className="text-secondary">a.</span></div>
        </Link>
      </div>
      {/* NAVBAR FOR MOBILE AND DESKTOP */}
      <div className={`flex-1 flex justify-center transition-transform duration-300 ${showSearch ? "xl:-translate-x-14" : ""}`}>
        <Navbar setMenuOpened={setMenuOpened} containerStyles={`${menuOpened ? "flex items-start flex-col gap-y-8 fixed top-16 right-6 p-5 bg-white rounded-xl shadow-md w-52 ring-1 ring-slate-900/5 z-50" : "hidden lg:flex gap-x-1.5 xl:gap-x-2.5 ring-1 ring-slate-900/15 rounded-full p-1 bg-primary"}`} />
      </div>
      <div className="flex sm:flex-1 items-center sm:justify-end gap-x-4 xl:gap-x-5">
        <div className="flex items-center gap-x-3 xl:gap-x-4">
          <ThemeSelector />
          {/* SEARCHBAR */}
          <div className={`relative hidden xl:flex h-10 items-center transition-all duration-300 ease-in-out ${showSearch ? "w-[230px]" : "w-10"}`}>
            {/*Toggle input*/}
            <div className={`absolute right-0 bg-white ring-1 ring-slate-900/10 rounded-full overflow-hidden transition-all duration-300 ease-in-out ${showSearch ? "w-[230px] opacity-100 py-2 pl-3 pr-12" : "w-10 opacity-0 p-0"}`}>
              <input onChange={(e)=> setSearchQuery(e.target.value)} type="text" placeholder="Search book..." className="bg-transparent w-full text-sm outline-none placeholder:text-gray-400"/>
            </div>
            {/* Toggle button */}
            <div onClick={()=>setShowSearch(prev=>!prev)} className="absolute right-0 top-0 flexCenter h-10 w-10 bg-primary rounded-full cursor-pointer z-10">
              <FaSearch className="text-lg"/>
            </div>
          </div>
        </div>
        {/* MENU TOGGLE */}
        <>
        {menuOpened ? (
          <FaBarsStaggered onClick={toggleMenu} className="lg:hidden cursor-pointer text-xl"/>
        ) : (
          <FaBars onClick={toggleMenu} className="lg:hidden cursor-pointer text-xl"/>
        )}
        </>
        {/* CART */}
        <Link to={'/cart'} className="relative flex shrink-0 items-center gap-2">
        <div className="bold-16">
          Cart
        </div>
        <span className="bg-secondary text-white text-[12px] font-semibold absolute -top-3.5 -right-2 flexCenter w-4 h-4 rounded-full shadow-md">{getCartCount()}</span>
        </Link>
        {/* USER PROFILE */}
        <div ref={userMenuRef} className="relative shrink-0">
          <div className="shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() => setUserMenuOpen(prev => !prev)}
                className="surface-card flex gap-2 items-center cursor-pointer rounded-full"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label="Open user menu"
              >
                <img src={user.avatar || userImg} alt="userImg" className="h-11 w-11 max-w-none shrink-0 rounded-full object-cover"/>
              </button>

            ) : (
              <button onClick={()=>setShowUserLogin(true)} className="btn-light flexCenter gap-x-2">Login <RiUserLine className="text-xl"/></button>
            )}
          </div>
          {/* DROPDOWN */}
          {user && userMenuOpen &&
          (<ul className="surface-card absolute right-0 top-12 z-50 flex w-56 flex-col rounded-xl p-2 medium-14 shadow-xl ring-1 ring-slate-900/10" role="menu">
            <li className='border-b border-[var(--theme-border)] px-3 py-2'>
              <p className='medium-14 !text-inherit line-clamp-1'>{user.name}</p>
              <p className='text-xs line-clamp-1'>{user.email}</p>
            </li>
            <li onClick={()=>navigateFromUserMenu('/profile')} className="flex items-center gap-3 rounded-lg p-3 hover:bg-primary cursor-pointer" role="menuitem"><FiUser />Profile</li>
            <li onClick={()=>navigateFromUserMenu('/my-orders')} className="flex items-center gap-3 rounded-lg p-3 hover:bg-primary cursor-pointer" role="menuitem"><FiBox />Orders</li>
            <li onClick={()=>navigateFromUserMenu('/my-reviews')} className="flex items-center gap-3 rounded-lg p-3 hover:bg-primary cursor-pointer" role="menuitem"><FiStar />My Reviews</li>
            <li onClick={()=>navigateFromUserMenu('/wishlist')} className="flex items-center gap-3 rounded-lg p-3 hover:bg-primary cursor-pointer" role="menuitem"><FiHeart />Wishlists</li>
            <li onClick={()=>navigateFromUserMenu('/notifications')} className="flex items-center gap-3 rounded-lg p-3 hover:bg-primary cursor-pointer" role="menuitem"><FiBell />Notifications</li>
            <li onClick={logoutFromUserMenu} className="flex items-center gap-3 rounded-lg p-3 text-red-500 hover:bg-red-50 cursor-pointer" role="menuitem"><FiLogOut />Logout</li>
          </ul>)
          }
        </div>
      </div>
    </header>
  );
};

export default Header
