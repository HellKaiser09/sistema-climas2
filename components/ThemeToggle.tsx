"use client"

import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Aplicar tema guardado al cargar
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#000000' // negro puro
      document.body.style.color = '#ffffff' // blanco puro
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#ffffff' // blanco puro
      document.body.style.color = '#000000' // negro puro
      setIsDark(false)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#000000'
      document.body.style.color = '#ffffff'
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#ffffff'
      document.body.style.color = '#000000'
      localStorage.setItem('theme', 'light')
    }
  }

  // Evitar hidratación mismatch
  if (!mounted) {
    return (
      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white w-10 h-10">
        <div className="w-[18px] h-[18px]" />
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}