'use client'

import { useEffect, useRef, useState } from 'react'

interface DeploymentInfo {
  deploymentId: string
  deploymentUrl: string
  createdAt: string
}

/**
 * Hook to automatically hard refresh the page when a new Vercel deployment is detected
 * 
 * This hook:
 * 1. Polls the deployment check endpoint to detect new deployments
 * 2. Uses BroadcastChannel for cross-tab communication
 * 3. Triggers a hard refresh (cache bypass) when new deployment is detected
 * 4. Only runs in production/browser environment
 */
export const useDeploymentReload = () => {
  const [isChecking, setIsChecking] = useState(false)
  const lastDeploymentIdRef = useRef<string | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null)
  const isReloadingRef = useRef(false)

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return

    // Only run in production (Vercel deployments)
    const isProduction = process.env.NODE_ENV === 'production' || 
                         window.location.hostname.includes('vercel.app') ||
                         window.location.hostname.includes('edgeairealty.com')

    if (!isProduction) {
      console.log('🔄 Deployment reload: Skipping in development')
      return
    }

    // Initialize BroadcastChannel for cross-tab communication
    try {
      broadcastChannelRef.current = new BroadcastChannel('deployment-reload')
      
      broadcastChannelRef.current.onmessage = (event) => {
        if (event.data.type === 'new-deployment' && !isReloadingRef.current) {
          console.log('🔄 Deployment reload: New deployment detected from another tab, reloading...')
          isReloadingRef.current = true
          // Hard refresh with cache bypass
          window.location.reload()
        }
      }
    } catch (error) {
      console.warn('🔄 Deployment reload: BroadcastChannel not supported', error)
    }

    // Function to check for new deployments
    const checkDeployment = async () => {
      if (isReloadingRef.current) return

      try {
        setIsChecking(true)
        
        // Call deployment check API
        const response = await fetch('/api/deployment/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store', // Always fetch fresh data
        })

        if (!response.ok) {
          console.warn('🔄 Deployment reload: Check endpoint returned error', response.status)
          return
        }

        const data = await response.json()
        
        if (data.success && data.deployment) {
          // Use deploymentId, id, or buildTime as identifier
          const currentDeploymentId = data.deployment.deploymentId || 
                                     data.deployment.id || 
                                     data.deployment.buildTime ||
                                     null
          
          if (!currentDeploymentId) {
            console.warn('🔄 Deployment reload: No deployment identifier found in response')
            return
          }
          
          // First check - just store the deployment ID
          if (!lastDeploymentIdRef.current) {
            lastDeploymentIdRef.current = currentDeploymentId
            console.log('🔄 Deployment reload: Initial deployment ID stored:', currentDeploymentId)
            return
          }

          // Check if deployment ID has changed (new deployment)
          if (currentDeploymentId !== lastDeploymentIdRef.current) {
            console.log('🔄 Deployment reload: New deployment detected!', {
              old: lastDeploymentIdRef.current,
              new: currentDeploymentId
            })
            
            // Update stored deployment ID
            lastDeploymentIdRef.current = currentDeploymentId
            
            // Broadcast to other tabs
            if (broadcastChannelRef.current) {
              try {
                broadcastChannelRef.current.postMessage({ 
                  type: 'new-deployment', 
                  deploymentId: currentDeploymentId 
                })
              } catch (error) {
                console.warn('🔄 Deployment reload: Failed to broadcast to other tabs', error)
              }
            }

            // Set flag to prevent multiple reloads
            isReloadingRef.current = true

            // Show a brief message to user
            if (typeof window !== 'undefined' && window.document) {
              const notification = document.createElement('div')
              notification.textContent = 'New version available. Reloading...'
              notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #5046E5;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                z-index: 9999;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
              `
              
              // Add animation
              const style = document.createElement('style')
              style.textContent = `
                @keyframes slideIn {
                  from {
                    transform: translateX(100%);
                    opacity: 0;
                  }
                  to {
                    transform: translateX(0);
                    opacity: 1;
                  }
                }
              `
              document.head.appendChild(style)
              document.body.appendChild(notification)

              // Remove notification after 2 seconds and reload
              const reloadTimeout = setTimeout(() => {
                try {
                  if (notification.parentNode) {
                    notification.parentNode.removeChild(notification)
                  }
                  if (style.parentNode) {
                    style.parentNode.removeChild(style)
                  }
                  // Hard refresh with cache bypass
                  // Note: reload() bypasses cache in modern browsers
                  window.location.reload()
                } catch (error) {
                  console.warn('🔄 Deployment reload: Error during reload', error)
                  // Fallback: try direct navigation
                  window.location.href = window.location.href
                }
              }, 2000)

              // Store timeout for potential cleanup
              // Note: This will be cleared on page reload anyway
            } else {
              // Fallback: immediate reload
              window.location.reload()
            }
          }
        }
      } catch (error) {
        console.warn('🔄 Deployment reload: Error checking deployment', error)
      } finally {
        setIsChecking(false)
      }
    }

    // Initial check after a short delay
    const initialTimeout = setTimeout(() => {
      checkDeployment()
    }, 5000) // Wait 5 seconds after page load

    // Set up polling interval (check every 2 minutes)
    checkIntervalRef.current = setInterval(() => {
      checkDeployment()
    }, 2 * 60 * 1000) // 2 minutes

    // Also check when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && !isReloadingRef.current) {
        console.log('🔄 Deployment reload: Page visible, checking for new deployment...')
        checkDeployment()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      clearTimeout(initialTimeout)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close()
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return { isChecking }
}

