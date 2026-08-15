import React from 'react'

export default function TemplatePicker({templates=[], onSelect}){
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {templates.map(t=> (
        <div key={t._id||t.name} className="p-4 rounded-2xl shadow-sm bg-white/80 flex flex-col items-center">
          <div className="w-full h-32 rounded-lg mb-3" style={{background: t.backgroundGradient || t.frameColor}} />
          <div className="font-bold">{t.name}</div>
          <div className="text-xs text-gray-500">{t.stickerSet?.slice(0,3).join(' ')}</div>
          <button className="mt-2 px-3 py-1 bg-pink-200 rounded-full" onClick={()=>onSelect(t)}>Choose</button>
        </div>
      ))}
    </div>
  )
}
