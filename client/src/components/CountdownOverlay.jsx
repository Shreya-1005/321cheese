import React from 'react'
import { motion } from 'framer-motion'

export default function CountdownOverlay({count}){
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div key={count} initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} exit={{opacity:0}} className="text-6xl font-bold text-white drop-shadow-lg">
        {count>0?count:'Smile!'}
      </motion.div>
    </div>
  )
}
