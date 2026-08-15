import React from 'react'

export default function DownloadButton({shots=[], template, filter, finalBlobUrl}){
  const handleDownload = async ()=>{
    if(finalBlobUrl){
      // use existing blob url produced by preview
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = finalBlobUrl
      a.download = `photostrip_${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      setTimeout(()=>{ document.body.removeChild(a) }, 100)
      return
    }

    // fallback: rebuild canvas and download
    const canvas = document.createElement('canvas')
    const { buildPhotostrip } = await import('../utils/canvasUtils')
    await buildPhotostrip(canvas, shots, template, filter)
    canvas.toBlob(blob=>{
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `photostrip_${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      setTimeout(()=>{
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    }, 'image/jpeg', 0.95)
  }

  return (
    <div className="mt-4 flex gap-2 items-center">
      <button className="px-4 py-2 bg-indigo-200 rounded-xl" onClick={handleDownload}>Download as JPG</button>
    </div>
  )
}
