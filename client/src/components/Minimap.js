import React from 'react';

function Minimap({ playerX, playerY, mapWidth, mapHeight }) {
  const MINIMAP_SIZE = 150;
  const dotX = (playerX / mapWidth) * MINIMAP_SIZE;
  const dotY = (playerY / mapHeight) * MINIMAP_SIZE;

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: MINIMAP_SIZE,
        height: MINIMAP_SIZE,
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        border: '1px solid #000',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: dotX - 2.5,
          top: dotY - 2.5,
          width: 5,
          height: 5,
          backgroundColor: 'red',
          borderRadius: '50%',
        }}
      ></div>
    </div>
  );
}

export default Minimap;