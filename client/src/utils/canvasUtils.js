export async function buildPhotostrip(canvas, shots, template={}, filter='none'){
  const padding = template?.layout?.padding || 20
  const slotH_from_template = template?.layout?.slotHeight
  const width = template?.layout?.width || 800

  // compute content photo width and height; prefer template slotHeight, otherwise use a natural tall aspect (3:4)
  const contentW = width - padding*2
  const slotH = slotH_from_template || Math.round(contentW * (4/3))

  const footerH = 120
  const height = padding*2 + slotH*shots.length + footerH

  // handle device pixel ratio for crisp canvas
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // background
  ctx.fillStyle = template?.frameColor || '#FFF'
  ctx.fillRect(0,0,width,height)

  // optional gradient
  if(template?.backgroundGradient){
    // skip CSS gradients; just draw subtle overlay
  }

  // draw title watermark
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.font = '20px Gaegu, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('321cheese', width/2, height - 40)

  // draw shots vertically
  for(let i=0;i<shots.length;i++){
    const shotItem = shots[i]
    const src = (typeof shotItem === 'string') ? shotItem : (shotItem.src || '')
    const transform = (typeof shotItem === 'string') ? null : (shotItem.transform || null)
    const img = await loadImage(src)
    const x = padding
    const y = padding + i*slotH
    const w = contentW
    const h = slotH - 10
    // apply filter by drawing to temp canvas
    if(filter && filter!=='none'){
      // simple processing via globalComposite is limited; draw image normally then apply blending
    }
    // draw frame behind photo
    ctx.fillStyle = '#fff'
    ctx.fillRect(x-8, y-8, w+16, h+16)
    // photo: if transform provided, use it (scale + offsetPercent), otherwise do coverSource
    if(transform){
      const scale = Math.max(0.1, transform.scale || 1)
      const offsetX = transform.offsetX || 0 // percent relative to center (-50..50)
      const offsetY = transform.offsetY || 0
      const sw = Math.max(1, img.width / scale)
      const sh = Math.max(1, img.height / scale)
      const centerX = img.width * (0.5 + offsetX/100)
      const centerY = img.height * (0.5 + offsetY/100)
      let sx = Math.round(centerX - sw/2)
      let sy = Math.round(centerY - sh/2)
      // clamp
      if(sx < 0) sx = 0
      if(sy < 0) sy = 0
      if(sx + sw > img.width) sx = Math.max(0, img.width - sw)
      if(sy + sh > img.height) sy = Math.max(0, img.height - sh)
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
    } else {
      // fit image into w x h maintaining cover
      const {sx, sy, sw, sh} = coverSource(img.width, img.height, w, h)
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
    }

    // draw sticker accents from template
    if(template?.stickerSet && template.stickerSet[i%template.stickerSet.length]){
      ctx.font = '40px serif'
      ctx.fillText(template.stickerSet[i%template.stickerSet.length], x + w - 60, y + 60)
    }
  }
}

function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = ()=>resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function coverSource(iw, ih, dw, dh){
  const ir = iw/ih
  const dr = dw/dh
  let sw, sh, sx, sy
  if(ir>dr){
    // image is wider, crop sides
    sh = ih
    sw = ih*dr
    sx = (iw - sw)/2
    sy = 0
  } else {
    sw = iw
    sh = iw/dr
    sx = 0
    // bias crop toward top to leave more headroom (25% from top)
    const topBias = 0.25
    sy = Math.max(0, Math.round((ih - sh) * topBias))
  }
  return {sx, sy, sw, sh}
}
