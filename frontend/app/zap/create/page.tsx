"use client"

import { BACKEND_URL } from "@/app/config";
import { useEffect, useState } from "react"
import axios from "axios";
import { useRouter } from "next/navigation";



function useAvailableActionsAndTriggers(){
    
    const [avaialbleAction,setAvaialbleAction]=useState();
    const [avaialbleTrigger,setAvaialbleTrigger]=useState();


    useEffect(()=>{
        axios.get(`${BACKEND_URL}/api/v1/triggers`)
            .then((x)=>setAvaialbleTrigger(x.data.avaialbleTrigger));
        axios.get(`${BACKEND_URL}/api/v1/actions`)
            .then((x)=>setAvaialbleAction(x.data.avaialbleAction));
    },[])

    return {
        avaialbleAction,
        avaialbleTrigger,    
    }
}


export default function(){
    const router=useRouter();
    const {avaialbleAction,avaialbleTrigger} =useAvailableActionsAndTriggers();
    const [selectedTrigger,setSelectedTrigger]=useState<{
        index:number,
        availableActionId: string;
        availableActionName: string;
        metadata: any;
    }[]>([]);

    const [selectedModalIndex,useSelectedModalIndex]=useState<null | number>(null)

    
}