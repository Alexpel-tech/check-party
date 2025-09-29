"use client"

import type React from "react"
import { useEffect, useState } from "react"

export function SupabaseCheck({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return <>{children}</>
}
