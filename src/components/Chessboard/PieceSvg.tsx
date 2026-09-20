import React from 'react';
import { PieceSymbol, Color } from 'chess.js';

interface PieceSvgProps {
  piece: PieceSymbol;
  color: Color;
  className?: string;
}

export const PieceSvg: React.FC<PieceSvgProps> = ({ piece, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'w';

  // White piece fill & stroke vs Black piece fill & stroke
  const fill = isWhite ? '#ffffff' : '#1f1e1b';
  const stroke = isWhite ? '#111111' : '#111111';
  const innerStroke = isWhite ? '#ffffff' : '#333333';
  const highlight = isWhite ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)';

  switch (piece) {
    case 'p':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <path
            d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 H 34 C 34,31.58 29.59,27.09 26.59,26.03 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z"
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }}
          />
        </svg>
      );

    case 'r':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }}
          >
            <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
            <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
            <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
            <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
            <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" />
            <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5" />
            <path d="M 11,14 L 34,14" />
          </g>
        </svg>
      );

    case 'n':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }}
          >
            <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
            <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.02,5.06 17.02,5.06 C 17.02,5.06 20.12,7.37 19,10 C 22.3,10 27,8.5 27,8.5 C 27,8.5 23.5,11.5 22,10 z" />
            <circle cx="14.5" cy="15.5" r="1" style={{ fill: isWhite ? '#111' : '#fff' }} />
          </g>
        </svg>
      );

    case 'b':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }}
          >
            <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
            <path d="M 12,36 C 12,32 17,29 17,25 C 14.5,23.5 12,20.5 12,17 C 12,12 16.5,8 22.5,8 C 28.5,8 33,12 33,17 C 33,20.5 30.5,23.5 28,25 C 28,29 33,32 33,36 z" />
            <path d="M 17.5,26 L 27.5,26" />
            <path d="M 15,30 L 30,30" />
            <circle cx="22.5" cy="5.5" r="2.5" />
            <path d="M 22.5,10 L 22.5,15" />
            <path d="M 20,12.5 L 25,12.5" />
          </g>
        </svg>
      );

    case 'q':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }}
          >
            <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 22.5,10 L 14,25 L 7,14 L 9,26 z" />
            <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 L 9,26 z" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="14" cy="9" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="31" cy="9" r="2" />
            <circle cx="39" cy="12" r="2" />
          </g>
        </svg>
      );

    case 'k':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g
            style={{
              fill,
              stroke,
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round'
            }}
          >
            <path d="M 22.5,11.63 L 22.5,6" />
            <path d="M 20,8 L 25,8" />
            <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,11.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" />
            <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,34 37,28.5 37,23 C 37,17 33.5,14.5 30,17 C 26.5,19.5 24,20 22.5,20 C 21,20 18.5,19.5 15,17 C 11.5,14.5 8,17 8,23 C 8,28.5 8.5,34 11.5,37 z" />
            <path d="M 11.5,30 C 17,27 28,27 33.5,30" />
            <path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" />
            <path d="M 11.5,37 C 17,34 28,34 33.5,37" />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
