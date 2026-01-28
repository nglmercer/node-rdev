# rdev-node

A high-performance Node.js native addon for listening to system-wide keyboard and mouse events. Built with Rust.

## Install

```bash
npm install rdev-node
```

## Quick Start

```javascript
const { startListener } = require('rdev-node');

startListener((event) => {
  console.log(event);
});
```

## Requirements

- Node.js >= 10
- **Rust** (required to build from source) - Install from [rustup.rs](https://rustup.rs/)
- Linux: `libgtk-3-dev libxtst-dev`

## Build

```bash
npm install
npm run build
```

## API

### startListener(callback)

Listen to keyboard and mouse events.

```javascript
startListener((event) => {
  console.log('Type:', event.eventType);
  if (event.keyPress) console.log('Key:', event.keyPress.key);
  if (event.mouseMove) console.log('Position:', event.mouseMove.x, event.mouseMove.y);
});
```

### simulateEvent(event)

Simulate keyboard/mouse events.

```javascript
simulateEvent({
  eventType: 'KeyPress',
  keyPress: { key: 'KeyA' },
  time: Date.now()
});
```

### getDisplaySize()

Get main display dimensions.

```javascript
const { width, height } = getDisplaySize();
```

## Supported Platforms

- macOS (x64, arm64)
- Windows (x64, ia32, arm64)
- Linux (x64, arm64, armv7)
- Android (arm64, armv7)

## License

MIT
