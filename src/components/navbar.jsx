'use client'
import {React, useState, useEffect} from 'react'
import Link from 'next/link'
import { Menu, X } from "lucide-react"
import LanguageSwitcher from './switcher';
import {useTranslations} from 'next-intl';


export default function Navbar({role}) {
  const dict = useTranslations('lang');
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedOut, setLogedOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const name = process.env.NEXT_PUBLIC_NAME

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/validate_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
  
        if (response.status === 200) {
          const data = await response.json();
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      } catch (err) {
        setLoggedIn(false);
      }
    };
  
    fetchData();
  }, []);

  const logout = async () =>{
    try{
        const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        });
        if (response.ok) {
          setLogedOut(true);
          setTimeout(() => {
            setLogedOut(false);
            window.location.reload();
          }, 3000);
        }
    }catch(err){
    }
  }
  
  return (
    <>{
      loggedOut && 
      <div className="fixed inset-0 top-0 left-0 z-50 flex items-center justify-center bg-black/50 h-full w-screen">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full h-30 flex items-center justify-center">
          <h2 className="text-green-600 text-xl font-semibold mb-2">{dict("LogoutSuccessful")}</h2>
        </div>
      </div>
    }
    <div className={`text-black lg:h-13  flex justify-between  items-center md:pl-10 md:pr-10 pr-3 pl-3 z-40 ${isMobileMenuOpen ? "bg-white" :"bg-transperent shadow-md"} backdrop-blur-sm fixed w-full z-40 top-0 left-0 h-15`}>
        <Link href={`/`} className='text-yellow-1000 md:text-[19px] text-[15px] font-medium lg:font-bold hover:text-yellow-600 hover:scale-105'> 
          <h3 className='text-[18px] md:text-[20px] font-bold'>{name}</h3>
        </Link>  
        <div className="hidden sm:flex items-center gap-2 md:gap-5 lg:gap-10">
          <Link
            href={`/`}
            className="flex items-center text-yellow-1000 text-sm md:text-[19px] font-medium lg:font-bold hover:text-yellow-600 hover:scale-105 transition-all duration-200"
          >
            {dict("bookings")}
          </Link>
          {(role === 'Fleet manager' || role === 'Super fleet manager') ?
          <Link
            href={`/drivers`}
            className="flex items-center text-yellow-1000 text-sm md:text-[19px] font-medium lg:font-bold hover:text-yellow-600 hover:scale-105 transition-all duration-200"
          >
            {dict("drivers")}
          </Link>
          :<></>}
          {loggedIn ? (
            <>
              
              <button
                onClick={logout}
                className="text-yellow-1000 text-sm md:text-[19px] font-medium lg:font-bold hover:text-yellow-600 hover:scale-105 cursor-pointer transition-all duration-200"
              >
                {dict("logoutTitle")}
              </button>
            </>
          ):
          <></>}
          
          <LanguageSwitcher />
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden text-yellow-1000 hover:text-yellow-600 transition-colors duration-200"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden fixed top-14 left-0 w-full bg-white backdrop-blur-md shadow-lg z-30">
          <div className="flex flex-col py-4 px-6 space-y-4">
            <Link
              href={`/`}
              className="text-yellow-1000 text-base font-medium hover:text-yellow-600 transition-colors duration-200 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {dict("bookings")}
            </Link>
            {(role === 'Fleet manager' || role === 'Super fleet manager') ?
            <Link
              href={`/drivers`}
              className="flex items-center text-yellow-1000 text-sm md:text-[19px] font-medium lg:font-bold hover:text-yellow-600 hover:scale-105 transition-all duration-200"
            >
              {dict("drivers")}
            </Link>
            :<></>}
            {loggedIn ? (
              <>
                <button
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-yellow-1000 text-base font-medium hover:text-yellow-600 transition-colors duration-200 text-left py-2"
                >
                  {dict("logoutTitle")}
                </button>
              </>
            ) : <></>}
            <div className="pt-2 border-t border-yellow-1000/20">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 bg-black/20 z-20 top-14" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}