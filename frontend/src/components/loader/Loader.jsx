import React from 'react'
import './loader.css'

const Loader = () => {
  return (
    <div id='loader' className=' absolute top-0 left-0 z-50 h-screen w-screen flex items-center justify-center bg-gray-900'>
        <div className="loader"></div>
    </div>
  )
}

export default Loader