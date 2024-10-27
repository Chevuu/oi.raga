import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Circle, Text } from 'react-konva';
import Minimap from './components/Minimap';
import Grid from './components/Grid';

function Game() {
  const [player, setPlayer] = useState({ x: 5000, y: 5000, mass: 20 });
  const [otherPlayers, setOtherPlayers] = useState([]);
  const [cells, setCells] = useState([]);
  const [blobs, setBlobs] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const stageRef = useRef();
  const socketRef = useRef(null);
  const playerId = useRef(null);

  const MAP_WIDTH = 10000;
  const MAP_HEIGHT = 10000;
  const GRID_SIZE = 50;
  const GRID_CELL_SIZE = 1000;

  const scale = Math.max(0.5, Math.min(1, Math.sqrt(20 / player.mass)));

  const stageX = -player.x * scale + window.innerWidth / 2;
  const stageY = -player.y * scale + window.innerHeight / 2;

  const viewport = {
    x: player.x - (window.innerWidth / 2) / scale,
    y: player.y - (window.innerHeight / 2) / scale,
    width: window.innerWidth / scale,
    height: window.innerHeight / scale,
  };

  function getRadius(mass) {
    return Math.sqrt(mass) * 4;
  }

  const spatialGrid = React.useMemo(() => {
    const grid = new Map();

    cells.forEach((cell) => {
      const cellX = Math.floor(cell.x / GRID_CELL_SIZE);
      const cellY = Math.floor(cell.y / GRID_CELL_SIZE);
      const key = `${cellX},${cellY}`;

      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key).push(cell);
    });

    return grid;
  }, [cells]);

  const nearbyCells = React.useMemo(() => {
    const playerCellX = Math.floor(player.x / GRID_CELL_SIZE);
    const playerCellY = Math.floor(player.y / GRID_CELL_SIZE);

    const nearby = [];

    for (let x = playerCellX - 1; x <= playerCellX + 1; x++) {
      for (let y = playerCellY - 1; y <= playerCellY + 1; y++) {
        const key = `${x},${y}`;
        if (spatialGrid.has(key)) {
          nearby.push(...spatialGrid.get(key));
        }
      }
    }

    return nearby;
  }, [player.x, player.y, spatialGrid]);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:6789');

    socketRef.current.onopen = () => {
      console.log('Connected to server');
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.playerId) {
        playerId.current = data.playerId;
      } else {
        const playersData = data.players;
        const others = playersData.filter((p) => p.id !== playerId.current);
        setOtherPlayers(others);

        if (data.cells) {
          setCells(data.cells);
        }

        if (data.blobs) {
          setBlobs(data.blobs);
        }

        const me = playersData.find((p) => p.id === playerId.current);
        if (me) {
          setPlayer((prev) => ({
            ...prev,
            mass: me.mass,
          }));
        }
      }
    };

    socketRef.current.onclose = () => {
      console.log('Disconnected from server');
    };

    return () => {
      socketRef.current.close();
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      setMousePos({ x: mouseX, y: mouseY });

      const angle = Math.atan2(
        mouseY - window.innerHeight / 2,
        mouseX - window.innerWidth / 2
      );

      const speed = 5;

      setPlayer((prev) => {
        let newX = prev.x + Math.cos(angle) * speed;
        let newY = prev.y + Math.sin(angle) * speed;

        const radius = getRadius(prev.mass);
        newX = Math.max(radius, Math.min(MAP_WIDTH - radius, newX));
        newY = Math.max(radius, Math.min(MAP_HEIGHT - radius, newY));

        return { ...prev, x: newX, y: newY };
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'w') {
        if (player.mass > 10) {
          const angle = Math.atan2(
            mousePos.y - window.innerHeight / 2,
            mousePos.x - window.innerWidth / 2
          );

          if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
          ) {
            socketRef.current.send(
              JSON.stringify({ fireBlob: true, angle })
            );
          }

          setPlayer((prevPlayer) => ({
            ...prevPlayer,
            mass: prevPlayer.mass - 10,
          }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [player.mass, mousePos]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        const playerData = {
          x: player.x,
          y: player.y,
        };
        socketRef.current.send(JSON.stringify(playerData));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [player]);

  useEffect(() => {
    nearbyCells.forEach((cell) => {
      const dx = cell.x - player.x;
      const dy = cell.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const playerRadius = getRadius(player.mass);
      const cellRadius = getRadius(cell.mass);

      if (distance < playerRadius + cellRadius) {
        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          socketRef.current.send(
            JSON.stringify({ consumedCellId: cell.id })
          );
        }
      }
    });
  }, [player, nearbyCells]);

  return (
    <>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        x={stageX}
        y={stageY}
        scaleX={scale}
        scaleY={scale}
        ref={stageRef}
        draggable={false}
      >
        <Grid
          mapWidth={MAP_WIDTH}
          mapHeight={MAP_HEIGHT}
          gridSize={GRID_SIZE}
          viewport={viewport}
        />
        <Layer>
          <Circle
            x={player.x}
            y={player.y}
            radius={getRadius(player.mass)}
            opacity={0.75}
            stroke="black"
            strokeWidth={2}
            fill="blue"
          />

          {otherPlayers.map((p) => (
            <Circle
              key={p.id}
              x={p.x}
              y={p.y}
              radius={getRadius(p.mass)}
              fill="red"
            />
          ))}

          {nearbyCells.map((cell) => (
            <Circle
              key={cell.id}
              x={cell.x}
              y={cell.y}
              radius={getRadius(cell.mass)}
              fill={cell.color}
            />
          ))}

          {blobs.map((blob) => (
            <Circle
              key={blob.id}
              x={blob.x}
              y={blob.y}
              radius={getRadius(blob.mass)}
              fill="yellow"
            />
          ))}

          <Text
            text={`Mass: ${Math.round(player.mass)}`}
            fontSize={20}
            fill="black"
            x={viewport.x + 10}
            y={viewport.y + viewport.height - 30}
          />
        </Layer>
      </Stage>
      <Minimap
        playerX={player.x}
        playerY={player.y}
        mapWidth={MAP_WIDTH}
        mapHeight={MAP_HEIGHT}
      />
    </>
  );
}

export default Game;