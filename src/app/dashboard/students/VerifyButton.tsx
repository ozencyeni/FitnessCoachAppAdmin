'use client'

import { useState } from 'react'
import { verifyStudent, unverifyStudent } from './actions'

interface Props {
  userId: string
  isVerified: boolean
}

export default function VerifyButton({ userId, isVerified }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      if (isVerified) {
        await unverifyStudent(userId)
      } else {
        await verifyStudent(userId)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
        isVerified
          ? 'bg-purple-900/40 text-purple-300 border border-purple-700 hover:bg-purple-900/60'
          : 'bg-green-900/40 text-green-300 border border-green-700 hover:bg-green-900/60'
      }`}
    >
      {loading ? '...' : isVerified ? 'Onayı Kaldır' : 'Onayla'}
    </button>
  )
}
