



// utils/calculateSMA.js or wherever you're defining it
const calculateSMA = (data, period) => {
  const sma = new Array(period - 1).fill(null); // placeholders for alignment
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, val) => acc + val, 0);
    sma.push(sum / period);
  }
  return sma;
};


const calculateEMA = (data, period) => {
  const k = 2 / (period + 1);
  const ema = [];
  let previousEma = data.slice(0, period).reduce((a, b) => a + b.close, 0) / period;
  
  for (let i = period; i < data.length; i++) {
    previousEma = data[i].close * k + previousEma * (1 - k);
    ema.push({ x: data[i].time, y: previousEma });
  }
  return ema;
};

const calculateRSI = (data, period) => {
  const rsi = [];
  let gains = 0;
  let losses = 0;

  // Calculate initial averages
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i-1].close;
    if (change >= 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push({ x: data[period].time, y: 100 - (100 / (1 + rs)) });

  // Calculate subsequent values
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i-1].close;
    let currentGain = 0;
    let currentLoss = 0;

    if (change >= 0) currentGain = change;
    else currentLoss = -change;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push({ x: data[i].time, y: 100 - (100 / (1 + rs)) });
  }

  return rsi;
};

const calculateMACD = (data) => {
  if (data.length < 26) return { macdLine: [], signalLine: [], histogram: [] };

  // Calculate EMAs
  const calculateEMA = (period) => {
    const k = 2 / (period + 1);
    const ema = [];
    let previousEma = data.slice(0, period).reduce((a, b) => a + b.close, 0) / period;
    
    for (let i = period; i < data.length; i++) {
      previousEma = data[i].close * k + previousEma * (1 - k);
      ema.push({ 
        x: data[i].time, 
        y: previousEma 
      });
    }
    return ema;
  };

  const ema12 = calculateEMA(12);
  const ema26 = calculateEMA(26);

  // Calculate MACD line (12-day EMA - 26-day EMA)
  const macdLine = [];
  const minLength = Math.min(ema12.length, ema26.length);
  
  for (let i = 0; i < minLength; i++) {
    macdLine.push({
      x: ema12[i].x,
      y: ema12[i].y - ema26[i].y
    });
  }

  // Calculate Signal line (9-day EMA of MACD line)
  const calculateSignalLine = () => {
    if (macdLine.length < 9) return [];
    
    const k = 2 / (9 + 1);
    const signalLine = [];
    let previousEma = macdLine.slice(0, 9).reduce((a, b) => a + b.y, 0) / 9;
    
    for (let i = 9; i < macdLine.length; i++) {
      previousEma = macdLine[i].y * k + previousEma * (1 - k);
      signalLine.push({ 
        x: macdLine[i].x, 
        y: previousEma 
      });
    }
    return signalLine;
  };

  const signalLine = calculateSignalLine();

  // Calculate Histogram (MACD line - Signal line)
  const histogram = [];
  const signalStartIndex = macdLine.length - signalLine.length;
  
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push({
      x: signalLine[i].x,
      y: macdLine[signalStartIndex + i].y - signalLine[i].y
    });
  }

  return { 
    macdLine: macdLine.slice(macdLine.length - signalLine.length), 
    signalLine, 
    histogram 
  };
};
export {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  
};
