'use client'

import dynamic from 'next/dynamic'

const AuthForm = dynamic(() => import('@/components/AuthForm'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">Loading...</div>
    </div>
  ),
  ssr: false
})

export default function SignUp() {
  return <AuthForm mode="signup" />
}
