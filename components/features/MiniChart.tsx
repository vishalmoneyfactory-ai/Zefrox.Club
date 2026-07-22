'use client';

import React, { useEffect, useRef, memo } from 'react';

interface MiniChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
}

const MiniChart = memo(({ symbol = "OANDA:EURUSD", theme = "light" }: MiniChartProps) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    // Check if script already exists to prevent duplicate injections in Strict Mode
    if (container.current.querySelector('script')) {
      return;
    }

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

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
});

MiniChart.displayName = 'MiniChart';

export default MiniChart;
