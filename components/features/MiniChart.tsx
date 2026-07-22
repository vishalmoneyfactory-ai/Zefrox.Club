'use client';

import React, { memo } from 'react';

interface MiniChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
}

const MiniChart = memo(({ symbol = "OANDA:EURUSD", theme = "light" }: MiniChartProps) => {
  const config = encodeURIComponent(JSON.stringify({
    symbol: symbol,
    width: "100%",
    height: "100%",
    locale: "en",
    dateRange: "1M",
    colorTheme: theme,
    isTransparent: true,
    autosize: true,
    largeChartUrl: ""
  }));

  return (
    <div className="h-full w-full">
      <iframe
        src={`https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.html#${config}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allowTransparency={true}
        frameBorder="0"
        scrolling="no"
        title={`TradingView Chart - ${symbol}`}
      />
    </div>
  );
});

MiniChart.displayName = 'MiniChart';

export default MiniChart;
