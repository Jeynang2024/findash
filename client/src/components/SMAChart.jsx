import React,{memo} from "react";
import Chart from "react-apexcharts";

const SMAChart = ({ rawData, calculateSMA, period = 14 }) => {
  const closingPrices = rawData.map(c => parseFloat(c.close));
  const smaValues = calculateSMA(closingPrices, period);

  const smaSeries = rawData
    .slice(period - 1) 
    .map((candle, i) => ({
      x: new Date(candle.time),
      y: smaValues[i]
    }))
    .filter(point => !isNaN(point.y)); 
  const series = [
    {
      name: `SMA ${period}`,
      data: smaSeries
    }
  ];

  const options = {
    chart: {
      type: "line",
      height: 250,
      background: "rgba(68, 50, 94, 0.3)",
      toolbar: { show: false }
    },
    theme: { mode: "dark" },
    xaxis: {
      type: "datetime",
      labels: { style: { colors: "#94A3B8" } }
    },
    yaxis: {
 labels: {
    style: { colors: "#CBD5E1" },
    formatter: (value) => value.toFixed(2)  
  },
        title: { text: "SMA", style: { color: "#94A3B8" } }
    },
    stroke: {
      curve: "smooth",
      width: 2
    },
    colors: ["#FFEB3B"],
    tooltip: {
      x: { format: "dd MMM" },
      theme: "dark"
    },
    legend: {
      labels: { colors: "#ffffff" }
    }
  };

  return <Chart options={options} series={series} type="line" height={250} />;
};

export default memo(SMAChart);
