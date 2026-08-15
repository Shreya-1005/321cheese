import React, { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import CountdownOverlay from './CountdownOverlay'

export default function CameraCapture({template, onComplete, onCancel}){
  const webcamRef = useRef(null)
  const [capturing, setCapturing] = useState(false)
  const [shots, setShots] = useState([])
  const [count, setCount] = useState(0)
  const [showCountdown, setShowCountdown] = useState(false)
  const [error, setError] = useState(null)

  const videoConstraints = { facingMode: 'user' }

  const handleUserMediaError = (e)=>{
    console.error('webcam error', e)
    setError('Camera access denied or not available. Please allow camera or use a device with a camera.')
  }

  const startCapture = async ()=>{
    setShots([])
    setCapturing(true)
    setShowCountdown(true)
    setCount(3)
    // sequence: 3 captures at ~1s intervals after countdown
    const captured = []
    for(let i=0;i<3;i++){
      await runCountdown()
      const img = webcamRef.current.getScreenshot()
      if(img) captured.push(img)
      setShots(s => [...s, img])
      await new Promise(r=>setTimeout(r,500))
    }
    setShowCountdown(false)
    setCapturing(false)
    if(onComplete) onComplete(captured)
  }

  const runCountdown = ()=>{
    return new Promise(resolve=>{
      setShowCountdown(true)
      let n = 3
      setCount(n)
      const iv = setInterval(()=>{
        n--
        setCount(n)
        if(n<=0){ clearInterval(iv); setShowCountdown(false); setTimeout(resolve, 300); }
      },600)
    })
  }

  return (
    <div>
      <div className="rounded-lg overflow-hidden" style={{width: '100%', maxWidth: 480}}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          onUserMediaError={handleUserMediaError}
          className="w-full h-80 object-cover bg-gray-200"
        />
        {showCountdown && <CountdownOverlay count={count} />}
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      <div className="mt-3 flex gap-2">
        <button className="px-4 py-2 bg-blue-200 rounded-xl" onClick={startCapture} disabled={capturing}>Start capturing</button>
        <button className="px-4 py-2 bg-gray-200 rounded-xl" onClick={onCancel}>Cancel</button>
      </div>

      {shots.length>0 && (
        <div className="mt-3 flex gap-2">
          {shots.map((s,i)=> <img key={i} src={s} className="w-24 h-32 object-cover rounded" alt="thumb" />)}
        </div>
      )}
    </div>
  )
}
