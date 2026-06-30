'use client';

import { useEffect, useRef } from 'react';

export default function TickerTape() {
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
          {
            "description": "100 Cash CFD",
            "proName": "CAPITALCOM:UK100"
          },
          {
            "description": "EUR to USD",
            "proName": "FX:EURUSD"
          },
          {
            "description": "Bitcoin",
            "proName": "BITSTAMP:BTCUSD"
          },
          {
            "description": "Ethereum",
            "proName": "BITSTAMP:ETHUSD"
          },
          {
            "description": "S&P 500 Index",
            "proName": "SP:SPX"
          }
        ],
        "showSymbolLogo": true,
        "isTransparent": false,
        "displayMode": "adaptive",
        "colorTheme": "light",
        "locale": "en"
      }
    `;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container w-full" ref={container}>
      <div className="tradingview-widget-container__widget w-full"></div>
    </div>
  );
}
