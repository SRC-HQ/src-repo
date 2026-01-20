'use client';

import { Stage, Container, Graphics, Text } from '@pixi/react';
import { useCallback } from 'react';
import { TextStyle } from 'pixi.js';
import { useGameStore } from '@/stores/gameStore';
import { SPERM_COLORS, SPERM_NAMES, CANVAS } from '@sperm-race/shared';

const { WIDTH, HEIGHT, LANE_HEIGHT, START_X, FINISH_X } = CANVAS;

export function GameCanvas() {
  const positions = useGameStore((state) => state.positions);
  const winner = useGameStore((state) => state.winner);

  return (
    <Stage
      width={WIDTH}
      height={HEIGHT}
      options={{
        backgroundColor: 0x0a0a1a,
        antialias: true,
      }}
    >
      {/* Track Background */}
      <TrackBackground />

      {/* Lane Lines */}
      <LaneLines />

      {/* Finish Line */}
      <FinishLine />

      {/* Sperms */}
      <Container>
        {positions.map((position, index) => (
          <SpermSprite
            key={index}
            spermId={index}
            position={position}
            isWinner={winner === index}
          />
        ))}
      </Container>

      {/* Lane Labels */}
      <LaneLabels />
    </Stage>
  );
}

function TrackBackground() {
  const draw = useCallback((g: any) => {
    g.clear();

    // Draw alternating lane backgrounds
    for (let i = 0; i < 10; i++) {
      const y = 40 + i * LANE_HEIGHT;
      g.beginFill(i % 2 === 0 ? 0x1a1a2e : 0x252540);
      g.drawRect(0, y, WIDTH, LANE_HEIGHT);
      g.endFill();
    }
  }, []);

  return <Graphics draw={draw} />;
}

function LaneLines() {
  const draw = useCallback((g: any) => {
    g.clear();
    g.lineStyle(1, 0x3a3a5e, 0.5);

    // Draw lane dividers
    for (let i = 0; i <= 10; i++) {
      const y = 40 + i * LANE_HEIGHT;
      g.moveTo(0, y);
      g.lineTo(WIDTH, y);
    }

    // Draw start line
    g.lineStyle(3, 0xffffff, 0.8);
    g.moveTo(START_X, 40);
    g.lineTo(START_X, 40 + 10 * LANE_HEIGHT);
  }, []);

  return <Graphics draw={draw} />;
}

function FinishLine() {
  const draw = useCallback((g: any) => {
    g.clear();

    // Checkered finish line pattern
    const squareSize = 10;
    for (let row = 0; row < 50; row++) {
      for (let col = 0; col < 2; col++) {
        const isWhite = (row + col) % 2 === 0;
        g.beginFill(isWhite ? 0xffffff : 0x000000);
        g.drawRect(
          FINISH_X + col * squareSize,
          40 + row * squareSize,
          squareSize,
          squareSize,
        );
        g.endFill();
      }
    }
  }, []);

  return <Graphics draw={draw} />;
}

interface SpermSpriteProps {
  spermId: number;
  position: number; // 0-100
  isWinner: boolean;
}

function SpermSprite({ spermId, position, isWinner }: SpermSpriteProps) {
  const x = START_X + (position / 100) * (FINISH_X - START_X);
  const y = 40 + spermId * LANE_HEIGHT + LANE_HEIGHT / 2;
  const color = parseInt(SPERM_COLORS[spermId].replace('#', ''), 16);

  const draw = useCallback(
    (g: any) => {
      g.clear();

      // Sperm body (oval)
      g.beginFill(color);
      g.drawEllipse(0, 0, 20, 10);
      g.endFill();

      // Sperm tail (wavy line)
      g.lineStyle(3, color, 0.8);
      g.moveTo(-20, 0);
      g.bezierCurveTo(-30, -8, -40, 8, -50, 0);
      g.bezierCurveTo(-55, -5, -60, 5, -65, 0);

      // Nucleus
      g.beginFill(0xffffff, 0.5);
      g.drawCircle(5, 0, 5);
      g.endFill();

      // Winner glow
      if (isWinner && position >= 100) {
        g.lineStyle(4, 0xffd700, 0.8);
        g.drawCircle(0, 0, 30);
      }
    },
    [color, isWinner, position],
  );

  return <Graphics draw={draw} x={x} y={y} />;
}

function LaneLabels() {
  const textStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 12,
    fill: 0x888888,
  });

  return (
    <Container>
      {SPERM_NAMES.map((name, i) => (
        <Text
          key={i}
          text={`${i + 1}. ${name}`}
          x={10}
          y={40 + i * LANE_HEIGHT + LANE_HEIGHT / 2 - 6}
          style={textStyle}
        />
      ))}
    </Container>
  );
}
