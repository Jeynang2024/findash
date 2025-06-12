import { useRef, useEffect, useState } from 'react';

function useBinanceWebSocket(stream) {
  const ws = useRef(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [status, setStatus] = useState('CONNECTING');

  useEffect(() => {
    const url = `wss://stream.binance.com:9443/ws/${stream}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => setStatus('OPEN');
    ws.current.onerror = () => setStatus('ERROR');
    ws.current.onclose = () => setStatus('CLOSED');

   ws.current.onmessage = e => {
  try {
    const msg = JSON.parse(e.data);
    const price = parseFloat(msg.p);
    const pair = msg.s;

    setLastMessage(prev => ({
      ...prev,
      [pair]: price // always based on the latest state
    }));
  } catch (err) {
    console.error('WS parse error', err);
  }
};


    return () => ws.current.close();
  }, [stream]);

  return { lastMessage, status };
}

export default useBinanceWebSocket;
