import React, { useContext, useEffect, useRef, useState } from 'react'
import { IoCheckmark, IoColorPaletteOutline } from 'react-icons/io5'
import { ThemeContext } from '../context/theme'

const ThemeSelector = () => {
  const { theme, setTheme, themes } = useContext(ThemeContext)
  const [isOpen, setIsOpen] = useState(false)
  const themeSelectorRef = useRef(null)

  useEffect(() => {
    if(!isOpen) return

    const closeThemeSelector = () => setIsOpen(false)

    const handlePointerDown = (event) => {
      if(themeSelectorRef.current && !themeSelectorRef.current.contains(event.target)){
        closeThemeSelector()
      }
    }

    const handleKeyDown = (event) => {
      if(event.key === 'Escape'){
        closeThemeSelector()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={themeSelectorRef} className='relative'>
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        className='theme-icon-button'
        aria-label='Choose a theme'
        aria-expanded={isOpen}
      >
        <IoColorPaletteOutline className='text-xl' />
      </button>

      {isOpen && (
        <div className='surface-card absolute right-0 top-12 z-50 w-64 rounded-xl p-3 shadow-xl ring-1 ring-slate-900/10'>
          <div className='px-2 pb-2'>
            <h3 className='bold-16'>Theme</h3>
            <p>Choose your reading atmosphere.</p>
          </div>
          <div className='grid gap-1'>
            {themes.map(({ id, label, description, colors }) => (
              <button
                key={id}
                type='button'
                onClick={() => {
                  setTheme(id)
                  setIsOpen(false)
                }}
                className={`theme-option ${theme === id ? 'theme-option-active' : ''}`}
              >
                <span className='flex -space-x-1'>
                  {colors.map((color) => (
                    <span key={color} className='h-5 w-5 rounded-full ring-1 ring-black/10' style={{ backgroundColor: color }} />
                  ))}
                </span>
                <span className='flex-1 text-left'>
                  <span className='block medium-14'>{label}</span>
                  <span className='block text-xs opacity-70'>{description}</span>
                </span>
                {theme === id && <IoCheckmark className='text-secondary' />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeSelector
