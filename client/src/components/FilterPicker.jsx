import React from 'react'

const FILTERS = [
  {key:'none', label:'None', css:'none'},
  {key:'bw', label:'B&W', css:'grayscale(1)'},
  {key:'sepia', label:'Sepia', css:'sepia(0.6)'},
  {key:'warm', label:'Warm', css:'contrast(1.05) saturate(1.1)'}
]

export default function FilterPicker({value, onChange}){
  return (
    <div className="flex items-center gap-2">
      {FILTERS.map(f=> (
        <button key={f.key} className={`px-3 py-1 rounded-full ${value===f.css? 'bg-pink-200':''}`} onClick={()=>onChange(f.css)}>{f.label}</button>
      ))}
    </div>
  )
}
