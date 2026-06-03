import { createContext } from 'react'

export const themes = [
  { id: 'light', label: 'Light', description: 'Clean and airy', colors: ['#ffffff', '#e7f2f3', '#ac81fd'] },
  { id: 'dark', label: 'Velvet Noir', description: 'Soft cinematic dark', colors: ['#17131f', '#2d2438', '#f08ab8'] },
  { id: 'sepia', label: 'Sepia', description: 'Warm reading room', colors: ['#fbf4e8', '#f1e3cd', '#a66b46'] },
  { id: 'midnight', label: 'Aurora Night', description: 'Teal and coral glow', colors: ['#081b1d', '#143235', '#ff9f80'] },
  { id: 'blush', label: 'Blush Story', description: 'Fresh and playful', colors: ['#fff5f7', '#ffe1ea', '#ef5da8'] },
  { id: 'forest', label: 'Meadow Mint', description: 'Calm book garden', colors: ['#f4fbf5', '#dff3e3', '#2f9e7e'] },
]

export const ThemeContext = createContext()
