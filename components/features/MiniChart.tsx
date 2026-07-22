'use client';

import React, { useEffect, useRef } from 'react';

interface MiniChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
}

export default function MiniChart({ symbol = "OANDA:EURUSD", theme = "light" }: MiniChartProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Clear the container to prevent duplicates or broken scripts on re-render
    container.current.innerHTML = '<div class="tradingview-widget-container__widget h-full w-full"></div>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "symbol": "${symbol}",
        "width": "100%",
        "height": "100%",
        "locale": "en",
        "dateRange": "1M",
        "colorTheme": "${theme}",
        "isTransparent": true,
        "autosize": true,
        "largeChartUrl": ""
      }
    `;
    container.current.appendChild(script);
  }, [symbol, theme]);

  return <div className="tradingview-widget-container h-full w-full" ref={container} />;
}
