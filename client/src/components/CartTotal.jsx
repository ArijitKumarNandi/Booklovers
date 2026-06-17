import React, { useCallback, useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import { FiCreditCard, FiMapPin } from 'react-icons/fi'

const CartTotal = () => {
  const {navigate, books, currency, cartItems, setCartItems, method, setMethod, getCartAmount, getCartCount, delivery_charges, user, axios, fetchBooks} = useContext(ShopContext)
  const [addresses, setAddresses] = useState([])
  const [showAddress, setShowAddress] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  
  const getAddress = useCallback(async ()=>{
    try {
      const {data} = await axios.get("/api/address/get")
      if(data.success){
        setAddresses(data.addresses)
        if(data.addresses.length > 0){
          setSelectedAddress(data.addresses[0])
        }
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }, [axios])

  const placeOrder = async ()=>{
    try {
      if(!selectedAddress){
        return toast.error("Please select an address")
      }
      let orderItems = []
      for(const itemId in cartItems){
        const book = books.find((item)=> item._id === itemId)
        if(book){
          orderItems.push({...book, cartQuantity: cartItems[itemId]})
        }
      }
      // Convert orderItems to items array for backend
      let items = orderItems.map((item)=>({
        product: item._id,
        quantity: item.cartQuantity
      }))
      // Place Order using COD
      if(method === "COD"){
        const {data} = await axios.post("/api/order/cod", {items, address: selectedAddress._id})
        if(data.success){
          toast.success(data.message)
          setCartItems({})
          await fetchBooks()
          navigate("/my-orders")
        }else{
          toast.error(data.message)
        }
      }else{
        const {data} = await axios.post("/api/order/stripe", {items, address: selectedAddress._id})
        if(data.success){
          await fetchBooks()
          window.location.replace(data.url)
         
        }else{
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)  
      
    }
  }

  useEffect(()=>{
    if(user){
      getAddress()
    }
  }, [getAddress, user])

  return (
    <div>
      <h3 className='bold-22'>Order Details <span className='bold-14 text-secondary'>({getCartCount()}) Items</span></h3>
      <hr className="border-gray-300 my-5" />
      {/* PAYMENT & ADDRESS */}
      <div className='mb-5'>
        <div className='my-5'>
          <h4 className='h4 mb-4 flex items-center gap-2'><FiMapPin /> Shipping Address</h4>
          <div className='relative flex justify-between items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-900/5'>
            <p>{selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : "No address found"}</p>
            <button onClick={()=>setShowAddress(!showAddress)} className='text-secondary medium-14 hover:underline cursor-pointer'>Change</button>
            {showAddress && (
              <div className='absolute left-0 top-16 z-20 py-1 bg-white ring-1 ring-slate-900/10 text-sm w-full rounded-xl shadow-lg overflow-hidden'>
                {addresses.map((address, index)=>(
                  <p key={index} onClick={()=>{setSelectedAddress(address); setShowAddress(false)}} className='p-2 cursor-pointer hover:bg-gray-100 medium-14'>{address.street}, {address.city}, {address.state},{" "} {address.country}</p>
                ))}
                <p onClick={()=>navigate("/address-form")} className='p-2 text-center cursor-pointer hover:bg-tertiary'>Add Address</p>
              </div>
            )}
          </div>
        </div>
        <hr className="border-gray-300 my-5" />
        <div className='my-6'>
          <h4 className="h4 mb-4 flex items-center gap-2"><FiCreditCard /> Payment Method</h4>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div onClick={()=>setMethod("COD")} className={`${method === "COD" ? "bg-secondary text-white" : "bg-white"} rounded-xl px-4 py-3 text-center text-xs font-semibold cursor-pointer ring-1 ring-slate-900/5`}>Cash on Delivery</div>
            <div onClick={()=>setMethod("stripe")} className={`${method === "stripe" ? "bg-secondary text-white" : "bg-white"} rounded-xl px-4 py-3 text-center text-xs font-semibold cursor-pointer ring-1 ring-slate-900/5`}>Stripe</div>
          </div>
        </div>
        <hr className="border-gray-300 my-5" />
      </div>
      <div className='mt-4 space-y-2'>
        <div className='flex justify-between'>
          <h5 className="h5">Price</h5>
          <p className='font-bold'>{currency}{getCartAmount()}</p>
        </div>
        <div className='flex justify-between'>
          <h5 className="h5">Shipping Fee</h5>
          <p className='font-bold'>{currency}{getCartAmount() === 0 ? "0.00" : `${delivery_charges}.00`}</p>
        </div>
        <div className='flex justify-between'>
          <h5 className="h5">Tax (2%)</h5>
          <p className='font-bold'>{currency}{(getCartAmount() * 2) / 100}</p>
        </div>
        <div className='flex justify-between text-lg font-medium mt-3'>
          <h4 className="h4">Total Amount:</h4>
          <p className='bold-18'>{currency}{getCartAmount() === 0 ? "$0.00" : getCartAmount() + delivery_charges + (getCartAmount() * 2) / 100}</p>
        </div>
      </div>
      <button onClick={placeOrder} className='btn-dark w-full mt-8 !rounded-xl'>
        Proceed to Order
      </button>
    </div>
  )
}

export default CartTotal
