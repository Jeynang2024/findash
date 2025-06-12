import React from 'react';
import '../styles/home.css';
export default function PriceTable({ prices }) {
  return (
    <table className="w-full text-left home-table">
      <thead>
        <tr><th>Pair</th><th>Price</th><th>24h%</th></tr>
      </thead>
      <tbody>
        {prices.map(p => (
          <tr key={p.pair}>
            <td>{p.pair}</td>
            <td>${p.price}</td>
            <td className={p.change >= 0 ? 'positive' : 'negative'}>
              {p.change}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
