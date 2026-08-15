import React, { useEffect, useRef } from 'react'
import { buildPhotostrip } from '../utils/canvasUtils'

export default function StripCanvas({shots=[], template, filter='none', onDone, isPreview=false}){
  const canvasRef = useRef(null)

  useEffect(()=>{
    const canvas = canvasRef.current
    buildPhotostrip(canvas, shots, template, filter).then(()=>{
      if(onDone){
        canvas.toBlob(blob=>{
          const url = URL.createObjectURL(blob)
          onDone(url)
        }, 'image/jpeg', 0.95)
      }
    })
  },[shots, template, filter])

  return (
    <div className="mt-4">
      <canvas ref={canvasRef} style={{width: isPreview? '240px':'100%', height: 'auto', maxWidth: 360, borderRadius: 12}} />
    </div>
  )
}
