"use client";
import { useRouter } from "next/navigation"
import LinkButton  from "./buttons/LinkButton"
import { PrimaryButton } from "./buttons/PrimaryBtn";
import { useEffect, useState } from "react";

export const AppBar = () => {
    const router = useRouter();
    const [token,setToken]=useState<String | null>();
    useEffect(()=>{
        setToken(localStorage.getItem('token'));
    },[])
    return <div className="flex border-b justify-between p-4">
        <div className="flex flex-col justify-center text-2xl font-extrabold">
            FlowSync
        </div>
       {!token ?  
       <div className="flex">
            <div className="pr-4">
                <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
            </div>
            <div className="pr-4">
                <LinkButton onClick={() => {
                    router.push("/login")
                }}>Login</LinkButton>
            </div>
            <PrimaryButton onClick={() => {
                router.push("/signup")
            }}>
                Signup
            </PrimaryButton>            
        </div>
        : <div className="flex">
            <div className="pr-4">
                <LinkButton onClick={() => {}}>Contact Sales</LinkButton>
            </div>
           
            <PrimaryButton onClick={() => {
               localStorage.removeItem('token')
               setToken(null)
            }}>
                Logout
            </PrimaryButton>            
        </div>}
    </div>
}