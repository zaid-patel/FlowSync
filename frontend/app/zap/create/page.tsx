"use client";

import { BACKEND_URL } from "@/app/config";
import { AppBar } from "@/components/AppBar";
import { Input } from "@/components/Input";
import { ZapCell } from "@/components/ZapCell";
import  LinkButton  from "@/components/buttons/LinkButton";
import  {PrimaryButton}  from "@/components/buttons/PrimaryBtn";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function useAvailableActionsAndTriggers() {
    const [availableActions, setAvailableActions] = useState([]);
    const [availableTriggers, setAvailableTriggers] = useState([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/trigger/available`)
            .then(x => setAvailableTriggers(x.data.availableTriggers))

        axios.get(`${BACKEND_URL}/api/v1/actions/available`)
            .then(x => setAvailableActions(x.data.availableActions))
    }, [])

    return {
        availableActions,
        availableTriggers
    }
}

export default function() {
    const router = useRouter();
    const { availableActions, availableTriggers } = useAvailableActionsAndTriggers();
    const [selectedTrigger, setSelectedTrigger] = useState<{
        id: string;
        name: string;
    }>();

    const [selectedActions, setSelectedActions] = useState<{
        index: number;
        availableActionId: string;
        availableActionName: string;
        metadata: any;
    }[]>([]);
    const [selectedModalIndex, setSelectedModalIndex] = useState<null | number>(null);

    return <div>
        <AppBar />
        <div className="flex justify-end bg-slate-200 p-4">
            <PrimaryButton onClick={async () => {
                if (!selectedTrigger?.id) {
                    return;
                }

                const response = await axios.post(`${BACKEND_URL}/api/v1/zap`, {
                    "availableTriggerId": selectedTrigger.id,
                    "triggerMetadata": {},
                    "actions": selectedActions.map(a => ({
                        availableActionId: a.availableActionId,
                        actionMetadata: a.metadata
                    }))
                }, {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                })
                
                router.push("/dashboard");

            }}>Publish</PrimaryButton>
        </div>
        <div className="w-full min-h-screen bg-slate-200 flex flex-col justify-center">
            <div className="flex justify-center w-full">
                <ZapCell onClick={() => {
                    setSelectedModalIndex(1);
                }} name={selectedTrigger?.name ? selectedTrigger.name : "Trigger"} index={1} />
            </div>
            <div className="w-full pt-2 pb-2">
                {selectedActions.map((action, index) => <div key={index} className="pt-2 flex justify-center"> <ZapCell onClick={() => {
                    setSelectedModalIndex(action.index);
                }} name={action.availableActionName ? action.availableActionName : "Action"} index={action.index} /> </div>)}
            </div>
            <div className="flex justify-center">
                <div>
                    <PrimaryButton onClick={() => {
                        setSelectedActions(a => [...a, {
                            index: a.length + 2,
                            availableActionId: "",
                            availableActionName: "",
                            metadata: {}
                        }])
                    }}><div className="text-2xl">
                        +
                    </div></PrimaryButton>
                </div>
            </div>
        </div>
        {selectedModalIndex && <Modal availableItems={selectedModalIndex === 1 ? availableTriggers : availableActions} onSelect={(props: null | { name: string; id: string; metadata: any; }) => {
            if (props === null) {
                setSelectedModalIndex(null);
                return;
            }
            if (selectedModalIndex === 1) {
                setSelectedTrigger({
                    id: props.id,
                    name: props.name
                })
            } else {
                setSelectedActions(a => {
                    let newActions = [...a];
                    newActions[selectedModalIndex - 2] = {
                        index: selectedModalIndex,
                        availableActionId: props.id,
                        availableActionName: props.name,
                        metadata: props.metadata
                    }
                    return newActions
                })
            }
            setSelectedModalIndex(null);
        }} index={selectedModalIndex} />}
    </div>
}

function Modal({ index, onSelect, availableItems }: { index: number, onSelect: (props: null | { name: string; id: string; metadata: any; }) => void, availableItems: {id: string, name: string, image: string;}[] }) {
    const [step, setStep] = useState(0);
    const [selectedAction, setSelectedAction] = useState<{
        id: string;
        name: string;
    }>();
    const isTrigger = index === 1;

    return <div className="fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-slate-100 bg-opacity-70 flex">
        <div className="relative p-4 w-full max-w-2xl max-h-full">
            <div className="relative bg-white rounded-lg shadow ">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
                    <div className="text-xl">
                        Select {index === 1 ? "Trigger" : "Action"}
                    </div>
                    <button onClick={() => {
                        onSelect(null);
                    }} type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center" data-modal-hide="default-modal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-4 md:p-5 space-y-4">
                    {step === 1 && selectedAction?.id === "email" && <EmailSelector setMetadata={(metadata) => {
                        onSelect({
                            ...selectedAction,
                            metadata
                        })
                    }} />}

                    {(step === 1 && selectedAction?.id === "send-sol") && <SolanaSelector setMetadata={(metadata) => {
                        onSelect({
                            ...selectedAction,
                            metadata
                        })
                    }} />}
                     {(step === 1 && selectedAction?.id === "notion") && <NotionSelector setMetadata={(metadata) => {
                        onSelect({
                            ...selectedAction,
                            metadata
                        })
                    }} />}

                    {step === 0 && <div>{availableItems.map(({id, name, image},index:number) => {
                            return <div  key={index} onClick={() => {
                                if (isTrigger) {
                                    onSelect({
                                        id,
                                        name,
                                        metadata: {}
                                    })
                                } else {
                                    setStep(s => s + 1);
                                    setSelectedAction({
                                        id,
                                        name
                                    })
                                }
                            }} className="flex border p-4 cursor-pointer hover:bg-slate-100">
                                <img src={image} width={30} className="rounded-full" /> <div className="flex flex-col justify-center"> {name} </div>
                            </div>
                        })}</div>}                    
                </div>
            </div>
        </div>
    </div>

}

function EmailSelector({setMetadata}: {
    setMetadata: (params: any) => void;
}) {
    const [email, setEmail] = useState("");
    const [body, setBody] = useState("");

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setEmail(e.target.value)}></Input>
        <Input label={"Body"} type={"text"} placeholder="Body" onChange={(e) => setBody(e.target.value)}></Input>
        <div className="pt-2">
            <PrimaryButton onClick={() => {
                setMetadata({
                    email,
                    body
                })
            }}>Submit</PrimaryButton>
        </div>
    </div>
}


function NotionSelector({setMetadata}: {
    
    setMetadata: (params: any) => void;
}) {
    const [pageId, setPageId] = useState("");
    const [body, setBody] = useState("");
    const [isDatabase,setIsDatabase]=useState(false);
    const token=localStorage.getItem('token');

    return <div>
        <Input label={"Page id (from notion)"} type={"text"} placeholder="To" onChange={(e) => setPageId(e.target.value)}></Input>
        <Input label={"Body"} type={"text"} placeholder="Body" onChange={(e) => setBody(e.target.value)}></Input>
        <Input label={"Is Database?"} type={"text"} placeholder="true/false" onChange={(e) => setIsDatabase(e.target.value==="true")}></Input>

        <div className="pt-2">
            <PrimaryButton onClick={() => {
                setMetadata({
                    pageId,
                    body,
                    isDatabase,
                })
            }}>Submit</PrimaryButton>
            <LinkButton onClick={() => {
                  const width = 500, height = 600;
                      const left = (window.innerWidth - width) / 2;
              const top = (window.innerHeight - height) / 2;
              const state = JSON.stringify({ token, pageId });
            //   const encodedState = encodeURIComponent(state);
              
              window.open(
                `https://api.notion.com/v1/oauth/authorize?client_id=19bd872b-594c-80b9-b80f-0037ad077307&response_type=code&owner=user&redirect_uri=https%3A%2F%2Fa133-103-59-202-209.ngrok-free.app%2Fauth%2Fnotion%2F&state=${state}`,
                "NotionAuth",
                `width=${width},height=${height},top=${top},left=${left}`
              );
                    }}>
                           Give access to page with id: {pageId}
            </LinkButton>

        </div>
    </div>
}

function SolanaSelector({setMetadata}: {
    setMetadata: (params: any) => void;
}) {
    const [amount, setAmount] = useState("");
    const [address, setAddress] = useState("");    

    return <div>
        <Input label={"To"} type={"text"} placeholder="To" onChange={(e) => setAddress(e.target.value)}></Input>
        <Input label={"Amount"} type={"text"} placeholder="To" onChange={(e) => setAmount(e.target.value)}></Input>
        <div className="pt-4">
        <PrimaryButton onClick={() => {
            setMetadata({
                amount,
                address
            })
        }}>Submit</PrimaryButton>
      
         

        </div>
    </div>
}