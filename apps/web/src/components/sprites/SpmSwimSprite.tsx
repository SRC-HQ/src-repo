import React, { useEffect, useState } from 'react';

interface SpmSwimSpriteProps {
  color?: string;
  className?: string;
  width?: number;
  height?: number;
  animating?: boolean;
}

const SpmSwimSprite = ({
  color = '#ffffff',
  className = '',
  width = 50,
  height = 50,
  animating = true,
}: SpmSwimSpriteProps) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!animating) {
      setFrame(0);
      return;
    }
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 3);
    }, 150); // 150ms per frame for swimming animation
    return () => clearInterval(interval);
  }, [animating]);

  // Frame 2 (Middle) is the reference center
  // Frame 1 (Top) needs to be moved DOWN to match center
  // Frame 3 (Bottom) needs to be moved UP to match center

  // Frame 1 (Top) approx Y center: 15. Frame 2 (Middle) approx Y center: 60. Diff: +45
  // Frame 3 (Bottom) approx Y center: 110. Frame 2 (Middle) approx Y center: 60. Diff: -50

  const getTransform = (f: number) => {
    switch (f) {
      case 0:
        return 'translate(0, 44)'; // Move Top frame down
      case 1:
        return 'translate(0, 0)'; // Middle frame stays
      case 2:
        return 'translate(0, -42)'; // Bottom frame moves up
      default:
        return 'translate(0, 0)';
    }
  };

  const strokeStyle: React.CSSProperties = {
    fill: 'none',
    stroke: color,
    strokeLinecap: 'round',
    strokeMiterlimit: 10,
    strokeWidth: '2px',
  };

  const fillStyle: React.CSSProperties = {
    fill: color,
    stroke: '#000',
    strokeLinecap: 'round',
    strokeMiterlimit: 10,
    strokeWidth: '2px',
  };

  const bodyStyle: React.CSSProperties = {
    fill: '#fff',
    stroke: '#000',
    strokeLinecap: 'round',
    strokeMiterlimit: 10,
    strokeWidth: '2px',
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 45 100 40" // Adjusted viewBox to zoom in on the centered content
      className={className}
      width={width}
      height={height}
      style={{ overflow: 'visible' }} // Allow overflowing strokes if needed
    >
      <g transform={getTransform(frame)}>
        {/* Frame 1: Top */}
        <g style={{ display: frame === 0 ? 'block' : 'none' }}>
          {/* Tail */}
          <path
            style={strokeStyle}
            d="M65.23,7.3c-14.69,1.81-26.6,7.75-26.6,13.27s11.91,8.52,26.6,6.71"
          />
          {/* Main Body/Tail */}
          <path
            d="M0,17c6.45-1.33,13.32-2.7,19.71-.23,6.15,1.94,12,5.65,18.65,4.1a1,1,0,1,1,.29,2,19.47,19.47,0,0,1-10.16-1.24c-3.12-1.24-6-2.77-9.11-3.9C13.19,15,6.47,16.06,0,17Z"
            fill="#fff"
            stroke="#000"
            strokeWidth="1"
          />

          {/* Head */}
          <path
            style={fillStyle}
            d="M98.46,19.87c1.68-8.39-11.72-17.1-19.27-18.62s-15,4.06-16.73,12.45,3.07,16.42,10.62,17.94S96.77,28.27,98.46,19.87Z"
          />

          {/* Eyes/Details */}
          <ellipse
            style={bodyStyle}
            cx={83.63}
            cy={23.75}
            rx={5.17}
            ry={2.58}
            transform="translate(-2.66 13.15) rotate(-8.85)"
          />
          <ellipse
            style={bodyStyle}
            cx={85.72}
            cy={12.55}
            rx={2.58}
            ry={5.17}
            transform="translate(30.15 79.02) rotate(-58.44)"
          />
          <ellipse
            fill="#000"
            cx={86.78}
            cy={23.46}
            rx={2.24}
            ry={2.06}
            transform="translate(-2.98 18.61) rotate(-12.03)"
          />
          <ellipse
            fill="#000"
            cx={88.61}
            cy={14.34}
            rx={2.06}
            ry={2.24}
            transform="translate(26.32 78.97) rotate(-55.25)"
          />
        </g>

        {/* Frame 2: Middle */}
        <g style={{ display: frame === 1 ? 'block' : 'none' }}>
          {/* Tail */}
          <path style={strokeStyle} d="M66.23,71.61c-14.69,0-26.6-4.47-26.6-10s11.91-10,26.6-10" />
          {/* Main Body/Tail */}
          <path
            d="M.44,61.12c6.43,1.15,13,.15,19.43-.27a168,168,0,0,1,19.59-.74,1,1,0,1,1-.13,2,167.37,167.37,0,0,0-19.41-.25c-6.47.09-13.11.75-19.48-.73Z"
            fill="#fff"
            stroke="#000"
            strokeWidth="1"
          />

          {/* Head */}
          <path
            style={fillStyle}
            d="M98.61,62.62c0,8.24-14.31,13.93-21.73,13.93S63.44,69.87,63.44,61.62s6-14.93,13.44-14.93S98.61,54.37,98.61,62.62Z"
          />

          {/* Eyes/Details */}
          <ellipse
            style={bodyStyle}
            cx={84.83}
            cy={55.94}
            rx={2.58}
            ry={5.17}
            transform="translate(3.03 116.23) rotate(-69.79)"
          />
          <ellipse
            style={bodyStyle}
            cx={84.68}
            cy={67.33}
            rx={5.17}
            ry={2.58}
            transform="translate(-18.04 33.4) rotate(-20.21)"
          />
          <ellipse
            fill="#000"
            cx={87.86}
            cy={56.84}
            rx={2.06}
            ry={2.24}
            transform="translate(0.81 114.92) rotate(-66.61)"
          />
          <ellipse
            fill="#000"
            cx={87.86}
            cy={66.14}
            rx={2.24}
            ry={2.06}
            transform="translate(-19.04 40.32) rotate(-23.39)"
          />
        </g>

        {/* Frame 3: Bottom */}
        <g style={{ display: frame === 2 ? 'block' : 'none' }}>
          {/* Tail */}
          <path
            style={strokeStyle}
            d="M65.23,115.61c-14.69-1.81-26.6-7.75-26.6-13.26s11.91-8.53,26.6-6.72"
          />
          {/* Main Body/Tail */}
          <path
            d="M0,105.89c6.47,1,13.19,2,19.38-.71,3.07-1.14,6-2.66,9.11-3.91A19.36,19.36,0,0,1,38.65,100a1,1,0,0,1-.24,2c-6.66-1.57-12.53,2.14-18.7,4.1-6.39,2.47-13.26,1.09-19.71-.23Z"
            fill="#fff"
            stroke="#000"
            strokeWidth="1"
          />

          {/* Head */}
          <path
            style={fillStyle}
            d="M98.46,103c1.68,8.39-11.72,17.11-19.27,18.63s-15-4.06-16.73-12.45,3.07-16.43,10.62-18S96.77,94.65,98.46,103Z"
          />

          {/* Eyes/Details */}
          <ellipse
            style={bodyStyle}
            cx={83.63}
            cy={99.17}
            rx={2.58}
            ry={5.17}
            transform="translate(-27.23 166.54) rotate(-81.15)"
          />
          <ellipse
            style={bodyStyle}
            cx={85.72}
            cy={110.36}
            rx={5.17}
            ry={2.58}
            transform="matrix(0.85, -0.52, 0.52, 0.85, -45.09, 61.2)"
          />
          <ellipse
            fill="#000"
            cx={86.78}
            cy={99.46}
            rx={2.06}
            ry={2.24}
            transform="translate(-28.59 163.59) rotate(-77.97)"
          />
          <ellipse
            fill="#000"
            cx={88.61}
            cy={108.58}
            rx={2.24}
            ry={2.06}
            transform="translate(-46.08 69.86) rotate(-34.75)"
          />
        </g>
      </g>
    </svg>
  );
};

export default SpmSwimSprite;
