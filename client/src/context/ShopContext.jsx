import React, { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import toast from "react-hot-toast"

axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL

export const ShopContext = createContext()

const ShopContextProvider = ({children}) => {
    
    const navigate = useNavigate()
    const [books, setBooks] = useState([])
    const [user, setUser] = useState('')
    const [searchQuery, setSearchQuery] = useState("")
    const currency = import.meta.env.VITE_CURRENCY
    const [cartItems, setCartItems] = useState({})
    const [wishlistItems, setWishlistItems] = useState([])
    const [method, setMethod] = useState("COD")
    const [showUserLogin, setShowUserLogin] = useState("")
    const delivery_charges = 10 // 10 Dollars
    const [isAdmin, setIsAdmin] = useState(false)

    // Fetch all books
    const fetchBooks = async ()=>{
        try {
          const {data} = await axios.get("/api/product/list")
          if(data.success){
            setBooks(data.products)
          }else{
            toast.error(data.message)
          }
        } catch (error) {
          toast.error(error.message)
        }
    }

    // Fetch User
    const fetchUser = async ()=>{
      try {
        const {data} = await axios.get('/api/user/is-auth')
        if(data.success){
          setUser(data.user)
          setCartItems(data.user.cartData)
          setWishlistItems((data.user.wishlist || []).map((item) => item.toString()))
        }else{
          setUser(null)
          setCartItems({})
          setWishlistItems([])
        }
      } catch (error) {
          setUser(null)
          setCartItems({})
          setWishlistItems([])
      }
    }

    // Fetch Admin
    const fetchAdmin = async ()=>{
      try {
        const {data} = await axios.get('/api/admin/is-auth')
        setIsAdmin(data.success)
      } catch (error) {
        setIsAdmin(false)
      }
    }

    // Logout User
    const logoutUser = async ()=>{
      try {
        const {data} = await axios.post('/api/user/logout')
        if(data.success){
          toast.success(data.message)
          setUser(null)
          setCartItems({})
          setWishlistItems([])
          navigate('/')
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    // Adding items to cart
    const addToCart = async (itemId)=>{
      const cartData = {...cartItems} // Use shallow copy

      if(cartData[itemId]){
        cartData[itemId] += 1
      }else{
        cartData[itemId] =1
      }
      setCartItems(cartData)

      if(user){
        try {
          const {data} = await axios.post("/api/cart/add", {itemId})
          data.success ? toast.success(data.message) : toast.error(data.message)
        } catch (error) {
          toast.error(error.message)
        }
      }
    }
    // Getting total cart Items
    const getCartCount = ()=>{
      let totalCount = 0
      for(const itemId in cartItems){
        try {
          if(cartItems[itemId] > 0){
            totalCount += cartItems[itemId]
          }
        } catch (error) {
          console.log(error)
        }
      }
      return totalCount
    }

    // Update the Quantity of item
    const updateQuantity = async (itemId, quantity)=>{
      const cartData = {...cartItems}
      if(quantity <= 0){
        delete cartData[itemId] // Remove item entirely if quantity is 0 or less
      }else{
        cartData[itemId] = quantity
      }
      setCartItems(cartData)

      if(user){
        try {
          const {data} = await axios.post("/api/cart/update", {itemId, quantity})
          data.success ? toast.success(data.message) : toast.error(data.message)
        } catch (error) {
          toast.error(error.message)
        }
      }
    }

    const toggleWishlist = async (productId)=>{
      if(!user){
        toast.error("Please login to add books to your wishlist")
        return null
      }

      try {
        const {data} = await axios.post('/api/user/wishlist/toggle', {productId})
        if(data.success){
          setWishlistItems((data.wishlist || []).map((item) => item.toString()))
          toast.success(data.message)
          return data
        }else{
          toast.error(data.message)
          return null
        }
      } catch (error) {
        toast.error(error.message)
        return null
      }
    }

    // Getting total cart amount
    const getCartAmount = ()=>{
      let totalAmount = 0
      for(const itemId in cartItems){
        if(cartItems[itemId] > 0){
          let itemInfo = books.find((book)=> book._id === itemId)
          if(itemInfo){
            totalAmount += itemInfo.offerPrice * cartItems[itemId]
          }
        }
      }

      return totalAmount
    }

    useEffect(()=>{
        fetchBooks()
        fetchUser()
        fetchAdmin()
        
    },[])

    const value = {books,navigate,user,setUser,currency, searchQuery, setSearchQuery, cartItems, setCartItems, addToCart, getCartAmount, getCartCount, updateQuantity, method, setMethod, delivery_charges, showUserLogin, setShowUserLogin, isAdmin, setIsAdmin, axios, fetchBooks, fetchUser, logoutUser, wishlistItems, setWishlistItems, toggleWishlist }

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider
