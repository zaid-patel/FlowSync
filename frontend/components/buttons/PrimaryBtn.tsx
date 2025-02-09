import React, { ReactNode } from 'react'

function PrimaryBtn({
    children,
    onClick,
    size="small",

}:{
    children:ReactNode,
    onClick:()=>void,
    size?:"big" | "small",
}) {
  return (
    <div className={`${size=="small"?"text-sm":"text-xl" }   ${size=="small"?"px-4 py-2 ":"px-8 py-10" }  bg-amber-700 flex justify-center items-center text-white `} onClick={onClick}>
      {children}
    </div>
  )
}

export default PrimaryBtn
