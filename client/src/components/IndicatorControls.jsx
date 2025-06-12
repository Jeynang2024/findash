import React from 'react';

const options = ['MACD', 'RSI', 'Volume', 'SMA'];

export default function IndicatorControls({ selected, onChange }) {
  return (
    <div className="mt-4">
      {options.map(opt => (
        <label key={opt} className="block">
          <input
            type="radio"
            name="indicator"
            checked={selected === opt}
            onChange={() => onChange(opt)}
            className="mr-2"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}
