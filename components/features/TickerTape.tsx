'use client';

import { useEffect, useRef } from 'react';

export default function TickerTape({ theme = 'dark' }: { theme?: 'light' | 'dark' }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    // Prevent multiple injections in dev mode
    if (container.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          { "description": "Gold", "proName": "OANDA:XAUUSD" },
          { "description": "EUR/USD", "proName": "FX:EURUSD" },
          { "description": "GBP/USD", "proName": "FX:GBPUSD" },
          { "description": "Bitcoin", "proName": "BITSTAMP:BTCUSD" },
          { "description": "Ethereum", "proName": "BITSTAMP:ETHUSD" },
          { "description": "S&P 500", "proName": "SP:SPX" },
          { "description": "Nasdaq 100", "proName": "OANDA:NAS100USD" },
          { "description": "Tesla", "proName": "NASDAQ:TSLA" }
        ],
        "showSymbolLogo": true,
        "isTransparent": true,
        "displayMode": "adaptive",
        "colorTheme": "${theme}",
        "locale": "en"
      }
    `;
    container.current.appendChild(script);
  }, [theme]);

  return (
    <div className="tradingview-widget-container w-full" ref={container}>
      <div className="tradingview-widget-container__widget w-full"></div>
    </div>
  );
}
