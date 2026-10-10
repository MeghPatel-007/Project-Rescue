import React from 'react'
import Image from 'next/image'

export default function NotFoundPage() {
  return (
    <div className='h-screen flex  justify-center items-center'>
        <Image src="/notfound.png" className='' alt='notfound' width={500} height={500} />
    </div>
  )
}
