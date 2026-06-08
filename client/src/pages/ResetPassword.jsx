import React, { useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { RiEyeLine, RiEyeOffLine, RiLockPasswordLine } from 'react-icons/ri'
import { ShopContext } from '../context/ShopContext'

const ResetPassword = () => {
  const {token} = useParams()
  const {axios, navigate, setShowUserLogin} = useContext(ShopContext)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const {data} = await axios.post(`/api/user/reset-password/${token}`, {
        password,
        confirmPassword,
      })

      if(data.success){
        toast.success(data.message)
        setPassword("")
        setConfirmPassword("")
        navigate("/")
        setShowUserLogin(true)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='min-h-[70vh] flex items-center justify-center px-4 py-16'>
      <form onSubmit={onSubmitHandler} className='w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-xl'>
        <h1 className='bold-28 mb-6 text-center'>Reset Password</h1>
        <div className='grid gap-4'>
          <label>
            <span className='medium-14'>New Password</span>
            <div className='relative mt-1'>
              <RiLockPasswordLine className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' className='border border-gray-200 rounded w-full p-2 pl-10 pr-10 outline-black/80' required />
              {password && (
                <button type='button' onClick={() => setShowPassword((prev) => !prev)} className='absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-gray-800' aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              )}
            </div>
          </label>
          <label>
            <span className='medium-14'>Confirm Password</span>
            <div className='relative mt-1'>
              <RiLockPasswordLine className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder='Confirm Password' className='border border-gray-200 rounded w-full p-2 pl-10 pr-10 outline-black/80' required />
              {confirmPassword && (
                <button type='button' onClick={() => setShowConfirmPassword((prev) => !prev)} className='absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-gray-800' aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                  {showConfirmPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              )}
            </div>
          </label>
          <button type='submit' disabled={loading} className='btn-secondary w-full rounded !py-2.5 disabled:opacity-70'>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ResetPassword
