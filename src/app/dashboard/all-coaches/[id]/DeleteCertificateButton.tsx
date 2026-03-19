'use client'

import { useState } from 'react'
import { deleteCertificate } from '../actions'

interface Props {
  certificateId: string
  coachId: string
  fileUrl: string | null
}

export default function DeleteCertificateButton({ certificateId, coachId, fileUrl }: Props) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      await deleteCertificate(certificateId, coachId, fileUrl)
    } catch (e) {
      setError(String(e))
      setLoading(false)
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-1 rounded-lg text-xs bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
        >
          {loading ? '...' : 'Evet, Sil'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="px-2 py-1 rounded-lg text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
        >
          İptal
        </button>
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900/40 text-red-300 border border-red-700 hover:bg-red-900/60 transition"
    >
      🗑 Sil
    </button>
  )
}
