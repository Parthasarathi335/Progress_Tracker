import Link from 'next/link'
import { ShieldX } from 'lucide-react'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-cream to-sage-100 flex items-center justify-center p-4">
      <div className="bg-[#FFFDF5] rounded-3xl shadow-theme-modal p-10 max-w-md w-full text-center animate-popIn border border-sage-100">
        <div className="text-6xl mb-4">🚫</div>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-5">
          <ShieldX className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-forest mb-2">Access Denied</h1>
        <p className="text-sage-500 mb-6">
          This club is private and by invitation only. Only two authorised members may access Consistency Club.
        </p>
        <Link
          href="/login"
          className="btn-primary inline-flex items-center gap-2"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}
