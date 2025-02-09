import React, { ReactNode } from 'react'

function LinkButton({
    children,
    onClick,

}:{
    children:ReactNode,
    onClick:()=>void
}) {
  return (
    <div className='px-4 py-2 hover:bg-slate-300  cursor-pointer' onClick={onClick}>
      {children}
    </div>
  )
}

export default LinkButton
