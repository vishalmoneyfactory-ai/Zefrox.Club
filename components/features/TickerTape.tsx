'use client';

import React, { memo } from 'react';

const TickerTape = memo(({ theme = 'dark' }: { theme?: 'light' | 'dark' }) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>body{margin:0;padding:0;overflow:hidden;background:transparent}</style>
</head>
<body>
<div class="tradingview-widget-container">
  <div class="tradingview-widget-container__widget"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js" async>
  {
    "symbols": [
      {"description":"Gold","proName":"OANDA:XAUUSD"},
      {"description":"EUR/USD","proName":"FX:EURUSD"},
      {"description":"GBP/USD","proName":"FX:GBPUSD"},
      {"description":"Bitcoin","proName":"BITSTAMP:BTCUSD"},
      {"description":"Ethereum","proName":"BITSTAMP:ETHUSD"},
      {"description":"S&P 500","proName":"SP:SPX"},
      {"description":"Nasdaq 100","proName":"OANDA:NAS100USD"},
      {"description":"Tesla","proName":"NASDAQ:TSLA"}
    ],
    "showSymbolLogo": true,
    "isTransparent": true,
    "displayMode": "adaptive",
    "colorTheme": "${theme}",
    "locale": "en"
  }
  </script>
</div>
</body>
</html>`;

  return (
    <div className="w-full h-[56px] overflow-hidden">
      <iframe
        srcDoc={html}
        style={{ width: '100%', height: '56px', border: 'none', overflow: 'hidden' }}
        scrolling="no"
        title="TradingView Ticker Tape"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
});

TickerTape.displayName = 'TickerTape';

export default TickerTape;
