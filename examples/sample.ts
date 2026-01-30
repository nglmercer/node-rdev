/**
 * Global input handling for Webcam Manager
 * Uses rdev-node for keyboard/mouse event listening and simulation
 */

import { simulateEvent, EventTypeValue, KeyCode } from '../index'
import { createDefaultInputConfig, InputManager} from './keymanager'

async function main() {
  const config = createDefaultInputConfig()
  const manager = new InputManager(config)

  // Register a test handler for the toggle-camera shortcut
  manager.registerShortcut('toggle-camera', () => {
    console.log('✅ Shortcut Ctrl+Shift+C triggered!')
  })

  // Register handlers for other shortcuts
  manager.registerShortcut('screenshot', () => {
    console.log('✅ Screenshot shortcut triggered!')
  })

  manager.registerShortcut('hide-window', () => {
    console.log('✅ Hide window shortcut triggered!')
  })

  manager.registerShortcut('position-top-left', () => {
    console.log('✅ Position top-left shortcut triggered!')
  })

  manager.setEventCallback((event) => {
    if (event.eventType === EventTypeValue.KeyPress) {
      console.log('Key pressed:', event.keyPress?.key, '| Currently pressed:', manager.getPressedKeys())
    }
  })

  manager.initialize()
  console.log('Input manager started. Testing shortcut via simulateEvent...')
  console.log('Configured shortcuts:', config.shortcuts)

  // Wait a bit for the listener to be ready
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Simulate Ctrl+Shift+C shortcut
  console.log('\n--- Simulating Ctrl+Shift+C ---')

  simulateEvent({
    eventType: EventTypeValue.KeyPress,
    keyPress: { key: KeyCode.ControlLeft },
    time: Date.now(),
  })

  simulateEvent({
    eventType: EventTypeValue.KeyPress,
    keyPress: { key: KeyCode.ShiftLeft },
    time: Date.now() + 10,
  })

  simulateEvent({
    eventType: EventTypeValue.KeyPress,
    keyPress: { key: KeyCode.KeyC },
    time: Date.now() + 20,
  })

  simulateEvent({
    eventType: EventTypeValue.KeyRelease,
    keyRelease: { key: KeyCode.KeyC },
    time: Date.now() + 30,
  })

  simulateEvent({
    eventType: EventTypeValue.KeyRelease,
    keyRelease: { key: KeyCode.ShiftLeft },
    time: Date.now() + 40,
  })

  simulateEvent({
    eventType: EventTypeValue.KeyRelease,
    keyRelease: { key: KeyCode.ControlLeft },
    time: Date.now() + 50,
  })

  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('\n--- Final pressed keys state ---')
  console.log('Currently pressed:', manager.getPressedKeys())
}

main()
