import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import toast from 'react-hot-toast';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

const rememberedLoginKey = 'bookloversRememberedLogin'

const getRememberedLogin = () => {
  try {
    const savedLogin = localStorage.getItem(rememberedLoginKey)
    return savedLogin ? JSON.parse(savedLogin) : null
  } catch {
    localStorage.removeItem(rememberedLoginKey)
    return null
  }
}

const Login = () => {
  const {navigate, setShowUserLogin, axios, fetchUser } = useContext(ShopContext)
  const [rememberedLogin] = useState(getRememberedLogin)
  const [state, setState] = useState('login')
  const [name, setName] = useState("")
  const [email, setEmail] = useState(rememberedLogin?.email || "")
  const [password, setPassword] = useState(rememberedLogin?.password || "")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedLogin))
  const [forgotEmail, setForgotEmail] = useState("")

  const onSubmitHandler = async (event)=>{
    event.preventDefault()
    try {
      const {data} = await axios.post(`/api/user/${state}`,{name, email, password})
      if(data.success){
        toast.success(`${state === "login" ? "Login Successfully" : "Account Created"}`)
        if(state === "login" && rememberMe){
          localStorage.setItem(rememberedLoginKey, JSON.stringify({email, password}))
        }else{
          localStorage.removeItem(rememberedLoginKey)
        }
        navigate("/")
        await fetchUser()
        setShowUserLogin(false)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onForgotSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      const {data} = await axios.post('/api/user/forgot-password', {email: forgotEmail})
      data.success ? toast.success(data.message) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const switchToLogin = () => {
    setState("login")
    setShowPassword(false)
  }

  const switchToRegister = () => {
    setState("register")
    setShowPassword(false)
  }

  const switchToForgot = () => {
    setForgotEmail(email)
    setState("forgot")
    setShowPassword(false)
  }

  return (
    <div onClick={()=>setShowUserLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-40 flex items-center text-sm text-gray-600 bg-black/50'>
      <form onSubmit={state === "forgot" ? onForgotSubmitHandler : onSubmitHandler} onClick={(e)=> e.stopPropagation()} className='flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white'>
        <h3 className='bold-28 mx-auto mb-3'>
          {state === "forgot" ? (
            <span>Forgot Password</span>
          ) : (
            <>
              <span className='text-secondary capitalize'>User </span>
              <span className='capitalize'>{state === "login" ? "Login" : "Register"}</span>
            </>
          )}
        </h3>
        {state === "forgot" ? (
          <>
            <div className='w-full'>
              <p className='medium-14'>Email your email</p>
              <input type="email" onChange={(e) => setForgotEmail(e.target.value)} value={forgotEmail} placeholder='example@example.com' className='border border-gray-200 rounded w-full p-2 mt-1 outline-black/80' required />
            </div>
            <button type='button' onClick={switchToLogin} className='self-end text-secondary cursor-pointer'>
              Remember Password?
            </button>
            <button type="submit" className='btn-secondary w-full rounded !py-2.5'>
              Send Reset Link
            </button>
          </>
        ) : (
          <>
        {state === "register" && (
          <div className='w-full'>
            <p className='medium-14'>Name</p>
            <input type="text" onChange={(e)=> setName(e.target.value)} value={name} placeholder='Type here...' className='border border-gray-200 rounded w-full p-2 mt-1 outline-black/80' required />

          </div>
        )}
        <div className='w-full'>
          <p className='medium-14'>Email</p>
          <input type="email" onChange={(e) => setEmail(e.target.value)} value={email} placeholder='Type here...' className='border border-gray-200 rounded w-full p-2 mt-1 outline-black/80' required />

        </div>
        <div className='w-full'>
          <p className='medium-14'>Password</p>
          <div className='relative mt-1'>
            <input type={showPassword ? "text" : "password"} onChange={(e) => setPassword(e.target.value)} value={password} placeholder='Type here...' className='border border-gray-200 rounded w-full p-2 pr-10 outline-black/80' required />
            {password && (
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-lg text-gray-500 hover:text-gray-800'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            )}
          </div>

        </div>
        {state === "login" && (
          <div className='flex w-full items-center justify-between gap-3'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input type='checkbox' checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className='h-4 w-4 accent-secondary' />
              <span>Remember me</span>
            </label>
            <button type='button' onClick={switchToForgot} className='text-secondary cursor-pointer'>
              Forgot Password?
            </button>
          </div>
        )}
        {state === "register" ? (
          <p>Already have account?
            <span onClick={switchToLogin} className='text-secondary cursor-pointer'>
              {" "}
              click here
            </span>
          </p>
        ) : (
          <p>
            Create an account?
            <span onClick={switchToRegister} className='text-secondary cursor-pointer'>
              {" "}
              click here
            </span>
          </p>
        )}
        <button type="submit" className='btn-secondary w-full rounded !py-2.5'>
          {state === "register" ? "Create Account" : "Login"}
        </button>
        </>
        )}
        
      </form>
    </div>
  );
};

export default Login
