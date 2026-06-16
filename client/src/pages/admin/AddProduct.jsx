import React, { useContext, useEffect, useRef, useState } from 'react'
import upload_icon from "../../assets/upload_icon.png"
import { ShopContext } from '../../context/ShopContext'
import toast from "react-hot-toast"
import { FiSearch, FiTag, FiX } from 'react-icons/fi'
import { genreTree, getSubgenres } from '../../assets/genreTree'

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

const AddProduct = () => {
  const {axios, fetchBooks} = useContext(ShopContext)
  const genreDropdownRef = useRef(null)
  const subgenreDropdownRef = useRef(null)
  const languageDropdownRef = useRef(null)
  const [files, setFiles] = useState([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [author, setAuthor] = useState("")
  const [publisher, setPublisher] = useState("")
  const [language, setLanguage] = useState("English")
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [price, setPrice] = useState("10")
  const [offerPrice, setOfferPrice] = useState("10")
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedSubgenrePaths, setSelectedSubgenrePaths] = useState([])
  const [genreQuery, setGenreQuery] = useState("")
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)
  const [subgenreQuery, setSubgenreQuery] = useState("")
  const [showSubgenreDropdown, setShowSubgenreDropdown] = useState(false)
  const [popular, setPopular] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const selectedGenreNodes = genreTree.filter((genre) => selectedGenres.includes(genre.name))
  const genrePaths = [...selectedGenres, ...selectedSubgenrePaths]
  const filteredGenres = genreTree.filter((genre) => genre.name.toLowerCase().includes(genreQuery.trim().toLowerCase()))
  const subgenreOptions = selectedGenreNodes.flatMap((genre) => (
    (genre.children ?? []).map((child) => ({
      genre: genre.name,
      name: child.name,
      path: `${genre.name} > ${child.name}`,
    }))
  ))
  const filteredSubgenres = subgenreOptions.filter((subgenre) => {
    const query = subgenreQuery.trim().toLowerCase()
    return !query || subgenre.name.toLowerCase().includes(query) || subgenre.genre.toLowerCase().includes(query)
  })

  useEffect(() => {
    const handlePointerDown = (event) => {
      if(genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)){
        setShowGenreDropdown(false)
      }
      if(subgenreDropdownRef.current && !subgenreDropdownRef.current.contains(event.target)){
        setShowSubgenreDropdown(false)
      }
      if(languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)){
        setShowLanguageDropdown(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
    }
  }, [])

  const toggleGenre = (genreName) => {
    setSelectedGenres((genres) => {
      if(genres.includes(genreName)){
        setSelectedSubgenrePaths((paths) => paths.filter((path) => !path.startsWith(`${genreName} > `)))
        return genres.filter((item) => item !== genreName)
      }

      return [...genres, genreName]
    })
  }

  const toggleSubgenrePath = (path) => {
    setSelectedSubgenrePaths((paths) => (
      paths.includes(path) ? paths.filter((item) => item !== path) : [...paths, path]
    ))
  }

  const analyzeImageWithAI = async (file)=>{
    if(!file) return

    if(!file.type.startsWith("image/")){
      toast.error("Please upload an image file")
      return
    }

    setAiLoading(true)

    try {
      const formData = new FormData()
      formData.append("image", file)

      const {data} = await axios.post("/api/product/analyze-image", formData)

      if(data.success){
        setName(data.product.name)
        setDescription(data.product.description)
        toast.success("AI filled product info")
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setAiLoading(false)
    }
  }

  const onImageChange = async (event, index)=>{
    const file = event.target.files[0]
    if(!file) return

    const updatedFiles = [...files]
    updatedFiles[index] = file
    setFiles(updatedFiles)
    await analyzeImageWithAI(file)
  }

  const onSubmitHandler = async (event)=>{
    event.preventDefault()
    try {
      if(selectedGenres.length === 0){
        toast.error("Please select at least one genre")
        return
      }

      const productData = {
        name,
        description,
        author,
        publisher,
        language,
        genres: selectedGenres,
        subgenres: getSubgenres(selectedSubgenrePaths),
        genrePaths,
        price,
        offerPrice,
        popular
      }

      const formData = new FormData()

      formData.append("productData", JSON.stringify(productData))
      for(let i = 0; i < files.length; i++){
        formData.append("images", files[i])
      }

      const {data} = await axios.post("/api/product/add", formData)
      if(data.success){
        toast.success(data.message)
        await fetchBooks()
        setName("")
        setDescription("");
        setAuthor("");
        setPublisher("");
        setLanguage("English");
        setShowLanguageDropdown(false);
        setFiles([]);
        setPrice("10");
        setOfferPrice("10");
        setSelectedGenres([]);
        setSelectedSubgenrePaths([]);
        setGenreQuery("");
        setShowGenreDropdown(false);
        setSubgenreQuery("");
        setShowSubgenreDropdown(false);
        setPopular(false);
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='px-2 sm:px-6 py-12 m-2 h-[97vh] bg-primary overflow-y-scroll w-full lg:w-4/5 rounded-xl'>
      <form onSubmit={onSubmitHandler} className='flex flex-col gap-y-3 medium-14'>
        <div className='w-full'>
          <h5 className="h5">Product Name</h5>
          <input onChange={(e)=>setName(e.target.value)} value={name} type='text' placeholder='Write here...' className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-xl' />
        </div>
        <div className='w-full'>
          <h5 className="h5">Product Description</h5>
          <textarea rows={5} onChange={(e)=>setDescription(e.target.value)} value={description} type='text' placeholder='Write here...' className='px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-xl' />
        </div>
        <div>
          <div className='flex gap-4'>
            <div>
              <h5 className="h5">Product Price</h5>
              <input onChange={(e) => setPrice(e.target.value)} value={price} type='number' placeholder='10' className='px-3 py-2 ring-1 ring-slate-900/10 rounded bg-white mt-1 max-w-24' />
            </div>
            <div>
              <h5 className="h5">Offer Price</h5>
              <input onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice} type='number' placeholder='10' className='px-3 py-2 ring-1 ring-slate-900/10 rounded bg-white mt-1 max-w-24' />
            </div>
          </div>
        </div>
        <div className='w-full max-w-3xl rounded-xl bg-white/60 p-4 ring-1 ring-slate-900/10'>
          <div className='flexStart gap-2'>
            <FiTag className='text-secondary' />
            <h5 className='h5'>Genres *</h5>
            <span className='text-xs text-secondary'>({selectedGenres.length})</span>
          </div>
          <div ref={genreDropdownRef} className='relative mt-3 max-w-xl'>
            <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              value={genreQuery}
              onChange={(event) => {
                setGenreQuery(event.target.value)
                setShowGenreDropdown(true)
              }}
              onFocus={() => setShowGenreDropdown(true)}
              onClick={() => setShowGenreDropdown(true)}
              type='text'
              placeholder='Search genres...'
              className='w-full rounded-lg bg-white px-9 py-2 outline-none ring-1 ring-slate-900/10'
            />
            {showGenreDropdown && (
              <div className='absolute left-0 right-0 top-12 z-20 max-h-56 overflow-y-auto rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-900/10'>
                {filteredGenres.length === 0 ? (
                  <p className='px-3 py-2'>No matching genres found.</p>
                ) : filteredGenres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.name)

                  return (
                    <button
                      key={genre.name}
                      type='button'
                      onClick={() => {
                        toggleGenre(genre.name)
                        setShowGenreDropdown(false)
                        setGenreQuery("")
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
          {selectedGenres.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-2 rounded-xl bg-primary p-3'>
              {selectedGenres.map((genre) => (
                <button
                  key={genre}
                  type='button'
                  onClick={() => toggleGenre(genre)}
                  className='flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-white'
                >
                  {genre}
                  <FiX />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className='w-full max-w-3xl rounded-xl bg-white/60 p-4 ring-1 ring-slate-900/10'>
          <div className='flexStart gap-2'>
            <FiTag className='text-secondary' />
            <h5 className='h5'>Subgenres</h5>
            <span className='text-xs text-secondary'>({selectedSubgenrePaths.length})</span>
          </div>
          {selectedGenres.length === 0 ? (
            <p className='mt-3 rounded-xl bg-primary p-4'>Select at least one genre first to add subgenres.</p>
          ) : (
            <>
              <div ref={subgenreDropdownRef} className='relative mt-3 max-w-xl'>
                <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                <input
                  value={subgenreQuery}
                  onChange={(event) => {
                    setSubgenreQuery(event.target.value)
                    setShowSubgenreDropdown(true)
                  }}
                  onFocus={() => setShowSubgenreDropdown(true)}
                  onClick={() => setShowSubgenreDropdown(true)}
                  type='text'
                  placeholder='Search subgenres from selected genres...'
                  className='w-full rounded-lg bg-white px-9 py-2 outline-none ring-1 ring-slate-900/10'
                />
                {showSubgenreDropdown && (
                  <div className='absolute left-0 right-0 top-12 z-20 max-h-56 overflow-y-auto rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-900/10'>
                    {filteredSubgenres.length === 0 ? (
                      <p className='px-3 py-2'>No matching subgenres found.</p>
                    ) : filteredSubgenres.map((subgenre) => {
                      const isSelected = selectedSubgenrePaths.includes(subgenre.path)

                      return (
                        <button
                          key={subgenre.path}
                          type='button'
                          onClick={() => {
                            toggleSubgenrePath(subgenre.path)
                            setShowSubgenreDropdown(false)
                            setSubgenreQuery("")
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
              {selectedSubgenrePaths.length > 0 && (
                <div className='mt-3 flex flex-wrap gap-2 rounded-xl bg-primary p-3'>
                  {selectedSubgenrePaths.map((path) => (
                    <button
                      key={path}
                      type='button'
                      onClick={() => toggleSubgenrePath(path)}
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
        <div className='grid w-full max-w-3xl gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          <div>
            <h5 className='h5'>Author</h5>
            <input onChange={(e)=>setAuthor(e.target.value)} value={author} type='text' placeholder='Author name' className='mt-2 w-full rounded bg-white px-3 py-2 ring-1 ring-slate-900/10 outline-none' />
          </div>
          <div>
            <h5 className='h5'>Publisher</h5>
            <input onChange={(e)=>setPublisher(e.target.value)} value={publisher} type='text' placeholder='Publisher' className='mt-2 w-full rounded bg-white px-3 py-2 ring-1 ring-slate-900/10 outline-none' />
          </div>
          <div>
            <h5 className='h5'>Language</h5>
            <div ref={languageDropdownRef} className='relative mt-2'>
              <button
                type='button'
                onClick={() => setShowLanguageDropdown((value) => !value)}
                className='w-full rounded bg-white px-3 py-2 text-left ring-1 ring-slate-900/10 outline-none'
              >
                {language}
              </button>
              {showLanguageDropdown && (
                <div className='absolute left-0 right-0 top-12 z-20 max-h-64 overflow-y-auto rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-900/10'>
                  {languageOptions.map((option) => (
                    <button
                      key={option}
                      type='button'
                      onClick={() => {
                        setLanguage(option)
                        setShowLanguageDropdown(false)
                      }}
                      className={`block w-full rounded-lg px-3 py-2 text-left hover:bg-primary ${language === option ? 'bg-secondary text-white hover:bg-secondary' : ''}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* IMAGES */}
        <div className='mt-2'>
          <div className='flexStart gap-2'>
            <h5 className="h5">Product Images</h5>
            {aiLoading && <span className='rounded-full bg-white px-3 py-1 text-xs text-secondary'>AI analyzing image...</span>}
          </div>
          <div className='flex gap-2 mt-2'>
          {Array(4).fill("").map((_, index)=>(
            <label key={index} htmlFor={`image${index}`} className='ring-1 ring-slate-900/10 overflow-hidden rounded'>
              <input onChange={(e) => onImageChange(e, index)} 
                type='file' 
                accept='image/*'
                id={`image${index}`} 
                hidden
                />
                <img src={
                  files[index] ? URL.createObjectURL(files[index]) : upload_icon
                } alt="uploadArea" height={67} width={67} className='bg-white overflow-hidden aspect-square object-cover' />
            </label>
          ))}
          </div>
        </div>
        <div className='flexStart gap-2 my-2'>
          <input onChange={()=>setPopular(prev=>!prev)} checked={popular} type='checkbox' id='popular' />
          <label htmlFor='popular' className='cursor-pointer'>Add to Popular</label>
        </div>
        <button type="submit" disabled={aiLoading} className='btn-dark mt-3 max-w-44 sm:w-full rounded disabled:cursor-not-allowed disabled:opacity-60'>{aiLoading ? "Analyzing..." : "Add Product"}</button>
      </form>
    </div>
  )
}

export default AddProduct
