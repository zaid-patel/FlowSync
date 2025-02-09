"use client"

import LinkButton from "./buttons/LinkButton"
import { useRouter } from "next/navigation";
import PrimaryBtn from "./buttons/PrimaryBtn";



export const AppBar=()=>{

    const router=useRouter();
    return <div  className="flex border-b p-4  justify-between">
        <div  className="flex flex-col justify-center">
            FlowSync 
        </div>
        <div className="flex ">
           <LinkButton onClick={()=>{}} >
              Contact-Sales 
           </LinkButton>
           <LinkButton onClick={()=>{

                router.push("/login"); 
           }} >
              Login
           </LinkButton>
                
            <PrimaryBtn onClick={()=>{
                router.push('/sign-up')
            }}>
                Sign-up 
            </PrimaryBtn>
        </div>

    </div>
}