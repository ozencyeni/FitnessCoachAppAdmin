'use client'

import { useState } from 'react'
import { approveCoach, rejectCoach } from './actions'

export default function ApproveRejectButtons({ coachId }: { coachId: string }) {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApprove() {
    setLoading(true)
    try {
      await approveCoach(coachId)
    } catch (e) {
      setError('Onaylama başarısız oldu.')
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      setError('Lütfen red sebebini gir.')
      return
    }
    setLoading(true)
    try {
      await rejectCoach(coachId, rejectReason.trim())
    } catch (e) {
      setError('Reddetme başarısız oldu.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-4">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 py-4 rounded-2xl bg-green-700 hover:bg-green-600 text-white font-semibold text-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '...' : '✅ Onayla'}
        </button>
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={loading}
          className="flex-1 py-4 rounded-2xl bg-red-800 hover:bg-red-700 text-white font-semibold text-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          ❌ Reddet
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-3 text-center">{error}</p>
      )}

      {/* Red modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Red Sebebi</h3>
            <p className="text-gray-400 text-sm mb-4">
              Antrenöre iletilecek red sebebini yaz. Bu bilgi antrenörün uygulama içindeki bildirimine eklenecek.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Örn: Sertifika geçersiz görünüyor, lütfen güncel belge yükleyin."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
            />
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(false); setError('') }}
                className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition"
              >
                Vazgeç
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-semibold transition disabled:opacity-60"
              >
                {loading ? 'Gönderiliyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
