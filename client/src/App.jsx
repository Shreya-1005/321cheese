import React, { useEffect, useState } from 'react'
import TemplatePicker from './components/TemplatePicker'
import CameraCapture from './components/CameraCapture'
import FilterPicker from './components/FilterPicker'
import StripCanvas from './components/StripCanvas'
import DownloadButton from './components/DownloadButton'
import ImageEditor from './components/ImageEditor'

export default function App(){
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [stage, setStage] = useState('home')
  const [shots, setShots] = useState([]) // { src, transform }
  const [editingIndex, setEditingIndex] = useState(null)
  const [finalBlobUrl, setFinalBlobUrl] = useState(null)
  const [filter, setFilter] = useState('none')

  const apiBase = import.meta.env.DEV ? 'http://localhost:5000' : '';
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  useEffect(()=>{
    fetch(`${apiBase}/api/templates`).then(r=>r.json()).then(data=>{ setTemplates(data||[]); setLoadingTemplates(false) }).catch(()=>{
      // fallback local templates if API not available
      setTemplates([
        { _id: 'local1', name: 'Pastel Peach', frameColor: '#FFDAD1', stickerSet: ['🍓','🌸','💖','✨'], layout:{padding:24,slotHeight:280} }
      ])
      setLoadingTemplates(false)
    })
  },[])

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-[20px] p-6 shadow-xl">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-3xl">Cute Photobooth</h1>
        {stage==='home' && <button className="px-4 py-2 bg-pink-300 rounded-xl hover:scale-105" onClick={()=>{ console.log('Start clicked'); setStage('picker')}}>Start</button>}
      </header>

      {stage==='home' && (
        <div>
          <p className="text-sm mb-4">Pick a template or hit Start to choose one.</p>
          <TemplatePicker templates={templates} onSelect={(t)=>{setSelectedTemplate(t); setStage('booth')}} />
        </div>
      )}

      {stage==='picker' && (
        <div>
          {loadingTemplates ? <div>Loading templates...</div> : templates.length===0 ? <div>No templates found — try running the server.</div> : <TemplatePicker templates={templates} onSelect={(t)=>{setSelectedTemplate(t); setStage('booth')}} />}
        </div>
      )}

      {stage==='booth' && (
        <CameraCapture
          template={selectedTemplate}
          onComplete={(captured)=>{ setShots(captured.map(s=>({ src: s, transform: { scale: 1, offsetX: 0, offsetY: 0 }}))); setStage('review') }}
          onCancel={()=>setStage('home')}
        />
      )}

      {stage==='review' && (
        <div>
          <h2 className="text-xl mb-2">Review your shots</h2>
          <div className="flex gap-4 mb-4">
            {shots.map((sObj,i)=> (
              <div key={i} className="relative">
                <div style={{width: 144, height: 192, borderRadius:8, overflow:'hidden', backgroundImage:`url(${sObj.src})`, backgroundSize:`${sObj.transform.scale*100}% auto`, backgroundPosition:`${50 + sObj.transform.offsetX}% ${50 + sObj.transform.offsetY}%`, backgroundRepeat: 'no-repeat', filter: filter}} />
                <div className="mt-2 flex gap-2">
                  <button className="px-3 py-1 bg-white rounded" onClick={()=>setEditingIndex(i)}>Edit</button>
                  <button className="px-3 py-1 bg-white rounded" onClick={()=>{ const copy=[...shots]; copy.splice(i,1); setShots(copy); }}>Retake</button>
                </div>
              </div>
            ))}
          </div>
          <FilterPicker value={filter} onChange={setFilter} />
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-green-200 rounded-xl" onClick={()=>setStage('booth')}>Retake All</button>
            <button className="px-4 py-2 bg-blue-200 rounded-xl" onClick={()=>setStage('compose')}>Compose</button>
          </div>
          {editingIndex!==null && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg">
                <ImageEditor src={shots[editingIndex].src} transform={shots[editingIndex].transform} onChange={(t)=>{ const copy=[...shots]; copy[editingIndex].transform = t; setShots(copy)}} onClose={()=>setEditingIndex(null)} />
              </div>
            </div>
          )}
        </div>
      )}

      {stage==='compose' && (
        <div>
          <StripCanvas shots={shots} template={selectedTemplate} filter={filter} onDone={(blobUrl)=>{ if(finalBlobUrl) URL.revokeObjectURL(finalBlobUrl); setFinalBlobUrl(blobUrl) }} />
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 bg-gray-200 rounded-xl" onClick={()=>setStage('review')}>Back</button>
            <button className="px-4 py-2 bg-pink-200 rounded-xl" onClick={()=>setStage('download')}>Next</button>
          </div>
        </div>
      )}

      {stage==='download' && (
        <div>
          <p className="mb-3">Your photostrip is ready.</p>
          {finalBlobUrl ? (
            <img src={finalBlobUrl} alt="photostrip preview" style={{maxWidth: 360, borderRadius:12}} />
          ) : (
            <StripCanvas shots={shots} template={selectedTemplate} filter={filter} isPreview={true} />
          )}
          <DownloadButton shots={shots} template={selectedTemplate} filter={filter} finalBlobUrl={finalBlobUrl} />
          <div className="mt-3"><button className="px-4 py-2 bg-yellow-100 rounded-xl" onClick={()=>{ if(finalBlobUrl) URL.revokeObjectURL(finalBlobUrl); setShots([]); setFinalBlobUrl(null); setStage('home')}}>Start over</button></div>
        </div>
      )}

    </div>
  )
}
