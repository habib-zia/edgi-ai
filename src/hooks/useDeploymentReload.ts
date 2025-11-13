'use client';

import { useEffect, useRef } from 'react';

export function useDeploymentReload() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        const eventSource = new EventSource('/api/events/deployment');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('🔌 Connected to deployment events');
          reconnectAttempts.current = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'deployment') {
              console.log('🚀 New deployment detected, reloading page...');
              
              setTimeout(() => {
                window.location.reload();
              }, 500);
            } else if (data.type === 'connected') {
              console.log('✅ Deployment reload service connected');
            }
          } catch {
          }
        };

        eventSource.onerror = (error) => {
          console.error('❌ Deployment event source error:', error);
          eventSource.close();
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            console.log(`🔄 Reconnecting... (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectDelay);
          } else {
            console.warn('⚠️ Max reconnection attempts reached. Deployment reload service disabled.');
          }
        };
      } catch (error) {
        console.error('❌ Failed to create EventSource:', error);
      }
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
}

