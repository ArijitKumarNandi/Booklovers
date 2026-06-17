import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FiSearch, FiTag, FiX } from 'react-icons/fi'
import upload_icon from '../../assets/upload_icon.png'
import { genreTree, getBookGenreLabels, getRootGenres, getSubgenres } from '../../assets/genreTree'
import { ShopContext } from '../../context/ShopContext'

const languageOptions = [
  'English',
  'Bengali',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Sanskrit',
  'Tamil',
  'Telugu',
  'Marathi',
  'Gujarati',
  'Urdu',
  'Malayalam',
]

const quantityOptions = Array.from({ length: 101 }, (_, index) => index)
const LOW_STOCK_LIMIT = 5

const getValidGenreNames = () => genreTree.map((genre) => genre.name)

const getValidSubgenrePaths = (genres = []) => {
  return genreTree
    .filter((genre) => genres.includes(genre.name))
    .flatMap((genre) => (
      (genre.children ?? []).map((child) => `${genre.name} > ${child.name}`)
    ))
}

const getInitialGenres = (book) => {
  const validGenres = getValidGenreNames()
  const roots = getRootGenres([...(book.genres ?? []), ...getBookGenreLabels(book)])
  return roots.filter((genre) => validGenres.includes(genre))
}

const getInitialSubgenrePaths = (book, genres) => {
  const validSubgenrePaths = getValidSubgenrePaths(genres)
  const savedPaths = book.genrePaths?.filter((path) => path.includes(' > ')) ?? []
  const savedSubgenreNames = book.subgenres ?? []
  const pathsFromNames = validSubgenrePaths.filter((path) => savedSubgenreNames.includes(path.split(' > ').pop()))

  return [...new Set([...savedPaths, ...pathsFromNames].filter((path) => validSubgenrePaths.includes(path)))]
}

const getStockBadge = (book) => {
  const quantity = Number(book.quantity ?? 10)

  if(quantity <= 0){
    return {
      label: 'Out of stock',
      className: 'bg-red-100 text-red-700 ring-red-200',
    }
  }

  if(quantity <= LOW_STOCK_LIMIT){
    return {
      label: 'Low stock',
      className: 'bg-amber-100 text-amber-700 ring-amber-200',
    }
  }

  return null
}

