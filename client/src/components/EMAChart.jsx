// EMAChart.js
import React from "react";
import Chart from "react-apexcharts";

const EMAChart = ({ rawData, calculateEMA, period = 14 }) => {
  const emaData = calculateEMA(rawData, period);
  const alignedData = rawData.slice(rawData.length - emaData.length).map((candle, i) => ({
    x: new Date(candle.time),
    y: emaData[i].y
  }));

  const series = [
   
    {
      name: `EMA ${period}`,
      type: "line",
      data: alignedData
    }
  ];

  const options = {
    chart: {
      height: 550,
      type: "line",
            background: "rgba(68, 50, 94, 0.3)",

      toolbar: { show: true }
    },
    xaxis: {
      type: "datetime",
        labels: {
    style: { colors: "#CBD5E1" },
  }
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    yaxis: [
      {
        seriesName: "Candlestick",
        title: { text: "Ema",style: { color: "#CBD5E1" } },
        labels: {
          style: { colors: "#CBD5E1" },
          formatter: (value) => value.toFixed(2) // Show only 2 decimals
        }
      }
    ]
  };

  return <Chart options={options} series={series} type="line" height={250} width="100%" />;
};

export default EMAChart;

