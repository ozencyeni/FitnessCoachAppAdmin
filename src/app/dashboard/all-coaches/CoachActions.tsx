'use client'

import { useState } from 'react'
import { banCoach, unbanCoach, deleteCoach } from './actions'

interface Props {
  userId: string
  isBanned: boolean
}

export default function CoachActions({ userId, isBanned }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState('')

  async function handleBan() {
    setLoading('ban')
    setError('')
    try {
      if (isBanned) {
        await unbanCoach(userId)
      } else {
        await banCoach(userId)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete() {
    setLoading('delete')
    setError('')
    try {
      await deleteCoach(userId)
      setShowDeleteModal(false)
    } catch (e) {
      setError(String(e))
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={handleBan}
          disabled={loading !== null}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
            isBanned
              ? 'bg-green-900/40 text-green-300 border border-green-700 hover:bg-green-900/60'
              : 'bg-amber-900/40 text-amber-300 border border-amber-700 hover:bg-amber-900/60'
          }`}
        >
          {loading === 'ban' ? '...' : isBanned ? 'Banı Kaldır' : 'Banla'}
        </button>
        <a
          href={`/dashboard/all-coaches/${userId}`}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-700 hover:bg-blue-900/60 transition"
        >
          Belgeler
        </a>
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={loading !== null}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900/40 text-red-300 border border-red-700 hover:bg-red-900/60 transition disabled:opacity-50"
        >
          Sil
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Antrenörü Sil</h3>
            <p className="text-gray-400 text-sm mb-6">
              Bu antrenör kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 transition"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading === 'delete'}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {loading === 'delete' ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
