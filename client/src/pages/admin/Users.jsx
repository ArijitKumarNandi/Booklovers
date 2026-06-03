import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiTrash2, FiUsers } from 'react-icons/fi'
import userImg from '../../assets/user.png'
import { ShopContext } from '../../context/ShopContext'

const Users = () => {
  const { axios } = useContext(ShopContext)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/admin/users')
      if (data.success) {
        setUsers(data.users)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId) => {
    const confirmed = window.confirm('Delete this user?')
    if (!confirmed) return

    setDeletingId(userId)
    try {
      const { data } = await axios.delete('/api/admin/users', { data: { userId } })
      if (data.success) {
        toast.success(data.message)
        setUsers((prev) => prev.filter((user) => user._id !== userId))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDeletingId('')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className='m-2 h-[97vh] w-full overflow-y-scroll rounded-xl bg-primary px-3 py-8 sm:px-6 lg:w-4/5'>
      <div className='mb-8'>
        <p className='medium-14'>Admin Panel / Users</p>
        <div className='mt-3 flex items-center gap-3'>
          <span className='flexCenter h-11 w-11 rounded-full bg-white text-secondary shadow-sm'>
            <FiUsers className='text-xl' />
          </span>
          <div>
            <h1 className='bold-32'>All Users</h1>
            <p>Manage all your website's users.</p>
          </div>
        </div>
      </div>

      <section className='surface-card rounded-xl p-4 shadow-sm ring-1 ring-slate-900/5 sm:p-6'>
        {loading ? (
          <div className='p-6'>Loading users...</div>
        ) : (
          <div className='overflow-x-auto'>
            <div className='min-w-[840px]'>
              <div className='grid items-center rounded-lg px-5 py-3 bold-14' style={{ gridTemplateColumns: '140px minmax(0, 1.1fr) minmax(0, 1.4fr) 180px 140px', background: 'linear-gradient(90deg, rgba(14,165,233,0.18), rgba(168,85,247,0.12))' }}>
                <span>Avatar</span>
                <span>Name</span>
                <span>Email</span>
                <span>Registered On</span>
                <span>Actions</span>
              </div>

              {users.length === 0 ? (
                <div className='p-6'>No users registered yet.</div>
              ) : users.map((user) => (
                <div key={user._id} className='grid items-center border-b border-[var(--theme-border)] px-5 py-4' style={{ gridTemplateColumns: '140px minmax(0, 1.1fr) minmax(0, 1.4fr) 180px 140px' }}>
                  <img src={user.avatar || userImg} alt={user.name} className='h-11 w-11 rounded-full bg-primary object-cover ring-1 ring-slate-900/10' />
                  <span className='medium-14 line-clamp-1'>{user.name}</span>
                  <span className='line-clamp-1'>{user.email}</span>
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'N/A'}</span>
                  <button
                    type='button'
                    onClick={() => deleteUser(user._id)}
                    disabled={deletingId === user._id}
                    className='flexCenter w-fit gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-70'
                  >
                    <FiTrash2 />
                    {deletingId === user._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default Users
