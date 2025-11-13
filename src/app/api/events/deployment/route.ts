import { NextRequest } from 'next/server';
import { deploymentBroadcaster } from '@/lib/deployment-broadcaster';

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('Error sending SSE data:', error);
        }
      };

      const clientId = deploymentBroadcaster.addClient(send);

      send(`data: ${JSON.stringify({ type: 'connected', clientId, timestamp: Date.now() })}\n\n`);

      const keepaliveInterval = setInterval(() => {
        send(`: keepalive\n\n`);
      }, 30000);

      request.signal.addEventListener('abort', () => {
        clearInterval(keepaliveInterval);
        deploymentBroadcaster.removeClient(clientId);
        console.log(`👋 Client ${clientId} disconnected`);
        try {
          controller.close();
        } catch {
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

