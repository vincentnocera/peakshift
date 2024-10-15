"use client"  

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Switch } from "@/components/ui/switch"

export function ThemeChanger() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Switch
      checked={theme === "dark"}
      onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      Dark Mode
    </Switch>
  )
}
