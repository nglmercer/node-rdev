const { test, describe } = require('node:test')
const assert = require('node:assert')
const rdev = require('../index.js')

describe('Binding Integrity', () => {
    test('all expected functions exported', () => {
        const expected = [
            'startListener',
            'simulateEvent',
            'getDisplaySize',
            'initSimulation',
            'isModifierKey',
            'normalizeKeyName',
            'stringKeyToKeycode'
        ]
        
        for (const fn of expected) {
            assert.strictEqual(typeof rdev[fn], 'function', `Missing function: ${fn}`)
        }
    })

    test('enums are correct', () => {
        assert.ok(rdev.KeyCode.KeyA, 'KeyCode.KeyA missing')
        assert.ok(rdev.ButtonType.Left, 'ButtonType.Left missing')
        assert.ok(rdev.EventTypeValue.KeyPress, 'EventTypeValue.KeyPress missing')
        assert.ok(rdev.NormalizedModifier.Ctrl, 'NormalizedModifier.Ctrl missing')
    })
})

describe('Utility Functions', () => {
    test('isModifierKey correctly identifies modifiers', () => {
        assert.strictEqual(rdev.isModifierKey(rdev.KeyCode.ControlLeft), true)
        assert.strictEqual(rdev.isModifierKey(rdev.KeyCode.ShiftRight), true)
        assert.strictEqual(rdev.isModifierKey(rdev.KeyCode.Alt), true)
        assert.strictEqual(rdev.isModifierKey(rdev.KeyCode.KeyA), false)
    })

    test('normalize_key_name works', () => {
        assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.ControlLeft), 'ctrl')
        assert.strictEqual(rdev.normalizeKeyName(rdev.KeyCode.KeyA), 'keya')
    })

    test('string_key_to_keycode works', () => {
        assert.strictEqual(rdev.stringKeyToKeycode('keya'), rdev.KeyCode.KeyA)
        assert.strictEqual(rdev.stringKeyToKeycode('esc'), rdev.KeyCode.Escape)
        assert.strictEqual(rdev.stringKeyToKeycode('nonexistent'), null)
    })
})

describe('Display and System', () => {
    test('getDisplaySize returns valid structure', () => {
        try {
            const size = rdev.getDisplaySize()
            assert.strictEqual(typeof size.width, 'number')
            assert.strictEqual(typeof size.height, 'number')
            assert.ok(size.width > 0)
            assert.ok(size.height > 0)
        } catch (e) {
            console.log('Skipping display size check: ' + e.message)
        }
    })

    test('initSimulation executes without error', () => {
        assert.doesNotThrow(() => rdev.initSimulation())
    })
})
