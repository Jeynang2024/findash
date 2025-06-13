// binanceRestClient.js
export const getCandles = async ({ symbol, interval, startTime, endTime, limit = 500 }) => {
  let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  if (startTime) url += `&startTime=${startTime.getTime()}`;
  if (endTime) url += `&endTime=${endTime.getTime()}`;
  const resp = await fetch(url);
  const data = await resp.json();
  // data is an array of arrays: [timestamp, open, high, low, close, volume, ...]
  return data.map(d => ({
    time: new Date(d[0]),
    open: +d[1],
    high: +d[2],
    low: +d[3],
    close: +d[4],
    volume: +d[5],
  }));
};
