import { useState, useRef } from 'react'

const API = 'http://localhost:8000'

export default function DocumentUpload({ doctorId, doctorName, compact = false, onVerify, onAnalyzing }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef()

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
    setFiles(prev => [...prev, ...selected])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    setFiles(prev => [...prev, ...dropped])
  }

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleUpload = async () => {
    if (!files.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('files', f))
      await fetch(`${API}/doctors/${doctorId}/upload`, { method: 'POST', body: formData })
      setFiles([])
      setUploadDone(true)
    } catch (e) {
      alert('Erreur upload : ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    onAnalyzing?.(true)
    try {
      const res = await fetch(`${API}/doctors/${doctorId}/verify`, { method: 'POST' })
      const data = await res.json()
      onVerify?.(data)
    } catch (e) {
      alert('Erreur analyse : ' + e.message)
      onAnalyzing?.(false)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--rose-400)' : 'var(--border2)'}`,
          borderRadius: 'var(--radius)', padding: compact ? '20px' : '36px 24px',
          textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'rgba(244,63,94,0.04)' : 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={e => { if (!dragOver) { e.currentTarget.style.borderColor = 'var(--rose-300)'; e.currentTarget.style.background = 'rgba(255,255,255,0.6)' }}}
        onMouseLeave={e => { if (!dragOver) { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.4)' }}}
      >
        <div style={{
          width: compact ? 48 : 64, height: compact ? 48 : 64, margin: '0 auto 10px',
          borderRadius: '50%',
          background: 'var(--gradient-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: compact ? 22 : 28,
        }}>📎</div>
        <div style={{ fontWeight: 600, color: 'var(--text2)', fontSize: compact ? 13 : 14, marginBottom: 4 }}>
          {dragOver ? 'Déposez vos fichiers ici' : 'Glisser ou cliquer pour ajouter des documents'}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text4)' }}>JPG, PNG, WEBP — Diplôme, CIN, CNOM</div>
        <input ref={inputRef} type="file" multiple accept="image/*"
          style={{ display: 'none' }} onChange={handleFiles} />
      </div>

      {/* Selected files */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border)',
              transition: 'var(--transition)',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <img src={URL.createObjectURL(f)} alt={f.name}
                style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border2)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text1)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text4)' }}>{(f.size / 1024).toFixed(0)} KB</div>
              </div>
              <button onClick={() => removeFile(i)} style={{
                width: 26, height: 26, borderRadius: '50%', border: 'none',
                background: 'rgba(254,226,226,0.8)', color: 'var(--red)', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', transition: 'var(--transition)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(254,226,226,0.8)'}
              >×</button>
            </div>
          ))}

          <button onClick={handleUpload} disabled={uploading} style={{
            padding: '12px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
            background: uploading ? 'var(--border2)' : 'var(--gradient-rose)',
            color: uploading ? 'var(--text3)' : '#fff', fontWeight: 600, fontSize: 13,
            boxShadow: uploading ? 'none' : '0 4px 20px rgba(225,29,72,0.3)',
            transition: 'var(--transition)',
          }}
            onMouseEnter={e => !uploading && (e.target.style.transform = 'scale(1.02)')}
            onMouseLeave={e => !uploading && (e.target.style.transform = 'scale(1)')}
          >
            {uploading ? '⏳ Upload en cours...' : `📤 Uploader ${files.length} document(s)`}
          </button>
        </div>
      )}

      {uploadDone && !files.length && (
        <div style={{
          padding: '10px 16px', borderRadius: 'var(--radius-sm)',
          background: 'var(--green-bg)', border: '1px solid rgba(5,150,105,0.15)',
          fontSize: 12.5, color: 'var(--green)', fontWeight: 600, textAlign: 'center',
        }}>
          ✓ Documents uploadés avec succès
        </div>
      )}

      {/* Analyze button */}
      <button onClick={handleAnalyze} disabled={analyzing} style={{
        padding: '13px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
        background: analyzing ? 'var(--border2)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
        color: analyzing ? 'var(--text3)' : '#fff', fontWeight: 600, fontSize: 13,
        boxShadow: analyzing ? 'none' : '0 6px 24px rgba(124,58,237,0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        letterSpacing: '-0.2px',
      }}
        onMouseEnter={e => !analyzing && (e.target.style.transform = 'scale(1.02)')}
        onMouseLeave={e => !analyzing && (e.target.style.transform = 'scale(1)')}
      >
        {analyzing ? '✧ Analyse IA en cours...' : '✧ Analyser avec l\'IA (Vision + Texte)'}
      </button>
    </div>
  )
}