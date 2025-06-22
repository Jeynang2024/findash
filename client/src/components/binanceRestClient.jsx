// binanceRestClient.js
const IST_OFFSET = 5.5 * 60 * 60 * 1000;  // 5 hours 30 minutes = 19800000 ms

export const getCandles = async ({ symbol, interval, startTime, endTime, limit = 500 }) => {
  let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  if (startTime) url += `&startTime=${startTime.getTime()
  }`;
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
const toUnixTimestamp = (datetimeStr) => new Date(datetimeStr).getTime();



const fetchKlines = async (symbol = 'BTCUSDT', interval = '1m', limit = 500, startTime,endTime) => {
  const params = new URLSearchParams({ symbol, interval, limit: limit });
  console.log(startTime, endTime);
  if (startTime) {
    const startUTC = toUnixTimestamp(startTime)- IST_OFFSET;
    params.append('startTime', startUTC);
    console.log("startTime (UTC):", startUTC, new Date(startUTC).toISOString());
  }
  
  if (endTime) {
    const endUTC = toUnixTimestamp(endTime)- IST_OFFSET;
    params.append('endTime', endUTC);
    console.log("endTime (UTC):", endUTC, new Date(endUTC).toISOString());
  }

  const url = `https://api.binance.com/api/v3/klines?${params}`;
  console.log("Final API URL:", url);
  const res = await fetch(`https://api.binance.com/api/v3/klines?${params}`);
  const data = await res.json();
if (data.length > 0) {
    const firstTime = new Date(data[0][0]).toISOString();
    const lastTime = new Date(data[data.length - 1][0]).toISOString();
    console.log(`Fetched ${data.length} candles from ${firstTime} to ${lastTime}`);
  } else {
    console.log("No data returned from Binance.");
  }
  return data.map(c => ({
    x: c[0]+IST_OFFSET,
    y: [+c[1], +c[2], +c[3], +c[4]],
  }));
};
export { fetchKlines, toUnixTimestamp, IST_OFFSET };