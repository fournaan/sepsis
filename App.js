import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

const COLS = 20;
const ROWS = 20;
const CELL = Math.floor((Math.min(SW, SH) * 0.88) / COLS);
const BOARD_W = CELL * COLS;
const BOARD_H = CELL * ROWS;

function randomFood(snake) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

const INIT_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

export default function App() {
  const [tick, setTick] = useState(0);

  const g = useRef({
    snake: INIT_SNAKE,
    food: { x: 15, y: 10 },
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    state: 'idle', // idle | playing | dead
    score: 0,
    highScore: 0,
    speed: 160,
    interval: null,
  }).current;

  const bump = () => setTick((n) => n + 1);

  const gameTick = () => {
    if (g.state !== 'playing') return;
    g.dir = g.nextDir;

    const head = g.snake[0];
    const newHead = {
      x: (head.x + g.dir.x + COLS) % COLS,
      y: (head.y + g.dir.y + ROWS) % ROWS,
    };

    // Self collision
    if (g.snake.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      g.state = 'dead';
      g.highScore = Math.max(g.highScore, g.score);
      clearInterval(g.interval);
      bump();
      return;
    }

    const ateFood = newHead.x === g.food.x && newHead.y === g.food.y;

    if (ateFood) {
      g.snake = [newHead, ...g.snake];
      g.score += 10;
      g.food = randomFood(g.snake);
      g.speed = Math.max(65, g.speed - 4);
      clearInterval(g.interval);
      g.interval = setInterval(gameTick, g.speed);
    } else {
      g.snake = [newHead, ...g.snake.slice(0, -1)];
    }

    bump();
  };

  const startGame = () => {
    g.snake = [...INIT_SNAKE];
    g.food = randomFood(g.snake);
    g.dir = { x: 1, y: 0 };
    g.nextDir = { x: 1, y: 0 };
    g.score = 0;
    g.speed = 160;
    g.state = 'playing';
    clearInterval(g.interval);
    g.interval = setInterval(gameTick, g.speed);
    bump();
  };

  useEffect(() => () => clearInterval(g.interval), []);

  const swipe = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gs) => {
        const { dx, dy } = gs;
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        const cur = g.dir;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0 && cur.x !== -1) g.nextDir = { x: 1, y: 0 };
          else if (dx < 0 && cur.x !== 1) g.nextDir = { x: -1, y: 0 };
        } else {
          if (dy > 0 && cur.y !== -1) g.nextDir = { x: 0, y: 1 };
          else if (dy < 0 && cur.y !== 1) g.nextDir = { x: 0, y: -1 };
        }
      },
    })
  ).current;

  const setDir = (dir) => {
    const cur = g.dir;
    if (dir === 'U' && cur.y !== 1) g.nextDir = { x: 0, y: -1 };
    if (dir === 'D' && cur.y !== -1) g.nextDir = { x: 0, y: 1 };
    if (dir === 'L' && cur.x !== 1) g.nextDir = { x: -1, y: 0 };
    if (dir === 'R' && cur.x !== -1) g.nextDir = { x: 1, y: 0 };
  };

  // Build board
  const headKey = `${g.snake[0].x},${g.snake[0].y}`;
  const snakeMap = new Map();
  g.snake.forEach((s, i) => snakeMap.set(`${s.x},${s.y}`, i));

  const cells = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const key = `${x},${y}`;
      const idx = snakeMap.get(key);
      const isHead = key === headKey;
      const isSnake = idx !== undefined;
      const isFood = x === g.food.x && y === g.food.y;
      cells.push(
        <View
          key={key}
          style={[
            styles.cell,
            isHead && styles.head,
            isSnake && !isHead && styles.body,
            isFood && styles.food,
          ]}
        />
      );
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SNAKE</Text>
          <View style={styles.scores}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>SCORE</Text>
              <Text style={styles.scoreVal}>{g.score}</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>BEST</Text>
              <Text style={styles.scoreVal}>{g.highScore}</Text>
            </View>
          </View>
        </View>

        {/* Board */}
        <View style={styles.boardWrap} {...swipe.panHandlers}>
          <View style={styles.board}>{cells}</View>
          {g.state !== 'playing' && (
            <View style={styles.overlay}>
              {g.state === 'dead' ? (
                <>
                  <Text style={styles.overlayTitle}>GAME{'\n'}OVER</Text>
                  <Text style={styles.overlayScore}>{g.score} pts</Text>
                  {g.score === g.highScore && g.score > 0 && (
                    <Text style={styles.newBest}>✦ NEW BEST ✦</Text>
                  )}
                  <TouchableOpacity style={styles.btn} onPress={startGame} activeOpacity={0.7}>
                    <Text style={styles.btnText}>PLAY AGAIN</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.overlayTitle}>SNAKE</Text>
                  <Text style={styles.overlayHint}>Swipe or use buttons{'\n'}to control the snake</Text>
                  <TouchableOpacity style={styles.btn} onPress={startGame} activeOpacity={0.7}>
                    <Text style={styles.btnText}>START</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {/* D-Pad */}
        <View style={styles.dpad}>
          <TouchableOpacity style={styles.dpadBtn} onPress={() => setDir('U')} activeOpacity={0.6}>
            <Text style={styles.dpadText}>▲</Text>
          </TouchableOpacity>
          <View style={styles.dpadRow}>
            <TouchableOpacity style={styles.dpadBtn} onPress={() => setDir('L')} activeOpacity={0.6}>
              <Text style={styles.dpadText}>◀</Text>
            </TouchableOpacity>
            <View style={[styles.dpadBtn, { backgroundColor: 'transparent' }]} />
            <TouchableOpacity style={styles.dpadBtn} onPress={() => setDir('R')} activeOpacity={0.6}>
              <Text style={styles.dpadText}>▶</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.dpadBtn} onPress={() => setDir('D')} activeOpacity={0.6}>
            <Text style={styles.dpadText}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BTN_SIZE = 48;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#070710' },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#070710',
  },
  header: {
    width: BOARD_W,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#39ff88',
    letterSpacing: 10,
  },
  scores: { flexDirection: 'row', gap: 16 },
  scoreBox: { alignItems: 'center' },
  scoreLabel: { color: '#39ff8866', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  scoreVal: { color: '#39ff88', fontSize: 22, fontWeight: '900' },

  boardWrap: { position: 'relative' },
  board: {
    width: BOARD_W,
    height: BOARD_H,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0d0d1a',
    borderWidth: 1.5,
    borderColor: '#39ff8830',
  },
  cell: { width: CELL, height: CELL },
  head: {
    backgroundColor: '#39ff88',
    borderRadius: 4,
    shadowColor: '#39ff88',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  body: {
    backgroundColor: '#1dcc66',
    borderRadius: 3,
  },
  food: {
    backgroundColor: '#ff3366',
    borderRadius: CELL,
    shadowColor: '#ff3366',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(7,7,16,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  overlayTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#39ff88',
    letterSpacing: 6,
    textAlign: 'center',
    lineHeight: 52,
    shadowColor: '#39ff88',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  overlayScore: { fontSize: 24, color: '#aaa', fontWeight: '700' },
  newBest: { fontSize: 14, color: '#ffd700', fontWeight: '800', letterSpacing: 3 },
  overlayHint: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 22 },
  btn: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#39ff88',
    marginTop: 8,
  },
  btnText: {
    color: '#39ff88',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 4,
  },

  dpad: { alignItems: 'center', gap: 4 },
  dpadRow: { flexDirection: 'row', gap: 4 },
  dpadBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    backgroundColor: '#0d0d1a',
    borderWidth: 1,
    borderColor: '#39ff8840',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  dpadText: { color: '#39ff88', fontSize: 18 },
});
