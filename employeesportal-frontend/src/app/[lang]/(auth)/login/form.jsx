'use client'
import React, { useState, Suspense } from 'react'
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import {useTranslations} from 'next-intl';

export default function Loginform({loginTitle, dontHaveAccount, createAccount, forgotPassword, pass, em, lang, onSuccess, submit}) {
    const t = useTranslations('login');
    const router = useRouter();
    const [code, setCode] = useState(0)
    const [response, setresponse] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
   
    
    const onSubmit = async(e) =>{
        e.preventDefault();
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: email, password: password }),
        });
        setCode(response.status);
        switch (response.status) {
            case 200 :

              if(onSuccess){
                onSuccess();
                const fakeEvent = { preventDefault: () => {} };
                submit(fakeEvent);
              }
              else{
                setTimeout(() => {
                setresponse('Logged in successfully!');
                router.push(`/`);
              }, 3000);
              } 
              
              break;
      
            case 401 :
              setresponse('Missing fields');
              break;
      
            case 400 :
              setresponse('Invalid credentials');
              break;
      
            case 404 :
              setresponse('🚫 API not found (404). Check your route.');
              break;
      
            case 500 :
              setresponse(`Invalid credentials`);
              break;
      
            default:
              break;
          }
    }
  return (
    <form onSubmit={onSubmit} className='flex items-right justify-center flex-col'>
        <div className='relative mb-[20px]'>
            <input type="text" 
                onChange = {(e) => {setEmail(e.target.value);
                  setresponse('');
                }}
                value = {email}
                id="email"
                className='peer appearance-none bg-[#fcfcfa] border border-[#9ca1a7] 
                rounded-md text-[#2d333a] text-base h-[40px] leading-[1.1] 
                px-4 transition duration-200 ease-in-out py-5
                focus:outline-none focus:border-[#b98800]
                valid:border-black
                w-80 max-w-[85vw] inline-block text-start'
                required
            />
            <label htmlFor="email" className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2d333a] text-base 
                    transition-all duration-200 ease-in-out 
                    peer-focus:text-sm peer-focus:top-0 peer-focus:left-[10px] peer-focus:text-[#bc8a00] peer-focus:bg-[#fcfcfa] peer-focus:rounded-t-sm peer-focus:px-1
                    peer-valid:text-sm peer-valid:top-0 peer-valid:left-[10px] peer-valid:text-[#bc8a00] peer-valid:bg-[#fcfcfa] peer-valid:rounded-t-sm peer-valid:px-1"
            >{t("email")}*</label>
        </div>
        
        <div className='relative mb-[20px]'>
            <input type={showPassword ? "text" : "password"} 
                onChange = {(e) => {setPassword(e.target.value);
                setresponse('');
              }}
                value = {password}
                id="password"
                className='peer appearance-none bg-[#fcfcfa] border border-[#9ca1a7] 
                    rounded-md text-[#2d333a] text-base h-[40px] leading-[1.1] 
                    px-4 transition duration-200 ease-in-out py-5
                    focus:outline-none focus:border-[#b98800] 
                    valid:border-black
                    w-80 max-w-[85vw] inline-block text-start'
                required
            />
            <label htmlFor="password" className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2d333a] text-base 
                    transition-all duration-200 ease-in-out 
                    peer-focus:text-sm peer-focus:top-0 peer-focus:left-[10px] peer-focus:text-[#bc8a00] peer-focus:bg-[#fcfcfa] peer-focus:rounded-t-sm peer-focus:px-1
                    peer-valid:text-sm peer-valid:top-0 peer-valid:left-[10px] peer-valid:text-[#bc8a00] peer-valid:bg-[#fcfcfa] peer-valid:rounded-t-sm peer-valid:px-1"
            >{t("password")}*</label>
            {password && 
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className='cursor-pointer text-black right-3 top-2 absolute'
                >
                    {showPassword ? <EyeOff style={{width:'22px'}} className=""/> : <Eye style={{width:'22px'}}/>}
                </button>
            }
        </div>
        <div className='flex items-center justify-center flex-col'>
          <Link href='/forgot_password' className=' cursor-pointer w-full text-right text-[13px] mb-1 mt-[-15px] px-2 text-neutral-900 hover:text-yellow-600'>{t("forgotPassword")}</Link>
          <button type="submit" className={email && password ? 'cursor-pointer bg-black text-white rounded-sm text-[19px] w-25 h-12 transition-transform duration-300 hover:scale-103 hover:bg-white hover:border-2 hover:border-black hover:text-black mb-3 mt-1 min-w-max px-3' : 'cursor-not-allowed bg-[#ddd] text-[#888] rounded-sm text-[19px] w-25 h-12 border-2 border-[#ccc] mb-2 mt-1 min-w-max px-3'}>
          {t("loginTitle")}
          </button>
        </div>
        {response &&
          <div className={`mt-3 text-[18px] whitespace-pre-line ${
            code == 200 ? 'text-green-500' : 'text-red-500'
          }`}>{response}</div>
        }
        
    </form>
  )
}
