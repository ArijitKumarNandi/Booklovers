import React, { useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FiBell, FiCamera, FiLock, FiMail, FiSave, FiTrash2, FiUser } from 'react-icons/fi'
import userImg from '../assets/user.png'
import { ShopContext } from '../context/ShopContext'

const Profile = () => {
  const { user, setUser, axios, navigate } = useContext(ShopContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newArrivals: true,
    marketingEmails: true,
  })

  const avatarPreview = useMemo(() => avatar || user?.avatar || userImg, [avatar, user?.avatar])

  useEffect(() => {
    if (user === null) {
      navigate('/')
      return
    }

    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setAvatar(user.avatar || '')
      setNotificationSettings({
        emailNotifications: true,
        newArrivals: user.notificationSettings?.newArrivals ?? true,
        marketingEmails: true,
      })
    }
  }, [navigate, user])

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }

    if (file.size > 1024 * 1024) {
      toast.error('Please choose an image smaller than 1MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result)
    reader.readAsDataURL(file)
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setSavingProfile(true)

    try {
      const { data } = await axios.put('/api/user/profile', { name, email, avatar })
      if (data.success) {
        setUser(data.user)
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setSavingPassword(true)

    try {
      const { data } = await axios.put('/api/user/password', {
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (data.success) {
        toast.success(data.message)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This will permanently delete your login account and notifications. Your orders, reviews, and addresses will remain in records.')
    if(!confirmed) return

    setDeletingAccount(true)
    try {
      const { data } = await axios.delete('/api/user/account')
      if(data.success){
        toast.success(data.message)
        setUser(null)
        navigate('/')
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeletingAccount(false)
    }
  }

  const handleNewArrivalsToggle = async () => {
    const nextValue = !notificationSettings.newArrivals
    setNotificationSettings((current) => ({ ...current, newArrivals: nextValue }))
    setSavingNotifications(true)

    try {
      const { data } = await axios.put('/api/user/notification-settings', { newArrivals: nextValue })
      if (data.success) {
        setUser(data.user)
        toast.success(data.message)
      } else {
        setNotificationSettings((current) => ({ ...current, newArrivals: !nextValue }))
        toast.error(data.message)
      }
    } catch (error) {
      setNotificationSettings((current) => ({ ...current, newArrivals: !nextValue }))
      toast.error(error.message)
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleLocalNotificationToggle = (settingKey) => {
    setNotificationSettings((current) => ({ ...current, [settingKey]: !current[settingKey] }))
    toast.success('Notification settings updated')
  }

  const NotificationToggle = ({ label, description, checked, onClick }) => (
    <div className='flex items-center justify-between gap-4 border-t border-[var(--theme-border)] py-3 first:border-t-0 first:pt-0 last:pb-0'>
      <div>
        <p className='medium-14 !text-inherit'>{label}</p>
        <p className='mt-0.5 text-xs'>{description}</p>
      </div>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        aria-label={label}
        disabled={savingNotifications}
        onClick={onClick}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition hover:shadow-sm ${checked ? 'bg-secondary' : 'bg-slate-300'} disabled:opacity-70`}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )

  if (!user) {
    return <div className='max-padd-container min-h-[60vh] pt-32'>Loading profile...</div>
  }

  return (
    <div className='max-padd-container py-16 pt-28'>
      <section className='grid gap-6 lg:grid-cols-[0.85fr_1.4fr]'>
        <aside className='bg-primary rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 lg:p-8'>
          <div className='flex flex-col items-center text-center'>
            <div className='relative'>
              <img src={avatarPreview} alt='Profile avatar' className='h-32 w-32 rounded-full object-cover ring-4 ring-white/80 shadow-sm' />
              <label className='absolute bottom-2 right-2 flexCenter h-10 w-10 cursor-pointer rounded-full bg-secondary text-white shadow-lg transition hover:scale-105'>
                <FiCamera />
                <input type='file' accept='image/*' onChange={handleAvatarChange} className='hidden' />
              </label>
            </div>
            <h1 className='bold-24 mt-5'>{user.name}</h1>
            <p className='mt-1'>{user.email}</p>
            <span className='mt-4 rounded-full bg-white px-4 py-1 medium-14 text-secondary shadow-sm ring-1 ring-slate-900/5'>Reader account</span>
          </div>

          <div className='surface-card mt-8 rounded-2xl p-5 shadow-sm ring-1 ring-slate-900/10'>
            <h2 className='bold-16'>Account</h2>
            <div className='mt-4 grid gap-3'>
              <div className='flex items-center gap-3 rounded-xl bg-primary p-3'>
                <span className='flexCenter h-10 w-10 rounded-full bg-primary text-secondary'><FiUser /></span>
                <div>
                  <p className='medium-14 !text-inherit'>{user.name}</p>
                  <p className='text-xs'>Display name</p>
                </div>
              </div>
              <div className='flex items-center gap-3 rounded-xl bg-primary p-3'>
                <span className='flexCenter h-10 w-10 rounded-full bg-primary text-secondary'><FiMail /></span>
                <div>
                  <p className='medium-14 !text-inherit break-all'>{user.email}</p>
                  <p className='text-xs'>Email address</p>
                </div>
              </div>
            </div>
          </div>

          <div className='surface-card mt-5 rounded-2xl p-5 shadow-sm ring-1 ring-slate-900/10'>
            <div className='flex items-start gap-3'>
              <span className='flexCenter h-10 w-10 rounded-xl bg-primary text-secondary'><FiBell /></span>
              <div>
                <h2 className='bold-16'>Notifications</h2>
                <p className='mt-1 text-xs'>Manage how you receive updates.</p>
              </div>
            </div>

            <div className='mt-4'>
              <NotificationToggle
                label='Email Notifications'
                description='Receive notifications via email'
                checked={notificationSettings.emailNotifications}
                onClick={() => handleLocalNotificationToggle('emailNotifications')}
              />
              <NotificationToggle
                label='New Arrivals'
                description='Notifications about new books'
                checked={notificationSettings.newArrivals}
                onClick={handleNewArrivalsToggle}
              />
              <NotificationToggle
                label='Marketing Emails'
                description='Promotional offers and updates'
                checked={notificationSettings.marketingEmails}
                onClick={() => handleLocalNotificationToggle('marketingEmails')}
              />
            </div>
          </div>

          <div className='surface-card mt-5 rounded-2xl p-5 shadow-sm ring-1 ring-red-200'>
            <h2 className='bold-16 text-red-600'>Delete Account</h2>
            <p className='mt-2 text-xs'>Permanently delete your login account and notifications. Orders, reviews, and addresses stay in records.</p>
            <button
              type='button'
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className='mt-4 flexCenter w-full gap-2 rounded-xl bg-red-600 px-5 py-3 medium-14 text-white transition hover:bg-red-700 disabled:opacity-70'
            >
              <FiTrash2 />
              {deletingAccount ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </aside>

        <div className='surface-card rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/10 lg:p-8'>
          <div className='mb-7'>
            <p className='medium-14 text-secondary'>Account settings</p>
            <h1 className='bold-28'>Profile</h1>
            <p className='mt-1'>Update your account details and reading identity.</p>
          </div>

          <form onSubmit={handleProfileSubmit} className='grid gap-5'>
            <h2 className='bold-18'>Update Profile</h2>
            <label className='grid gap-2'>
              <span className='medium-14'>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className='profile-input' placeholder='Your name' required />
            </label>
            <label className='grid gap-2'>
              <span className='medium-14'>Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type='email' className='profile-input' placeholder='you@example.com' required />
            </label>
            <label className='grid gap-2'>
              <span className='medium-14'>Upload Avatar</span>
              <input type='file' accept='image/*' onChange={handleAvatarChange} className='profile-file-input' />
            </label>
            <button type='submit' disabled={savingProfile} className='btn-secondary flexCenter gap-2 rounded-md disabled:opacity-70'>
              <FiSave />
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <form onSubmit={handlePasswordSubmit} className='mt-9 grid gap-5 border-t border-[var(--theme-border)] pt-8'>
            <h2 className='bold-18 flex items-center gap-2'><FiLock /> Update Password</h2>
            <label className='grid gap-2'>
              <span className='medium-14'>Current Password</span>
              <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type='password' className='profile-input' placeholder='Current password' required />
            </label>
            <div className='grid gap-5 md:grid-cols-2'>
              <label className='grid gap-2'>
                <span className='medium-14'>New Password</span>
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type='password' className='profile-input' placeholder='New password' required />
              </label>
              <label className='grid gap-2'>
                <span className='medium-14'>Confirm Password</span>
                <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type='password' className='profile-input' placeholder='Confirm password' required />
              </label>
            </div>
            <button type='submit' disabled={savingPassword} className='btn-dark flexCenter gap-2 rounded-md disabled:opacity-70'>
              <FiLock />
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Profile
