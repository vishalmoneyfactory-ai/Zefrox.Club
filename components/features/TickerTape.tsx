'use client';

import React, { memo } from 'react';

const TickerTape = memo(({ theme = 'dark' }: { theme?: 'light' | 'dark' }) => {
  const config = encodeURIComponent(JSON.stringify({
    symbols: [
      { description: "Gold", proName: "OANDA:XAUUSD" },
      { description: "EUR/USD", proName: "FX:EURUSD" },
      { description: "GBP/USD", proName: "FX:GBPUSD" },
      { description: "Bitcoin", proName: "BITSTAMP:BTCUSD" },
      { description: "Ethereum", proName: "BITSTAMP:ETHUSD" },
      { description: "S&P 500", proName: "SP:SPX" },
      { description: "Nasdaq 100", proName: "OANDA:NAS100USD" },
      { description: "Tesla", proName: "NASDAQ:TSLA" }
    ],
    showSymbolLogo: true,
    isTransparent: true,
    displayMode: "adaptive",
    colorTheme: theme,
    locale: "en"
  }));

  return (
    <div className="w-full h-[46px] overflow-hidden">
      <iframe
        src={`https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.html#${config}`}
        style={{ width: '100%', height: '46px', border: 'none', overflow: 'hidden' }}
        allowTransparency={true}
        frameBorder="0"
        scrolling="no"
        title="TradingView Ticker Tape"
      />
    </div>
  );
});

TickerTape.displayName = 'TickerTape';

export default TickerTape;
