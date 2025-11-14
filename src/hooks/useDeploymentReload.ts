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
    if (typeof window === 'undefined') {
      console.log('🔄 Deployment reload: Skipping (server-side)')
      return
    }

    console.log('🔄 Deployment reload: Hook initialized', {
      hostname: window.location.hostname,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })

    // Only run in production (Vercel deployments)
    const isProduction = process.env.NODE_ENV === 'production' || 
                         window.location.hostname.includes('vercel.app') ||
                         window.location.hostname.includes('edgeairealty.com')

    if (!isProduction) {
      console.log('🔄 Deployment reload: Skipping in development', {
        reason: 'Not in production environment',
        hostname: window.location.hostname,
        nodeEnv: process.env.NODE_ENV
      })
      return
    }

    console.log('🔄 Deployment reload: Production mode detected - Starting deployment monitoring', {
      hostname: window.location.hostname,
      timestamp: new Date().toISOString()
    })

    // Initialize BroadcastChannel for cross-tab communication
    try {
      broadcastChannelRef.current = new BroadcastChannel('deployment-reload')
      console.log('🔄 Deployment reload: BroadcastChannel initialized for cross-tab communication')
      
      broadcastChannelRef.current.onmessage = (event) => {
        console.log('🔄 Deployment reload: Message received from another tab', event.data)
        if (event.data.type === 'new-deployment' && !isReloadingRef.current) {
          console.log('🔄 Deployment reload: New deployment detected from another tab, reloading...', {
            deploymentId: event.data.deploymentId,
            timestamp: new Date().toISOString()
          })
          isReloadingRef.current = true
          // Hard refresh with cache bypass
          console.log('🔄 Deployment reload: Executing hard reload from cross-tab message...')
          window.location.reload()
        }
      }
    } catch (error) {
      console.warn('🔄 Deployment reload: BroadcastChannel not supported', error)
    }

    // Function to check for new deployments
    const checkDeployment = async () => {
      if (isReloadingRef.current) {
        console.log('🔄 Deployment reload: Check skipped (reload already in progress)')
        return
      }

      console.log('🔄 Deployment reload: Checking for new deployment...', {
        timestamp: new Date().toISOString(),
        lastDeploymentId: lastDeploymentIdRef.current
      })

      try {
        setIsChecking(true)
        
        // Call deployment check API
        console.log('🔄 Deployment reload: Calling /api/deployment/check endpoint...')
        const response = await fetch('/api/deployment/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store', // Always fetch fresh data
        })

        console.log('🔄 Deployment reload: API response received', {
          status: response.status,
          ok: response.ok,
          timestamp: new Date().toISOString()
        })

        if (!response.ok) {
          console.warn('🔄 Deployment reload: Check endpoint returned error', {
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString()
          })
          return
        }

        const data = await response.json()
        console.log('🔄 Deployment reload: API response data', {
          success: data.success,
          hasDeployment: !!data.deployment,
          deploymentId: data.deployment?.deploymentId || data.deployment?.id,
          timestamp: new Date().toISOString()
        })
        
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
            console.log('🔄 Deployment reload: ✅ Initial deployment ID stored', {
              deploymentId: currentDeploymentId,
              timestamp: new Date().toISOString(),
              message: 'No reload needed - this is the first check'
            })
            return
          }

          console.log('🔄 Deployment reload: Comparing deployment IDs', {
            stored: lastDeploymentIdRef.current,
            current: currentDeploymentId,
            match: currentDeploymentId === lastDeploymentIdRef.current,
            timestamp: new Date().toISOString()
          })

          // Check if deployment ID has changed (new deployment)
          if (currentDeploymentId !== lastDeploymentIdRef.current) {
            console.log('🔄 Deployment reload: 🚨 NEW DEPLOYMENT DETECTED!', {
              oldDeploymentId: lastDeploymentIdRef.current,
              newDeploymentId: currentDeploymentId,
              timestamp: new Date().toISOString(),
              action: 'Will reload page in 2 seconds'
            })
            
            // Update stored deployment ID
            lastDeploymentIdRef.current = currentDeploymentId
            
            // Broadcast to other tabs
            if (broadcastChannelRef.current) {
              try {
                console.log('🔄 Deployment reload: Broadcasting to other tabs...', {
                  deploymentId: currentDeploymentId,
                  timestamp: new Date().toISOString()
                })
                broadcastChannelRef.current.postMessage({ 
                  type: 'new-deployment', 
                  deploymentId: currentDeploymentId 
                })
                console.log('🔄 Deployment reload: ✅ Broadcast sent to other tabs')
              } catch (error) {
                console.warn('🔄 Deployment reload: ❌ Failed to broadcast to other tabs', error)
              }
            } else {
              console.log('🔄 Deployment reload: ⚠️ BroadcastChannel not available - skipping cross-tab notification')
            }

            // Set flag to prevent multiple reloads
            isReloadingRef.current = true
            console.log('🔄 Deployment reload: Reload flag set to prevent multiple reloads')

            // Show a brief message to user
            if (typeof window !== 'undefined' && window.document) {
              console.log('🔄 Deployment reload: Creating user notification...')
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
              console.log('🔄 Deployment reload: ⏱️ Setting 2-second delay before reload...', {
                timestamp: new Date().toISOString(),
                reloadTime: new Date(Date.now() + 2000).toISOString()
              })
              
              const reloadTimeout = setTimeout(() => {
                console.log('🔄 Deployment reload: 🔄 EXECUTING HARD RELOAD NOW!', {
                  timestamp: new Date().toISOString(),
                  deploymentId: currentDeploymentId
                })
                
                try {
                  if (notification.parentNode) {
                    notification.parentNode.removeChild(notification)
                    console.log('🔄 Deployment reload: ✅ Notification removed')
                  }
                  if (style.parentNode) {
                    style.parentNode.removeChild(style)
                    console.log('🔄 Deployment reload: ✅ Style removed')
                  }
                  // Hard refresh with cache bypass
                  // Note: reload() bypasses cache in modern browsers
                  console.log('🔄 Deployment reload: 🚀 Calling window.location.reload()...')
                  window.location.reload()
                } catch (error) {
                  console.warn('🔄 Deployment reload: ❌ Error during reload', error)
                  // Fallback: try direct navigation
                  console.log('🔄 Deployment reload: 🔄 Trying fallback reload method...')
                  window.location.href = window.location.href
                }
              }, 2000)

              // Store timeout for potential cleanup
              // Note: This will be cleared on page reload anyway
            } else {
              // Fallback: immediate reload
              console.log('🔄 Deployment reload: 🔄 Executing immediate reload (fallback)...', {
                timestamp: new Date().toISOString(),
                deploymentId: currentDeploymentId
              })
              window.location.reload()
            }
          } else {
            console.log('🔄 Deployment reload: ✅ Same deployment ID - no reload needed', {
              deploymentId: currentDeploymentId,
              timestamp: new Date().toISOString()
            })
          }
        } else {
          console.warn('🔄 Deployment reload: ⚠️ Invalid API response structure', {
            hasSuccess: 'success' in data,
            hasDeployment: 'deployment' in data,
            data: data
          })
        }
      } catch (error) {
        console.warn('🔄 Deployment reload: ❌ Error checking deployment', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
      } finally {
        setIsChecking(false)
        console.log('🔄 Deployment reload: Check completed', {
          isChecking: false,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Initial check after a short delay
    console.log('🔄 Deployment reload: ⏱️ Scheduling initial check in 5 seconds...', {
      timestamp: new Date().toISOString(),
      checkTime: new Date(Date.now() + 5000).toISOString()
    })
    
    const initialTimeout = setTimeout(() => {
      console.log('🔄 Deployment reload: 🕐 Initial check triggered (5 seconds after page load)')
      checkDeployment()
    }, 5000) // Wait 5 seconds after page load

    // Set up polling interval (check every 2 minutes)
    console.log('🔄 Deployment reload: ⏱️ Setting up polling interval (every 2 minutes)...', {
      interval: '2 minutes',
      timestamp: new Date().toISOString()
    })
    
    checkIntervalRef.current = setInterval(() => {
      console.log('🔄 Deployment reload: 🕐 Polling interval triggered (2 minutes elapsed)')
      checkDeployment()
    }, 2 * 60 * 1000) // 2 minutes

    // Also check when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden && !isReloadingRef.current) {
        console.log('🔄 Deployment reload: 👁️ Page became visible - checking for new deployment...', {
          timestamp: new Date().toISOString(),
          wasHidden: document.hidden
        })
        checkDeployment()
      } else if (document.hidden) {
        console.log('🔄 Deployment reload: 👁️ Page hidden - skipping check', {
          timestamp: new Date().toISOString()
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    console.log('🔄 Deployment reload: ✅ Visibility change listener added')

    console.log('🔄 Deployment reload: ✅ All setup complete!', {
      initialCheckDelay: '5 seconds',
      pollingInterval: '2 minutes',
      broadcastChannel: broadcastChannelRef.current ? 'enabled' : 'disabled',
      timestamp: new Date().toISOString()
    })

    // Cleanup
    return () => {
      console.log('🔄 Deployment reload: 🧹 Cleaning up...', {
        timestamp: new Date().toISOString()
      })
      
      clearTimeout(initialTimeout)
      console.log('🔄 Deployment reload: ✅ Initial timeout cleared')
      
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
        console.log('🔄 Deployment reload: ✅ Polling interval cleared')
      }
      
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close()
        console.log('🔄 Deployment reload: ✅ BroadcastChannel closed')
      }
      
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      console.log('🔄 Deployment reload: ✅ Visibility change listener removed')
      
      console.log('🔄 Deployment reload: ✅ Cleanup complete')
    }
  }, [])

  return { isChecking }
}

