'use client';

import React, { useState } from 'react';
import {useTranslations} from 'next-intl';


export default function ForgotClient() {
  const dict = useTranslations('confirmPassword');
  const [email, setEmail] = useState('');
  const [validEmail, setValidEmail] = useState(true);

  function isValidEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/i.test(email);
  }

  const onsubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setValidEmail(false);
      return;
    } else {
      setValidEmail(true);
    }

    const response = await fetch(`/api/forgot_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

  };

  return (
    <form
      onSubmit={onsubmit}
      className="text-black flex items-center justify-center h-screen bg-gray-100 bg-[url(/image.png)] relative"
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <div className="z-10 bg-white shadow-lg rounded-xl p-8 text-center max-w-md w-max py-13 pb-10 px-15 flex justify-center flex-col items-center gap-2">
        <h1 className="text-3xl font-bold mb-7">
          {dict("reset")}
        </h1>

        <div
          className={`relative mb-[20px] flex flex-col ${
            !validEmail ? 'red-wrapper' : ''
          }`}
        >
          <input
            type="text"
            onChange={(e) => {
              setEmail(e.target.value);
              setValidEmail(true);
            }}
            value={email}
            id="email"
            className="peer appearance-none bg-[#fcfcfa] border border-[#9ca1a7] 
                rounded-md text-[#2d333a] text-base h-[40px] leading-[1.1] 
                px-4 transition duration-200 ease-in-out py-5
                focus:outline-none focus:border-[#b98800]
                valid:border-black
                w-80 max-w-[85vw] inline-block text-start"
            required
          />
          <label htmlFor="email" className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2d333a] text-base 
                    transition-all duration-200 ease-in-out 
                    peer-focus:text-sm peer-focus:top-0 peer-focus:left-[10px] peer-focus:text-[#bc8a00] peer-focus:bg-[#fcfcfa] peer-focus:rounded-t-sm peer-focus:px-1
                    peer-valid:text-sm peer-valid:top-0 peer-valid:left-[10px] peer-valid:text-[#bc8a00] peer-valid:bg-[#fcfcfa] peer-valid:rounded-t-sm peer-valid:px-1">
            {dict("email")}*
          </label>

          {!validEmail && (
            <span className="text-center m-auto flex items-center justify-center text-red-600 w-full">
              {dict("invalid")}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={
            email
              ? 'cursor-pointer px-5 bg-black text-white rounded-sm text-[19px] w-max h-12 transition-transform duration-300 hover:scale-103 hover:bg-white hover:border-2 hover:border-black hover:text-black mb-3 mt-1'
              : 'cursor-not-allowed bg-[#ddd] text-[#888] rounded-sm text-[19px] px-5 w-max h-12 border-2 border-[#ccc] mb-2 mt-1'
          }
        >
          {dict("sendReset")}
        </button>
      </div>
    </form>
  );
}
