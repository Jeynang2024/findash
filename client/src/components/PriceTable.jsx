import React from 'react';
import '../styles/home.css';
export default function PriceTable({ prices }) {
  return (
    <table className="w-full text-left home-table table-fixed text-sm">
      <thead>
        <tr  className="text-xs font-semibold text-left text-gray-300"><th className="p-2" >Pair</th><th className="p-2">Price</th><th className="p-2">24h%</th></tr>
      </thead>
      <tbody>
        {prices.map(p => (
          <tr key={p.pair} className="text-xs text-gray-200">
            <td className="p-2">{p.pair}</td>
            <td className="p-2">${p.price}</td>
            <td className={p.change >= 0 ? 'positive' : 'negative'}>
              {p.change}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
