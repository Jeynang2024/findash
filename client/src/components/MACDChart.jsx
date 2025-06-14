import React from "react";
import Chart from "react-apexcharts";

const MACDChart = ({ rawData, calculateMACD }) => {
  const { macdLine, signalLine, histogram } = calculateMACD(rawData);

  const series = [
    { name: "MACD Line", type: "line", data: macdLine, yAxisIndex: 1 },
    { name: "Signal Line", type: "line", data: signalLine, yAxisIndex: 1 },
    { name: "Histogram", type: "column", data: histogram, yAxisIndex: 1 }
  ];

  const options = {
    chart: { type: "line", background: "#1e293b", toolbar: { show: true } },
    xaxis: { type: "datetime", labels: { style: { colors: "#94A3B8" } } },
    
    yaxis: [
      {  labels: {
    style: { colors: "#CBD5E1" },
    formatter: (value) => value.toFixed(2)  // Show only 2 decimals
  } },
      {
        opposite: true,
        title: { text: "MACD",style: { color: "#CBD5E1" } },
 labels: {
    style: { colors: "#CBD5E1" },
    formatter: (value) => value.toFixed(2)  // Show only 2 decimals
  }      }
    ]
  };

  return <Chart options={options} series={series} type="line"  height={200}/>;
};

export default MACDChart;
