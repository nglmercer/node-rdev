import { startListener, EventTypeValue, simulateEvent, KeyCode, initSimulation } from '../index'

async function main() {
  // Initialize simulation system first (required on Linux/X11)
  console.log('Initializing simulation...')
  initSimulation()
  console.log('Simulation initialized')

  // Wait a bit for initialization to complete
  await new Promise((resolve) => setTimeout(resolve, 100))

  console.log('Simulating KeyA press...')
  simulateEvent({
    eventType: EventTypeValue.KeyPress,
    keyPress: {
      key: KeyCode.KeyA,
    },
    time: 1000,
  })
  console.log('KeyA press simulated')

  // Release the key after a short delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  console.log('Simulating KeyA release...')
  simulateEvent({
    eventType: EventTypeValue.KeyRelease,
    keyRelease: {
      key: KeyCode.KeyA,
    },
    time: 1000,
  })
  console.log('KeyA release simulated')
  // Optional: Start listener to see events
  startListener((data) => {
    if (data.keyPress?.key === KeyCode.KeyA) {
      console.log('Received:', data)
    }
    return data
  })
}

main().catch(console.error)
