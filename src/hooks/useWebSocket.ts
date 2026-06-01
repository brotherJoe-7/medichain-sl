import { useEffect, useRef } from 'react';
import { API_BASE } from '../services/api';
import { useStore } from '../store/useStore';

function deriveWsUrl(apiBase: string) {
  // apiBase like http://host:3000/api or https://host/api
  try {
    const u = new URL(apiBase);
    const protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
    u.protocol = protocol;
    // remove /api path if present
    u.pathname = u.pathname.replace(/\/api\/?$/, '');
    return u.toString();
  } catch {
    return apiBase.replace(/^http/, 'ws').replace(/\/api\/?$/, '');
  }
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const addBlockchainLog = useStore((s) => s.addBlockchainLog);

  useEffect(() => {
    const wsUrl = deriveWsUrl(API_BASE);
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => console.log('[WS] connected to', wsUrl);
      ws.onmessage = (evt: any) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'qr.verified' || msg.type === 'qr.generated') {
            addBlockchainLog({ id: 'log_' + Date.now(), action: msg.type, timestamp: new Date().toISOString(), details: JSON.stringify(msg), txHash: '' });
          }
        } catch (e) { console.warn('[WS] invalid message', e); }
      };
      ws.onclose = () => console.log('[WS] disconnected');
      ws.onerror = (e) => console.warn('[WS] error', e);
      return () => { ws.close(); };
    } catch (e) {
      console.warn('[WS] failed to connect', e);
    }
  }, [addBlockchainLog]);
}
