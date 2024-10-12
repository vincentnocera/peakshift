'use client'
import Link from 'next/link'

export default function UnderConstruction() {
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <div className="mb-4">Under construction, check back soon...  In the meantime, check out the case simulator!</div>
      <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-green-600 transition-colors">
        Back to Home
      </Link>
    </div>
  )
}
