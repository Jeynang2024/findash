
// RSIChart.js
import Chart from "react-apexcharts";

const RSIChart = ({ rawData, calculateRSI, period = 14 }) => {
  const rsiData = calculateRSI(rawData, period);
  const alignedRsiData = rawData.slice(rawData.length - rsiData.length).map((candle, i) => ({
    x: new Date(candle.time),
    y: rsiData[i].y
  }));

  const series = [
    {
      name: `RSI ${period}`,
      type: "line",
      data: alignedRsiData
    }
  ];

  const options = {
    chart: {
      height: 300,
      type: "line",
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
        min: 0,
        max: 100,
title: {
      text: "RSI",
      style: { color: "#CBD5E1" }
    },         labels: {
    style: { colors: "#CBD5E1" },
    formatter: (value) => value.toFixed(2)  // Show only 2 decimals
  }
      }
    ]
  };

  return <Chart options={options} series={series} type="line" width="100%" height={250} />;
};

export default RSIChart;
