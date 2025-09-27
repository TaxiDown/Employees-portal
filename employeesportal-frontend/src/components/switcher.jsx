"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"

const languages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  {
    code: "es",
    name: "Español",
    nativeName: "Español",
    flag: "🇪🇸",
  },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentLocale, setCurrentLocale] = useState("en")
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const locale = pathSegments[0]

    if (locale && languages.some((lang) => lang.code === locale)) {
      setCurrentLocale(locale)
    } else {
      setCurrentLocale("en")
    }
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const switchLanguage = (newLocale) => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const currentPathLocale = pathSegments[0]

    let newPath

    if (languages.some((lang) => lang.code === currentPathLocale)) {
      pathSegments[0] = newLocale
      newPath = "/" + pathSegments.join("/")
    } else {
      newPath = "/" + newLocale + pathname
    }

    setIsOpen(false)
    router.push(newPath)
  }

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0]

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="text-black flex items-center gap-1 md:gap-2 md:px-3 md:py-2 px-1 py-0 bg-transperent border border-black rounded-lg cursor-pointer text-sm md:text-lg font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:bg-white md:h-[37px] h-[30px]"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="md:w-4 md:h-4 w-3 h-3 stroke-2" viewBox="0 0 24 24" fill="none" stroke="black">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="flex items-center gap-1.5">
          <div className="text-black ">{currentLanguage.flag}</div>
        </span>
        <svg
          className={`w-4 h-4 stroke-3 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="black"
        >
          <polyline points="6,9 12,15 18,9" className="text-black"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 sm:right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[100px] z-50 animate-in slide-in-from-top-2 duration-200">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`flex items-center gap-3 w-full px-4 py-3 bg-transparent border-none cursor-pointer text-sm text-left transition-colors duration-200 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                currentLocale === language.code ? "bg-white text-black" : "text-gray-700"
              }`}
              onClick={() => switchLanguage(language.code)}
            >
              <span className="text-base">{language.flag}</span>
              <div className="flex flex-col flex-1">
                <span className="font-medium leading-tight">{language.nativeName}</span>
                <span className="text-xs text-gray-500 leading-tight">{language.name}</span>
              </div>
              {currentLocale === language.code && (
                <svg className="w-4 h-4 stroke-2 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
