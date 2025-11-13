import { NextRequest, NextResponse } from 'next/server';
import { deploymentBroadcaster } from '@/lib/deployment-broadcaster';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    console.log('🚀 Vercel deployment webhook received:', {
      id: payload.job?.id,
      state: payload.job?.state,
      createdAt: payload.job?.createdAt,
    });

    if (payload.job?.state === 'READY' || payload.job?.state === 'PENDING') {
      deploymentBroadcaster.broadcastDeployment();
      
      console.log(`📢 Deployment broadcasted to ${deploymentBroadcaster.getClientCount()} clients`);
    }
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received',
      clientsNotified: deploymentBroadcaster.getClientCount()
    });
  } catch (error) {
    console.error('❌ Error processing Vercel webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid webhook payload' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Vercel deployment webhook endpoint' });
}

