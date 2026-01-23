'use client'

import { useEffect, useState } from 'react'

/**
 * ThemeProvider - Client Component
 * 
 * Dynamically loads theme from server at runtime.
 * This allows theme changes via ConfigMap without rebuilding the Docker image.
 * 
 * Perfect for GitOps demo:
 * 1. Change THEME in ConfigMap
 * 2. Restart pods
 * 3. Theme updates automatically!
 */
export function ThemeProvider() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch theme from API endpoint
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        const theme = data.theme || 'dark'
        
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme)
        
        console.log('🎨 Theme loaded from server:', theme)
        setIsLoading(false)
      })
      .catch(error => {
        console.error('Failed to load theme, using default (dark):', error)
        document.documentElement.setAttribute('data-theme', 'dark')
        setIsLoading(false)
      })
  }, [])

  // Prevent flash of unstyled content
  if (isLoading) {
    return (
      <style dangerouslySetInnerHTML={{
        __html: `
          body { opacity: 0; }
        `
      }} />
    )
  }

  return null
}
