import React, { useEffect, useState } from 'react'
import { ThemeContext, themes } from './theme'

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('booklovers-theme')
  return themes.some(({ id }) => id === savedTheme) ? savedTheme : 'light'
}

const ThemeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('booklovers-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContextProvider
