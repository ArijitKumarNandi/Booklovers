import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FiSearch, FiTrash2, FiUsers } from 'react-icons/fi'
import userImg from '../../assets/user.png'
import { ShopContext } from '../../context/ShopContext'

const ITEMS_PER_PAGE = 10

const Users = () => {
  const { axios } = useContext(ShopContext)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [currPage, setCurrPage] = useState(1)

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return users
      .filter((user) => !query || user.name?.toLowerCase().includes(query))
      .sort((firstUser, secondUser) => {
        const firstDate = new Date(firstUser.createdAt ?? 0)
        const secondDate = new Date(secondUser.createdAt ?? 0)

        return sortOrder === 'oldest' ? firstDate - secondDate : secondDate - firstDate
      })
  }, [searchQuery, sortOrder, users])

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice((currPage - 1) * ITEMS_PER_PAGE, currPage * ITEMS_PER_PAGE)
  const showingStart = filteredUsers.length === 0 ? 0 : (currPage - 1) * ITEMS_PER_PAGE + 1
  const showingEnd = Math.min(currPage * ITEMS_PER_PAGE, filteredUsers.length)

  const fetchUsers = useCallback(async () => {
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
  }, [axios])

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
  }, [fetchUsers])

  useEffect(() => {
    setCurrPage(1)
  }, [searchQuery, sortOrder])

  useEffect(() => {
    if(totalPages > 0 && currPage > totalPages){
      setCurrPage(totalPages)
    }
  }, [currPage, totalPages])

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
          <>
            <div className='mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
              <div className='flex w-full max-w-md items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-900/10'>
                <FiSearch className='shrink-0 text-gray-400' />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  type='text'
                  placeholder='Search by user name...'
                  className='w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-gray-400'
                />
              </div>
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className='w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold shadow-sm outline-none ring-1 ring-slate-900/10 sm:w-48'
              >
                <option value='newest'>Newest first</option>
                <option value='oldest'>Oldest first</option>
              </select>
            </div>

            <div className='overflow-x-auto'>
              <div className='min-w-[840px]'>
                <div className='grid items-center rounded-lg px-5 py-3 bold-14' style={{ gridTemplateColumns: '140px minmax(0, 1.1fr) minmax(0, 1.4fr) 180px 140px', background: 'linear-gradient(90deg, rgba(14,165,233,0.18), rgba(168,85,247,0.12))' }}>
                  <span>Avatar</span>
                  <span>Name</span>
                  <span>Email</span>
                  <span>Registered On</span>
                  <span>Actions</span>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className='p-6'>No users found.</div>
                ) : paginatedUsers.map((user) => (
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

            <div className='mt-5 flex flex-col gap-1 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between'>
              <p>Showing {showingStart}-{showingEnd} of {filteredUsers.length} users</p>
              {totalPages > 1 && (
                <p className='font-semibold text-secondary'>Page {currPage} of {totalPages}</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className='flexCenter flex-wrap gap-2 sm:gap-4 mt-8 mb-2'>
                <button disabled={currPage === 1} onClick={() => setCurrPage((prev) => prev - 1)} className={`${currPage === 1 && 'opacity-50 cursor-not-allowed'} btn-dark !py-1 !px-3`}>Previous</button>
                {Array.from({length: totalPages}, (_, index) => (
                  <button key={index + 1} onClick={() => setCurrPage(index + 1)} className={`${currPage === index + 1 && 'bg-secondary !text-white'} btn-light !py-1 !px-3`}>{index + 1}</button>
                ))}
                <button disabled={currPage === totalPages} onClick={() => setCurrPage((prev) => prev + 1)} className={`${currPage === totalPages && 'opacity-50 cursor-not-allowed'} btn-white bg-tertiary !py-1 !px-3`}>Next</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default Users
