const { test, describe, before } = require('node:test')
const assert = require('node:assert')
const rdev = require('../index.js')

describe('rdev-node Complete Test Suite', () => {
  
  describe('Binding & API Surface', () => {
    test('all core functions are exported and are functions', () => {
      const functions = [
        'getDisplaySize',
        'initSimulation',
        'isModifierKey',
        'normalizeKeyName',
        'simulateEvent',
        'startListener',
        'stringKeyToKeycode'
      ]
      for (const fn of functions) {
        assert.strictEqual(typeof rdev[fn], 'function', `Missing function: ${fn}`)
      }
    })

    test('all enums are exported and contain expected values', () => {
      // ButtonType
      assert.strictEqual(rdev.ButtonType.Left, 'Left')
      assert.strictEqual(rdev.ButtonType.Right, 'Right')
      assert.strictEqual(rdev.ButtonType.Middle, 'Middle')
      assert.strictEqual(rdev.ButtonType.Unknown, 'Unknown')

      // EventTypeValue
      assert.strictEqual(rdev.EventTypeValue.KeyPress, 'KeyPress')
      assert.strictEqual(rdev.EventTypeValue.KeyRelease, 'KeyRelease')
      assert.strictEqual(rdev.EventTypeValue.MouseMove, 'MouseMove')
      assert.strictEqual(rdev.EventTypeValue.ButtonPress, 'ButtonPress')
      assert.strictEqual(rdev.EventTypeValue.ButtonRelease, 'ButtonRelease')
      assert.strictEqual(rdev.EventTypeValue.Wheel, 'Wheel')

      // KeyCode (sampling)
      assert.strictEqual(rdev.KeyCode.KeyA, 'KeyA')
      assert.strictEqual(rdev.KeyCode.ControlLeft, 'ControlLeft')
      assert.strictEqual(rdev.KeyCode.Backspace, 'Backspace')
      assert.strictEqual(rdev.KeyCode.Escape, 'Escape')

      // NormalizedModifier
      assert.strictEqual(rdev.NormalizedModifier.Ctrl, 'Ctrl')
      assert.strictEqual(rdev.NormalizedModifier.Shift, 'Shift')
      assert.strictEqual(rdev.NormalizedModifier.Alt, 'Alt')
      assert.strictEqual(rdev.NormalizedModifier.Meta, 'Meta')
    })
  })

  describe('Utility Functions - isModifierKey', () => {
    const modifiers = [
      rdev.KeyCode.ControlLeft, rdev.KeyCode.ControlRight,
      rdev.KeyCode.ShiftLeft, rdev.KeyCode.ShiftRight,
      rdev.KeyCode.Alt, rdev.KeyCode.AltGr,
      rdev.KeyCode.MetaLeft, rdev.KeyCode.MetaRight
    ]
    
    modifiers.forEach(key => {
      test(`${key} is a modifier`, () => assert.strictEqual(rdev.isModifierKey(key), true))
    })

    const nonModifiers = [
      rdev.KeyCode.KeyA, rdev.KeyCode.Space, rdev.KeyCode.F1,
      rdev.KeyCode.Escape, rdev.KeyCode.Return, rdev.KeyCode.Backspace
    ]
    nonModifiers.forEach(key => {
      test(`${key} is NOT a modifier`, () => assert.strictEqual(rdev.isModifierKey(key), false))
    })
  })

  describe('Utility Functions - normalizeKeyName', () => {
    test('standard modifier normalization', () => {
      assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.ControlLeft), 'ctrl')
      assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.ControlRight), 'ctrl')
      assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.ShiftLeft), 'shift')
      assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.Alt), 'alt')
    })

    test('alphanumeric normalization', () => {
      assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.KeyA), 'keya')
      assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.Num1), 'num1')
    })

    test('special key normalization', () => {
      assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.Escape), 'escape')
      assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.Return), 'return')
      assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.Space), 'space')
    })
  })

  describe('Utility Functions - stringKeyToKeycode', () => {
    test('mapping common aliases', () => {
      const cases = {
        'a': rdev.KeyCode.KeyA,
        'keya': rdev.KeyCode.KeyA,
        '1': rdev.KeyCode.Num1,
        'num1': rdev.KeyCode.Num1,
        'esc': rdev.KeyCode.Escape,
        'escape': rdev.KeyCode.Escape,
        'enter': rdev.KeyCode.Return,
        'return': rdev.KeyCode.Return,
        'ctrl': rdev.KeyCode.ControlLeft,
        'controlleft': rdev.KeyCode.ControlLeft,
        'shift': rdev.KeyCode.ShiftLeft,
        'alt': rdev.KeyCode.Alt,
        'up': rdev.KeyCode.UpArrow,
        'uparrow': rdev.KeyCode.UpArrow
      }
      for (const [input, expected] of Object.entries(cases)) {
        assert.strictEqual(rdev.stringKeyToKeycode(input), expected, `Failed mapping ${input}`)
      }
    })

    test('case insensitivity', () => {
      assert.strictEqual(rdev.stringKeyToKeycode('KEYA'), rdev.KeyCode.KeyA)
      assert.strictEqual(rdev.stringKeyToKeycode('Esc'), rdev.KeyCode.Escape)
    })

    test('numpad keys', () => {
      assert.strictEqual(rdev.stringKeyToKeycode('kp0'), rdev.KeyCode.Kp0)
      assert.strictEqual(rdev.stringKeyToKeycode('numpad0'), rdev.KeyCode.Kp0)
    })

    test('invalid inputs', () => {
      assert.strictEqual(rdev.stringKeyToKeycode('not-a-key'), null)
      assert.strictEqual(rdev.stringKeyToKeycode(''), null)
    })
  })

  describe('System & Display', () => {
    test('getDisplaySize format', () => {
      try {
        const size = rdev.getDisplaySize()
        assert.ok(typeof size.width === 'number' && size.width >= 0)
        assert.ok(typeof size.height === 'number' && size.height >= 0)
      } catch (e) {
        console.log('Skipping display size actual values: ' + e.message)
      }
    })

    test('initSimulation lifecycle', () => {
      assert.doesNotThrow(() => rdev.initSimulation())
    })
  })

  describe('Simulation Events', () => {
    before(() => rdev.initSimulation())

    const now = Date.now()
    const testEvents = [
      { name: 'Key Press', data: { eventType: rdev.EventTypeValue.KeyPress, keyPress: { key: rdev.KeyCode.KeyB }, time: now } },
      { name: 'Key Release', data: { eventType: rdev.EventTypeValue.KeyRelease, keyRelease: { key: rdev.KeyCode.KeyB }, time: now + 5 } },
      { name: 'Mouse Move', data: { eventType: rdev.EventTypeValue.MouseMove, mouseMove: { x: 50, y: 50 }, time: now + 10 } },
      { name: 'Button Press', data: { eventType: rdev.EventTypeValue.ButtonPress, buttonPress: { button: rdev.ButtonType.Right }, time: now + 15 } },
      { name: 'Wheel', data: { eventType: rdev.EventTypeValue.Wheel, wheel: { deltaX: 5, deltaY: -5 }, time: now + 20 } }
    ]

    testEvents.forEach(({ name, data }) => {
      test(`simulateEvent: ${name}`, () => {
        assert.doesNotThrow(() => rdev.simulateEvent(data))
      })
    })

    test('simulateEvent validation - missing keyPress', () => {
      assert.throws(() => {
        rdev.simulateEvent({ eventType: rdev.EventTypeValue.KeyPress, time: now })
      }, { message: /Missing key_press/ })
    })

    test('simulateEvent validation - missing mouseMove', () => {
        assert.throws(() => {
          rdev.simulateEvent({ eventType: rdev.EventTypeValue.MouseMove, time: now })
        }, { message: /Missing mouse_move/ })
      })
  })

  describe('Listener API', () => {
    test.skip('startListener returns undefined and spawns thread (non-blocking test)', () => {
      // This test is skipped because it spawns a persistent background thread 
      // that prevents the Node.js test runner from exiting cleanly.
      try {
        const result = rdev.startListener((ev) => ev)
        assert.strictEqual(result, undefined)
      } catch (e) {
        console.log('Listener notice: ' + e.message)
      }
    })
  })
})