const ProductList = () => {
  const { books, currency, axios, fetchBooks } = useContext(ShopContext)
  const editGenreDropdownRef = useRef(null)
  const editSubgenreDropdownRef = useRef(null)
  const [editingBook, setEditingBook] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [imageFiles, setImageFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [editGenreQuery, setEditGenreQuery] = useState('')
  const [showEditGenreDropdown, setShowEditGenreDropdown] = useState(false)
  const [editSubgenreQuery, setEditSubgenreQuery] = useState('')
  const [showEditSubgenreDropdown, setShowEditSubgenreDropdown] = useState(false)

  const selectedEditGenreNodes = useMemo(() => (
    genreTree.filter((genre) => editForm?.genres?.includes(genre.name))
  ), [editForm?.genres])

  const filteredEditGenres = useMemo(() => (
    genreTree.filter((genre) => genre.name.toLowerCase().includes(editGenreQuery.trim().toLowerCase()))
  ), [editGenreQuery])

  const editSubgenreOptions = useMemo(() => (
    selectedEditGenreNodes.flatMap((genre) => (
      (genre.children ?? []).map((child) => ({
        genre: genre.name,
        name: child.name,
        path: `${genre.name} > ${child.name}`,
      }))
    ))
  ), [selectedEditGenreNodes])

  const filteredEditSubgenres = useMemo(() => {
    const query = editSubgenreQuery.trim().toLowerCase()
    return editSubgenreOptions.filter((subgenre) => (
      !query || subgenre.name.toLowerCase().includes(query) || subgenre.genre.toLowerCase().includes(query)
    ))
  }, [editSubgenreOptions, editSubgenreQuery])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if(editGenreDropdownRef.current && !editGenreDropdownRef.current.contains(event.target)){
        setShowEditGenreDropdown(false)
      }
      if(editSubgenreDropdownRef.current && !editSubgenreDropdownRef.current.contains(event.target)){
        setShowEditSubgenreDropdown(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [])

  const openUpdateModal = (book) => {
    const initialGenres = getInitialGenres(book)
    setEditingBook(book)
    setImageFiles([])
    setEditGenreQuery('')
    setShowEditGenreDropdown(false)
    setEditSubgenreQuery('')
    setShowEditSubgenreDropdown(false)
    setEditForm({
      name: book.name || '',
      genres: initialGenres,
      subgenrePaths: getInitialSubgenrePaths(book, initialGenres),
      offerPrice: String(book.offerPrice ?? 10),
      price: String(book.price ?? 10),
      quantity: String(book.quantity ?? 10),
      description: book.description || '',
      author: book.author || '',
      publisher: book.publisher || '',
      language: book.language || 'English',
      popular: Boolean(book.popular),
    })
  }

  const closeUpdateModal = () => {
    setEditingBook(null)
    setEditForm(null)
    setImageFiles([])
    setEditGenreQuery('')
    setShowEditGenreDropdown(false)
    setEditSubgenreQuery('')
    setShowEditSubgenreDropdown(false)
  }

  const updateEditField = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }))
  }

  const toggleEditGenre = (genreName) => {
    setEditForm((current) => {
      const genres = current.genres || []

      if(genres.includes(genreName)){
        return {
          ...current,
          genres: genres.filter((genre) => genre !== genreName),
          subgenrePaths: (current.subgenrePaths || []).filter((path) => !path.startsWith(`${genreName} > `)),
        }
      }

      return {
        ...current,
        genres: [...genres, genreName],
      }
    })
  }

  const toggleEditSubgenrePath = (path) => {
    setEditForm((current) => ({
      ...current,
      subgenrePaths: current.subgenrePaths?.includes(path)
        ? current.subgenrePaths.filter((item) => item !== path)
        : [...(current.subgenrePaths || []), path],
    }))
  }

  const handleImageChange = (event, index) => {
    const file = event.target.files?.[0]
    if(!file) return

    if(!file.type.startsWith('image/')){
      toast.error('Please choose an image file')
      return
    }

    const nextFiles = [...imageFiles]
    nextFiles[index] = file
    setImageFiles(nextFiles)
  }

  const handleDelete = async (book) => {
    const confirmed = window.confirm(`Delete ${book.name} permanently?`)
    if(!confirmed) return

    try {
      const { data } = await axios.delete(`/api/product/${book._id}`)
      if(data.success){
        toast.success(data.message)
        await fetchBooks()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUpdate = async (event) => {
    event.preventDefault()
    setSaving(true)

    try {
      const genres = editForm.genres || []
      if(genres.length === 0){
        toast.error('Please select at least one genre')
        return
      }

      const subgenrePaths = editForm.subgenrePaths || []
      const subgenres = getSubgenres(subgenrePaths)
      const genrePaths = [...genres, ...subgenrePaths]

      const productData = {
        name: editForm.name,
        description: editForm.description,
        author: editForm.author,
        publisher: editForm.publisher,
        language: editForm.language,
        genres,
        subgenres,
        genrePaths,
        price: editForm.price,
        offerPrice: editForm.offerPrice,
        quantity: editForm.quantity,
        popular: editForm.popular,
      }

      const formData = new FormData()
      formData.append('productData', JSON.stringify(productData))
      imageFiles.filter(Boolean).forEach((file) => formData.append('images', file))

      const { data } = await axios.put(`/api/product/${editingBook._id}`, formData)
      if(data.success){
        toast.success(data.message)
        await fetchBooks()
        closeUpdateModal()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='px-2 sm:px-6 py-12 m-2 h-[97vh] bg-primary overflow-y-scroll lg:w-4/5 rounded-xl'>
      <div className='flex flex-col gap-2'>
        <div className='grid grid-cols-[0.7fr_2.4fr_1.5fr_1fr_0.8fr_1.5fr] items-center py-2 px-3 bg-white bold-14 sm:bold-15 mb-1 rounded'>
          <h5>Image</h5>
          <h5>Name</h5>
          <h5>Genres</h5>
          <h5>Price</h5>
          <h5>Quantity</h5>
          <h5 className='text-center'>Actions</h5>
        </div>

        {books.map((book) => {
          const stockBadge = getStockBadge(book)

          return (
            <div key={book._id} className='grid grid-cols-[0.7fr_2.4fr_1.5fr_1fr_0.8fr_1.5fr] items-center gap-2 rounded-lg bg-white p-3'>
              <img src={book.image?.[0]} alt={book.name} className='h-14 w-11 rounded bg-primary object-cover' />
              <h5 className='text-sm font-semibold line-clamp-2'>{book.name}</h5>
              <p className='text-sm font-semibold line-clamp-2'>{getRootGenres(getBookGenreLabels(book)).join(', ') || 'No genre'}</p>
              <div className='text-sm font-semibold'>{currency}{book.offerPrice}</div>
              <div className='flex flex-col items-start gap-1'>
                <span className='text-sm font-semibold'>{book.quantity ?? 10}</span>
                {stockBadge && (
                  <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${stockBadge.className}`}>
                    {stockBadge.label}
                  </span>
                )}
              </div>
              <div className='flex flex-wrap justify-center gap-2'>
                <button
                  type='button'
                  onClick={() => openUpdateModal(book)}
                  className='rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700'
                >
                  Update
                </button>
                <button
                  type='button'
                  onClick={() => handleDelete(book)}
                  className='rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700'
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {editingBook && editForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4'>
          <form onSubmit={handleUpdate} className='relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl'>
            <button
              type='button'
              onClick={closeUpdateModal}
              className='absolute right-4 top-4 flexCenter h-8 w-8 rounded-full bg-primary text-lg'
              aria-label='Close update product form'
            >
              <FiX />
            </button>
            <h2 className='bold-24 text-center'>Update Product</h2>

            <div className='mt-5 grid gap-4 md:grid-cols-2'>
              <label className='grid gap-1'>
                <span className='medium-14'>Book Name</span>
                <input value={editForm.name} onChange={(event) => updateEditField('name', event.target.value)} className='rounded-md border border-slate-200 px-3 py-2 outline-none' required />
              </label>
              <div className='rounded-xl bg-white/60 p-4 ring-1 ring-slate-900/10 md:col-span-2'>
                <div className='flexStart gap-2'>
                  <FiTag className='text-secondary' />
                  <h5 className='h5'>Genres *</h5>
                  <span className='text-xs text-secondary'>({editForm.genres.length})</span>
                </div>
                <div ref={editGenreDropdownRef} className='relative mt-3'>
                  <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                  <input
                    value={editGenreQuery}
                    onChange={(event) => {
                      setEditGenreQuery(event.target.value)
                      setShowEditGenreDropdown(true)
                    }}
                    onFocus={() => setShowEditGenreDropdown(true)}
                    onClick={() => setShowEditGenreDropdown(true)}
                    type='text'
                    placeholder='Search genres...'
                    className='w-full rounded-lg bg-white px-9 py-2 outline-none ring-1 ring-slate-900/10'
                  />
                  {showEditGenreDropdown && (
                    <div className='absolute left-0 right-0 top-12 z-30 max-h-56 overflow-y-auto rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-900/10'>
                      {filteredEditGenres.length === 0 ? (
                        <p className='px-3 py-2'>No matching genres found.</p>
                      ) : filteredEditGenres.map((genre) => {
                        const isSelected = editForm.genres.includes(genre.name)

                        return (
                          <button
                            key={genre.name}
                            type='button'
                            onClick={() => {
                              toggleEditGenre(genre.name)
                              setShowEditGenreDropdown(false)
                              setEditGenreQuery('')
                            }}
                            className={`block w-full rounded-md px-3 py-1.5 text-left font-semibold hover:bg-primary ${isSelected ? 'bg-secondary text-white hover:bg-secondary' : ''}`}
                          >
                            {genre.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
                {editForm.genres.length > 0 && (
                  <div className='mt-3 flex flex-wrap gap-2 rounded-xl bg-primary p-3'>
                    {editForm.genres.map((genre) => (
                      <button
                        key={genre}
                        type='button'
                        onClick={() => toggleEditGenre(genre)}
                        className='flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-white'
                      >
                        {genre}
                        <FiX />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className='rounded-xl bg-white/60 p-4 ring-1 ring-slate-900/10 md:col-span-2'>
                <div className='flexStart gap-2'>
                  <FiTag className='text-secondary' />
                  <h5 className='h5'>Subgenres</h5>
                  <span className='text-xs text-secondary'>({editForm.subgenrePaths.length})</span>
                </div>
                {editForm.genres.length === 0 ? (
                  <p className='mt-3 rounded-xl bg-primary p-4'>Select at least one genre first to add subgenres.</p>
                ) : (
                  <>
                    <div ref={editSubgenreDropdownRef} className='relative mt-3'>
                      <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                      <input
                        value={editSubgenreQuery}
                        onChange={(event) => {
                          setEditSubgenreQuery(event.target.value)
                          setShowEditSubgenreDropdown(true)
                        }}
                        onFocus={() => setShowEditSubgenreDropdown(true)}
                        onClick={() => setShowEditSubgenreDropdown(true)}
                        type='text'
                        placeholder='Search subgenres from selected genres...'
                        className='w-full rounded-lg bg-white px-9 py-2 outline-none ring-1 ring-slate-900/10'
                      />
                      {showEditSubgenreDropdown && (
                        <div className='absolute left-0 right-0 top-12 z-30 max-h-56 overflow-y-auto rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-900/10'>
                          {filteredEditSubgenres.length === 0 ? (
                            <p className='px-3 py-2'>No matching subgenres found.</p>
                          ) : filteredEditSubgenres.map((subgenre) => {
                            const isSelected = editForm.subgenrePaths.includes(subgenre.path)

                            return (
                              <button
                                key={subgenre.path}
                                type='button'
                                onClick={() => {
                                  toggleEditSubgenrePath(subgenre.path)
                                  setShowEditSubgenreDropdown(false)
                                  setEditSubgenreQuery('')
                                }}
                                className={`block w-full rounded-md px-3 py-1.5 text-left font-semibold hover:bg-primary ${isSelected ? 'bg-gradient-to-r from-slate-100 via-zinc-200 to-slate-300 text-slate-800 ring-1 ring-slate-300 hover:from-slate-100 hover:via-zinc-200 hover:to-slate-300' : ''}`}
                              >
                                <span>{subgenre.name}</span>
                                <span className={`ml-2 text-xs ${isSelected ? 'text-slate-600' : 'text-gray-50'}`}>({subgenre.genre})</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    {editForm.subgenrePaths.length > 0 && (
                      <div className='mt-3 flex flex-wrap gap-2 rounded-xl bg-primary p-3'>
                        {editForm.subgenrePaths.map((path) => (
                          <button
                            key={path}
                            type='button'
                            onClick={() => toggleEditSubgenrePath(path)}
                            className='flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-100 via-zinc-200 to-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300'
                          >
                            {path.split(' > ').pop()}
                            <FiX className='text-secondary' />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              <label className='grid gap-1'>
                <span className='medium-14'>Author</span>
                <input value={editForm.author} onChange={(event) => updateEditField('author', event.target.value)} className='rounded-md border border-slate-200 px-3 py-2 outline-none' />
              </label>
              <label className='grid gap-1'>
                <span className='medium-14'>Publisher</span>
                <input value={editForm.publisher} onChange={(event) => updateEditField('publisher', event.target.value)} className='rounded-md border border-slate-200 px-3 py-2 outline-none' />
              </label>
              <label className='grid gap-1'>
                <span className='medium-14'>Language</span>
                <select value={editForm.language} onChange={(event) => updateEditField('language', event.target.value)} className='rounded-md border border-slate-200 px-3 py-2 outline-none'>
                  {languageOptions.map((language) => (
                    <option key={language} value={language}>{language}</option>
                  ))}
                </select>
              </label>
              <label className='grid gap-1'>
                <span className='medium-14'>Offer Price</span>
                <input value={editForm.offerPrice} onChange={(event) => updateEditField('offerPrice', event.target.value)} type='number' min='0' className='rounded-md border border-slate-200 px-3 py-2 outline-none' required />
              </label>
              <label className='grid gap-1'>
                <span className='medium-14'>Price</span>
                <input value={editForm.price} onChange={(event) => updateEditField('price', event.target.value)} type='number' min='0' className='rounded-md border border-slate-200 px-3 py-2 outline-none' required />
              </label>
              <label className='grid gap-1'>
                <span className='medium-14'>Quantity</span>
                <select value={editForm.quantity} onChange={(event) => updateEditField('quantity', event.target.value)} className='rounded-md border border-slate-200 px-3 py-2 outline-none'>
                  {quantityOptions.map((quantity) => (
                    <option key={quantity} value={quantity}>{quantity}</option>
                  ))}
                </select>
              </label>
              <label className='flex items-center gap-2 self-end rounded-md bg-primary px-3 py-2'>
                <input type='checkbox' checked={editForm.popular} onChange={() => updateEditField('popular', !editForm.popular)} />
                <span className='medium-14'>Add to Popular</span>
              </label>
            </div>

            <label className='mt-4 grid gap-1'>
              <span className='medium-14'>Description</span>
              <textarea value={editForm.description} onChange={(event) => updateEditField('description', event.target.value)} rows={4} className='rounded-md border border-slate-200 px-3 py-2 outline-none' required />
            </label>

            <div className='mt-4'>
              <span className='medium-14'>Book Images</span>
              <div className='mt-2 flex flex-wrap gap-2'>
                {Array(4).fill('').map((_, index) => (
                  <label key={index} htmlFor={`edit-image-${index}`} className='cursor-pointer overflow-hidden rounded-md ring-1 ring-slate-200'>
                    <input id={`edit-image-${index}`} type='file' accept='image/*' hidden onChange={(event) => handleImageChange(event, index)} />
                    <img
                      src={imageFiles[index] ? URL.createObjectURL(imageFiles[index]) : editingBook.image?.[index] || upload_icon}
                      alt='Upload product'
                      className='h-20 w-20 object-cover'
                    />
                  </label>
                ))}
              </div>
            </div>

            <button type='submit' disabled={saving} className='mt-5 w-full rounded-md bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-70'>
              {saving ? 'Updating...' : 'Update Product'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default ProductList
