import React, { useState, useRef, useEffect } from 'react'

export default function ImageEditor({src, transform, onChange, onClose}){
  const [scale, setScale] = useState(transform?.scale || 1)
  const [offsetX, setOffsetX] = useState(transform?.offsetX || 0)
  const [offsetY, setOffsetY] = useState(transform?.offsetY || 0)
  const dragging = useRef(false)
  const last = useRef({x:0,y:0})

  useEffect(()=>{
    setScale(transform?.scale || 1)
    setOffsetX(transform?.offsetX || 0)
    setOffsetY(transform?.offsetY || 0)
  },[src])

  const onDown = (e)=>{
    dragging.current = true
    last.current = { x: e.clientX || (e.touches && e.touches[0].clientX), y: e.clientY || (e.touches && e.touches[0].clientY) }
  }
  const onMove = (e)=>{
    if(!dragging.current) return
    const x = e.clientX || (e.touches && e.touches[0].clientX)
    const y = e.clientY || (e.touches && e.touches[0].clientY)
    const dx = x - last.current.x
    const dy = y - last.current.y
    last.current = {x,y}
    // translate dx/dy into percent offsets (approx)
    // assume container 300px wide
    const pxToPercentX = (val)=> (val / 300) * 100
    const pxToPercentY = (val)=> (val / 300) * 100
    setOffsetX(o => Math.max(-50, Math.min(50, o + pxToPercentX(dx))))
    setOffsetY(o => Math.max(-50, Math.min(50, o + pxToPercentY(dy))))
  }
  const onUp = ()=>{ dragging.current = false }

  const zoom = (dir)=>{
    setScale(s=>Math.max(0.3, Math.min(4, +(s + dir*0.1).toFixed(2))))
  }

  const apply = ()=>{
    onChange && onChange({ scale, offsetX, offsetY })
    onClose && onClose()
  }

  return (
    <div style={{width:360}}>
      <div style={{width:320, height:420, borderRadius:12, overflow:'hidden', border:'6px solid #e6fff8', backgroundImage:`url(${src})`, backgroundSize:`${scale*100}%`, backgroundPosition:`${50+offsetX}% ${50+offsetY}%`, backgroundRepeat:'no-repeat'}} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp} />
      <div className="mt-2 flex gap-2">
        <button className="px-3 py-1 bg-pink-100 rounded" onClick={()=>zoom(-1)}>-</button>
        <div className="px-3 py-1">Zoom: {Math.round(scale*100)}%</div>
        <button className="px-3 py-1 bg-pink-100 rounded" onClick={()=>zoom(1)}>+</button>
      </div>
      <div className="mt-2 flex gap-2">
        <button className="px-3 py-1 bg-green-200 rounded" onClick={apply}>Apply</button>
        <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
