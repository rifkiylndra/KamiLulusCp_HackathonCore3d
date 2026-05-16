import { useState, useEffect, useRef } from 'react'
import { getSubmissionStatus } from '../lib/api'

/**
 * useSubmissionPolling
 *
 * Otomatis poll GET /api/submissions/{id}/status setiap 2 detik
 * sampai status = 'completed' atau 'failed'.
 *
 * @param {number|null} submissionId — ID yang didapat dari response POST /submissions
 * @returns {{ result, status, loading, error }}
 *
 * Contoh pemakaian di ResultPage:
 *   const { result, status, loading, error } = useSubmissionPolling(submissionId)
 */
export function useSubmissionPolling(submissionId) {
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('idle') // idle | pending | processing | completed | failed
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!submissionId) return

    setStatus('pending')

    const poll = async () => {
      try {
        const res = await getSubmissionStatus(submissionId)
        const currentStatus = res.data?.status

        setStatus(currentStatus)

        if (currentStatus === 'completed') {
          setResult(res.data?.result)
          clearInterval(intervalRef.current)
        } else if (currentStatus === 'failed') {
          setError('Analisis AI gagal. Silakan coba lagi.')
          clearInterval(intervalRef.current)
        }
      } catch (err) {
        setError('Gagal memuat status analisis.')
        clearInterval(intervalRef.current)
      }
    }

    poll() // langsung cek sekali
    intervalRef.current = setInterval(poll, 2000) // lalu setiap 2 detik

    return () => clearInterval(intervalRef.current)
  }, [submissionId])

  const loading = status === 'pending' || status === 'processing'

  return { result, status, loading, error }
}