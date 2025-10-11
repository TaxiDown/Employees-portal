import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { CirclePlus } from 'lucide-react';
import SuccessModal from './modal';

export default function AddDrive() {
    const [email, setEmail] = useState("");
    const [firstName, setfirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setconfirmPassword] = useState("");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [validations, setValidations] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [message,setMessage] = useState("")

    const validateEmail = () => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        setInvalidEmail(!regex.test(email));
        return regex.test(email);
    };

    /*const validatePassword = (password) => {
        setValidations({
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
        return validations.length && validations.lowercase && validations.uppercase && validations.number && validations.special
    };*/

    const handleSubmit = async(e)=>{
        e.preventDefault();
        if (!validateEmail())
            return;
        const response = await fetch(`/api/create_driver/`,{
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: email, first_name: firstName, last_name: lastName }),
        })
        if(response.status === 201){
            setMessage("Driver added!")
            window.location.reload();
        }else if(response.status === 400){

        }else{
            console.log("clmckmvklf")
        }
    }

  return (
    <Dialog>
            {
                showSuccess && 
                <SuccessModal type={'driver'} />
            }
            <DialogTrigger asChild>
                <button className="hover:text-orange-700 hover:bg-white cursor-pointer text-orange-500 bg-white text-lg font-medium flex items-center gap-2">
                    <CirclePlus size={17} strokeWidth={2.5}/> Add Driver
                </button>
            </DialogTrigger>

            <DialogContent aria-describedby={undefined} className={"w-max h-max"}>
                <DialogHeader>
                    <DialogTitle className={"text-2xl ml-5"}>Add Driver</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                <div className='flex flex-col gap-2 mx-7 mb-5'>
                    <div className='flex gap-2'>
                        <div className='flex flex-col'>
                            <label htmlFor='fname' className='ml-2 text-sm'>First Name*</label>
                            <input id='fname' value={firstName} onChange={(e)=>{setfirstName(e.target.value)}} className='outline-none w-39 h-8 rounded-sm px-4 py-4 border-2 border-gray-200 focus:border-neutral-600 valid:border-neutral-600' required/>
                        </div>
                        <div className='flex flex-col'>
                            <label htmlFor='lname' className='ml-2 text-sm'>Last Name*</label>
                            <input id='lname' value={lastName} onChange={(e)=>{setLastName(e.target.value)}} className='outline-none w-39 h-8 rounded-sm px-4 py-4 border-2 border-gray-200 focus:border-neutral-600 valid:border-neutral-600' required/>
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        <label htmlFor='email' className='ml-2 text-sm'>Email*</label>
                        <input id='email' value={email} onChange={(e)=>{setEmail(e.target.value)}} className={`outline-none w-80 h-8 rounded-sm px-4 py-4 border-2 border-gray-200 focus:border-neutral-600 valid:border-neutral-600`} required/>
                        
                        {invalidEmail &&
                            <p className='text-center text-md text-red-500'>Invalid Email</p>
                        }                    
                    </div>
                    {/*<div className='flex flex-col'>
                        <label htmlFor='password' className='ml-2 text-sm'>Password*</label>
                        <input id='password' value={password} onChange={(e)=>{setPassword(e.target.value); validatePassword();}} className='outline-none w-80 h-8 rounded-sm px-4 py-4 border-2 border-gray-200 focus:border-neutral-600 valid:border-neutral-600' required/>
                    </div>
                    {!Object.values(validations).every(Boolean) ?
                        <>
                        {password && 
                        <ul className='alert-container  list-none p-0 mt-[-10px] mr-[15px] mb-[10px] ml-[15px]'>
                        <li className={`${validations.length ? "true" : "false"} pl-[23px] block text-center text-[13px]`}>Must be at least 8 characters long</li>
                        <li className={`${validations.uppercase ? "true" : "false"} pl-[23px] block text-center text-[13px]`}>Includes at least one uppercase</li>
                        <li className={`${validations.lowercase ? "true" : "false"} pl-[23px] block text-center text-[13px]`}>Includes at least one lowercase</li>
                        <li className={`${validations.number ? "true" : "false"} pl-[23px] block text-center text-[13px]`}>Contains numbers</li>
                        <li className={`${validations.special ? "true" : "false"} pl-[23px] block text-center text-[13px]`}>special characters</li>
                        </ul>}
                        </>:
                    <div className='flex flex-col'>
                        <label htmlFor='confirm' className='ml-2 text-sm'>Confirm Password*</label>
                        <input id='confirm' value={confirmPassword} onChange={(e)=>{setconfirmPassword(e.target.value)}} className='outline-none w-80 h-8 rounded-sm px-4 py-4 border-2 border-gray-200 focus:border-neutral-600 valid:border-neutral-600' required/>
                    </div>
                    }*/}

                    {message && 
                    <div className='text-lg text-green-500 font-semibold text-center w-full'>{message}</div>
                    }
                </div>
                <DialogFooter >
                    <DialogClose asChild>
                        <button className='cursor-pointer bg-white text-neutral-800 border-2 border-neutral-500 rounded-lg px-3 py-1 hover:bg-neutral-200'>Cancel</button>
                    </DialogClose>
                    <button type='submit' className='cursor-pointer bg-orange-500 text-white rounded-lg px-5 py-2 hover:bg-orange-600'>Save</button>
            </DialogFooter>
            </form>
            </DialogContent>
            
    </Dialog>
  )
}
