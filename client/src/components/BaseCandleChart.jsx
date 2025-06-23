import React ,{memo} from "react";
import Chart from "react-apexcharts";
const BaseCandleChart = ({ data, options }) => (
  <Chart options={options} series={data} type="candlestick" width="100%" />
);

export default memo(BaseCandleChart);
