'use client'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
export default function UnderConstruction() {
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <div className="mb-4">Under construction, check back soon...  In the meantime, check out the case simulator!</div>
      <Button asChild>
        <Link href="/">
          Back to Home
        </Link>
      </Button>
    </div>
  )
}
