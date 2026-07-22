'use client';

import React, { memo } from 'react';

interface MiniChartProps {
  symbol?: string;
  theme?: 'light' | 'dark';
}

const MiniChart = memo(({ symbol = "OANDA:EURUSD", theme = "light" }: MiniChartProps) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>body{margin:0;padding:0;overflow:hidden;background:transparent}
.tradingview-widget-container,.tradingview-widget-container__widget{height:100%;width:100%}</style>
</head>
<body>
<div class="tradingview-widget-container">
  <div class="tradingview-widget-container__widget"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js" async>
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
  </script>
</div>
</body>
</html>`;

  return (
    <div className="h-full w-full">
      <iframe
        srcDoc={html}
        style={{ width: '100%', height: '100%', border: 'none' }}
        scrolling="no"
        title={`TradingView Chart - ${symbol}`}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
});

MiniChart.displayName = 'MiniChart';

export default MiniChart;
