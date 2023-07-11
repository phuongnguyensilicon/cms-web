import '@scss/loading.scss';
import { useState } from 'react';
export function TheLoading({
  size,
  numberOfDot = 12,
  color = '#e5015a'
}: {
  size?: number;
  numberOfDot?: number;
  color?: string;
}) {
  const [diameter] = useState(size ? { width: size, height: size } : {});
  return (
    <div
      className="thien-circle"
      style={
        { ...diameter, ...{ '--thien-color': color } } as React.CSSProperties
      }
    >
      {Array(numberOfDot)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className={`thien-circle${index + 1} thien-child`}
          ></div>
        ))}
    </div>
  );
}
