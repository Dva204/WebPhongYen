/**
 * StarRating Component
 * Renders clickable or read-only star rating (1–5)
 *
 * Props:
 *  - value: current rating (number 0–5)
 *  - onChange: (rating) => void  — if provided, stars are interactive
 *  - size: 'sm' | 'md' | 'lg'   — controls icon size
 *  - showValue: boolean           — show numeric value next to stars
 */
import { useState } from 'react';
import { HiStar } from 'react-icons/hi';

const SIZE_MAP = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

export default function StarRating({
  value = 0,
  onChange,
  size = 'md',
  showValue = false,
}) {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onChange === 'function';
  const displayValue = hovered || value;
  const iconClass = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`transition-transform ${
            interactive
              ? 'cursor-pointer hover:scale-125 focus:outline-none'
              : 'cursor-default'
          }`}
          aria-label={`${star} sao`}
        >
          <HiStar
            className={`${iconClass} transition-colors duration-150 ${
              star <= displayValue
                ? 'text-yellow-400'
                : 'text-gray-600'
            }`}
            style={star <= displayValue ? { filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.5))' } : {}}
          />
        </button>
      ))}
      {showValue && value > 0 && (
        <span className="ml-1.5 text-sm font-semibold text-[var(--color-text-secondary)]">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
