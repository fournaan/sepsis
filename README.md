# 🐍 Snake Neon

A neon-styled Snake game built with React Native + Expo. Play instantly on iOS via Expo Go.

## Play on iOS (no build needed)

1. Install **Expo Go** from the App Store
2. Clone this repo and install deps:

```bash
git clone https://github.com/fournaan/sepsis.git
cd sepsis
npm install
npx expo start
```

3. Scan the QR code in your terminal with the **Camera app** (iOS 16+) or the Expo Go app

## Controls

- **Swipe** anywhere on the board to change direction
- **D-pad buttons** below the board for precise control

## How to Play

- Guide the snake to eat the 🔴 red food
- Each food adds 10 points and the snake gets faster
- Don't run into yourself — the board wraps around the edges
- Beat your high score!

## Stack

- React Native
- Expo SDK 51
- Zero external game libraries — pure RN + `PanResponder`
