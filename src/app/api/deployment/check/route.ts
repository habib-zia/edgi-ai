import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route to check for new Vercel deployments
 * 
 * This endpoint:
 * 1. Gets the current deployment ID from Vercel environment variables
 * 2. Returns deployment information for the client to compare
 * 3. Allows the frontend to detect when a new deployment is live
 * 
 * Vercel automatically sets VERCEL_DEPLOYMENT_ID in production
 * We can also use build time or other identifiers
 */
export async function GET(_request: NextRequest) {
  try {
    // Get deployment information from Vercel environment variables
    // Vercel automatically sets VERCEL_DEPLOYMENT_ID in production
    const deploymentId = process.env.VERCEL_DEPLOYMENT_ID || null
    
    // Fallback: Use build time as deployment identifier
    // This will change on each build, making it a reliable way to detect new deployments
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || 
                      process.env.BUILD_TIME ||
                      null

    const deploymentUrl = process.env.VERCEL_URL || 
                         process.env.NEXT_PUBLIC_VERCEL_URL ||
                         null

    // In development, return a static ID so it doesn't trigger reloads
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                        !process.env.VERCEL

    if (isDevelopment || (!deploymentId && !buildTime)) {
      return NextResponse.json({
        success: true,
        deployment: {
          id: 'development',
          deploymentId: 'development',
          buildTime: new Date().toISOString(),
          deploymentUrl: 'http://localhost:3000',
          createdAt: new Date().toISOString(),
          environment: 'development'
        }
      })
    }

    // Use deployment ID if available, otherwise use build time
    const identifier = deploymentId || buildTime || new Date().toISOString()

    // Return deployment information
    return NextResponse.json({
      success: true,
      deployment: {
        id: identifier,
        deploymentId: identifier,
        buildTime: buildTime || new Date().toISOString(),
        deploymentUrl: deploymentUrl,
        createdAt: new Date().toISOString(),
        environment: process.env.VERCEL_ENV || 'production'
      }
    })
  } catch (error) {
    console.error('Error checking deployment:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check deployment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

