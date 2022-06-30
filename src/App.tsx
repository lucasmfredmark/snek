import React, { useCallback, useEffect, useState } from 'react';
import { Backdrop, Box, Typography } from '@material-ui/core';
import { Star as StarIcon } from '@material-ui/icons';
import { useInterval } from './hooks';

const gridRows = 20;
const gridColumns = 20;
const gridCellSize = 20;

enum GameState {
  Playing,
  Win,
  Loss,
}
enum Direction {
  North,
  South,
  West,
  East,
}
type Coordinate = {
  x: number;
  y: number;
};

const getRandomNumberFromRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const getRandomCoordinate = (): Coordinate => ({
  x: getRandomNumberFromRange(0, gridRows - 1),
  y: getRandomNumberFromRange(0, gridColumns - 1),
});

const getCenterCoordinate = (): Coordinate => ({
  x: ~~(gridRows / 2),
  y: ~~(gridColumns / 2),
});

const getNextCoordinate = (
  current: Coordinate,
  direction: Direction
): Coordinate => {
  if (direction === Direction.North) return { x: current.x, y: current.y - 1 };
  if (direction === Direction.South) return { x: current.x, y: current.y + 1 };
  if (direction === Direction.West) return { x: current.x - 1, y: current.y };
  if (direction === Direction.East) return { x: current.x + 1, y: current.y };
  return current;
};

const isSameCoordinate = (a: Coordinate, b: Coordinate) =>
  a.x === b.x && a.y === b.y;

const isOutOfBounds = ({ x, y }: Coordinate) =>
  x < 0 || x >= gridColumns || y < 0 || y >= gridRows;

const getGameSpeed = (snakeLength: number) => {
  const gridCells = gridRows * gridColumns;
  const percentageCompleted = (snakeLength / gridCells) * 100;

  if (percentageCompleted < 5) return 200;
  if (percentageCompleted < 15) return 180;
  if (percentageCompleted < 30) return 155;
  if (percentageCompleted < 50) return 125;
  if (percentageCompleted < 75) return 90;
  return 50;
};

function App() {
  const [gameState, setGameState] = useState(GameState.Playing);
  const [currentDirection, setCurrentDirection] = useState(Direction.East);
  const [lastDirection, setLastDirection] = useState(currentDirection);
  const [snake, setSnake] = useState<Coordinate[]>([getCenterCoordinate()]);
  const [food, setFood] = useState<Coordinate>(getRandomCoordinate());

  const gameTick = useCallback(() => {
    setLastDirection(currentDirection);
    const nextCoordinate = getNextCoordinate(snake[0], currentDirection);

    if (isOutOfBounds(nextCoordinate)) {
      return setGameState(GameState.Loss);
    }

    if (snake.some((c) => isSameCoordinate(c, nextCoordinate))) {
      return setGameState(GameState.Loss);
    }

    if (isSameCoordinate(food, nextCoordinate)) {
      setFood(getRandomCoordinate());
      setSnake([{ x: food.x, y: food.y }, ...snake]);
      return;
    }

    setSnake([nextCoordinate, ...snake.slice(0, snake.length - 1)]);
  }, [currentDirection, food, snake]);

  useEffect(() => {
    const onKeyDown = ({ code }: KeyboardEvent) => {
      if (code === 'Space' && gameState !== GameState.Playing) {
        setGameState(GameState.Playing);
        setCurrentDirection(Direction.East);
        setLastDirection(Direction.East);
        setSnake([getCenterCoordinate()]);
        setFood(getRandomCoordinate());
        return;
      }

      if (code === 'ArrowUp' && lastDirection !== Direction.South) {
        return setCurrentDirection(Direction.North);
      }
      if (code === 'ArrowDown' && lastDirection !== Direction.North) {
        return setCurrentDirection(Direction.South);
      }
      if (code === 'ArrowLeft' && lastDirection !== Direction.East) {
        return setCurrentDirection(Direction.West);
      }
      if (code === 'ArrowRight' && lastDirection !== Direction.West) {
        return setCurrentDirection(Direction.East);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, lastDirection]);

  useInterval(
    gameTick,
    gameState === GameState.Playing ? getGameSpeed(snake.length) : null
  );

  return (
    <Box
      sx={{
        width: gridColumns * gridCellSize,
        height: gridRows * gridCellSize,
        position: 'relative',
      }}
    >
      {gameState !== GameState.Playing && (
        <Backdrop open={true} sx={{ color: 'white', position: 'absolute' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            {gameState === GameState.Win && (
              <StarIcon
                sx={{
                  margin: 'auto',
                  marginBottom: 2,
                  fontSize: 80,
                  color: 'yellow',
                }}
              />
            )}
            <Typography variant="h2" marginBottom={2}>
              {gameState === GameState.Win ? 'You won!' : 'You lost!'}
            </Typography>
            <Typography variant="h4" marginBottom={2}>
              <strong>Points:</strong> {snake.length - 1}
            </Typography>
            <Typography variant="h6">Press spacebar to play again.</Typography>
          </Box>
        </Backdrop>
      )}
      {[...Array(gridRows)].map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex' }}>
          {[...Array(gridColumns)].map((_, columnIndex) => (
            <Box
              key={columnIndex}
              sx={{
                width: gridCellSize,
                height: gridCellSize,
                outline: '1px solid #ccc',
                backgroundColor: snake.find((c) =>
                  isSameCoordinate(c, { x: columnIndex, y: rowIndex })
                )
                  ? 'black'
                  : isSameCoordinate(food, { x: columnIndex, y: rowIndex })
                  ? 'red'
                  : 'white',
              }}
            ></Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default App;
