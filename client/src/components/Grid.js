import React from 'react';
import { Layer, Line } from 'react-konva';

const Grid = React.memo(({ mapWidth, mapHeight, gridSize, viewport }) => {
  const lines = [];

  const startX = Math.floor(viewport.x / gridSize) * gridSize;
  const endX = viewport.x + viewport.width;

  const startY = Math.floor(viewport.y / gridSize) * gridSize;
  const endY = viewport.y + viewport.height;

  for (let x = startX; x <= endX; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke="#ddd"
        strokeWidth={1}
      />
    );
  }

  for (let y = startY; y <= endY; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke="#ddd"
        strokeWidth={1}
      />
    );
  }

  return <Layer>{lines}</Layer>;
});

export default Grid;