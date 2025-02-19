"use client"
import axios from "axios";
import { log } from "console";
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react";


export default function() {
    const router=useRouter();
    const searchParams=useSearchParams();
    
    
    useEffect(()=>{
       
        const addCode=async ()=>{
            const code=searchParams.get('code'); 
            const stateString = searchParams.get('state');
                        // @ts-ignore
            const state = JSON.parse(stateString);
          const token = state.token;
           const pageId = state.pageId;

            console.log(token);
            if(code) await axios.post(`http://localhost:3000/api/v1/auth/notion/${code}`,{pageId},
                {
                    headers: {
                        "Authorization": token
                    }
                });
        }
        // console.log(token);
        
        addCode();
        // window.close();

    },[])

}