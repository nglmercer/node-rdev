/**
 * Global input handling for Webcam Manager
 * Uses rdev-node for keyboard/mouse event listening and simulation
 */

import { startListener, InputEvent, EventTypeValue, KeyCode } from '../index'

import { createLogger } from './logger.js'

export interface InputConfig {
  globalShortcutsEnabled: boolean
  blockInputWhenActive: boolean
  shortcuts: Record<string, string> // action -> key combination
}

const logger = createLogger('Input')

/** Modifier key types for shortcut parsing */
enum ModifierKey {
  Ctrl = 'ctrl',
  Control = 'control',
  Shift = 'shift',
  Alt = 'alt',
  Option = 'option',
  Meta = 'meta',
  Command = 'command',
  Cmd = 'cmd',
}

/** All modifier keys for filtering */
const MODIFIER_KEYS: readonly string[] = [
  ModifierKey.Ctrl,
  ModifierKey.Control,
  ModifierKey.Shift,
  ModifierKey.Alt,
  ModifierKey.Option,
  ModifierKey.Meta,
  ModifierKey.Command,
  ModifierKey.Cmd,
] as const

/** Normalized modifier names for pressedKeys Set */
enum NormalizedModifier {
  Ctrl = 'ctrl',
  Shift = 'shift',
  Alt = 'alt',
  Meta = 'meta',
}

/**
 * Maps shortcut key strings to KeyCode enum values (normalized to lowercase)
 * This ensures type-safe key mapping without magic strings
 */
const SHORTCUT_TO_KEYCODE: Readonly<Record<string, string>> = {
  '1': KeyCode.Num1.toLowerCase(),
  '2': KeyCode.Num2.toLowerCase(),
  '3': KeyCode.Num3.toLowerCase(),
  '4': KeyCode.Num4.toLowerCase(),
  '5': KeyCode.Num5.toLowerCase(),
  '6': KeyCode.Num6.toLowerCase(),
  '7': KeyCode.Num7.toLowerCase(),
  '8': KeyCode.Num8.toLowerCase(),
  '9': KeyCode.Num9.toLowerCase(),
  '0': KeyCode.Num0.toLowerCase(),
  'c': KeyCode.KeyC.toLowerCase(),
  's': KeyCode.KeyS.toLowerCase(),
  'h': KeyCode.KeyH.toLowerCase(),
  't': KeyCode.KeyT.toLowerCase(),
  'm': KeyCode.KeyM.toLowerCase(),
  'r': KeyCode.KeyR.toLowerCase(),
} as const

/**
 * Parse a key combination string (e.g., "Ctrl+Shift+C")
 */
export function parseKeyCombo(combo: string): {
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
  key: string
} {
  const parts = combo.split('+').map((p) => p.trim().toLowerCase())

  const key = parts.find((p) => !MODIFIER_KEYS.includes(p)) || ''

  return {
    ctrl: parts.includes(ModifierKey.Ctrl) || parts.includes(ModifierKey.Control),
    shift: parts.includes(ModifierKey.Shift),
    alt: parts.includes(ModifierKey.Alt) || parts.includes(ModifierKey.Option),
    meta: parts.includes(ModifierKey.Meta) || parts.includes(ModifierKey.Command) || parts.includes(ModifierKey.Cmd),
    key: SHORTCUT_TO_KEYCODE[key] || key,
  }
}

/**
 * Format key combo from parts
 */
export function formatKeyCombo(ctrl: boolean, shift: boolean, alt: boolean, meta: boolean, key: string): string {
  const parts: string[] = []
  if (ctrl) parts.push('Ctrl')
  if (shift) parts.push('Shift')
  if (alt) parts.push('Alt')
  if (meta) parts.push('Meta')
  if (key) parts.push(key.charAt(0).toUpperCase() + key.slice(1))
  return parts.join('+')
}

/**
 * Input manager class
 */
export class InputManager {
  private config: InputConfig
  private isListening = false
  private readonly pressedKeys: Set<string> = new Set()
  private readonly shortcutHandlers: Map<string, () => void> = new Map()
  private eventCallback: ((event: InputEvent) => void) | null = null
  isRunning = false

  constructor(config: InputConfig) {
    this.config = { ...config }
  }

  /**
   * Initialize input listening
   */
  initialize(): void {
    if (this.isListening) return

    try {
      startListener((event) => {
        this.handleInputEvent(event)
        return event
      })

      this.isListening = true
      logger.info('Input listener started')
    } catch (error) {
      logger.error('Failed to start input listener', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * Stop input listening
   */
  stop(): void {
    this.isRunning = false
    this.isListening = false
    this.pressedKeys.clear()
    logger.info('Input listener stopped')
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<InputConfig>): void {
    this.config = { ...this.config, ...config }
    logger.info('Input config updated')
  }

  /**
   * Register a shortcut handler
   */
  registerShortcut(action: string, handler: () => void): void {
    this.shortcutHandlers.set(action, handler)
    logger.debug('Shortcut registered', { action })
  }

  /**
   * Unregister a shortcut handler
   */
  unregisterShortcut(action: string): void {
    this.shortcutHandlers.delete(action)
    logger.debug('Shortcut unregistered', { action })
  }

  /**
   * Set event callback for all input events
   */
  setEventCallback(callback: (event: InputEvent) => void): void {
    this.eventCallback = callback
  }

  /**
   * Handle input events from rdev
   */
  private handleInputEvent(event: InputEvent): void {
    // Track pressed keys - normalize key names for comparison
    if (event.eventType === EventTypeValue.KeyPress && event.keyPress) {
      const keyStr = this.normalizeKeyName(String(event.keyPress.key))
      this.pressedKeys.add(keyStr)
      this.checkShortcuts(event)
    } else if (event.eventType === EventTypeValue.KeyRelease && event.keyRelease) {
      const keyStr = this.normalizeKeyName(String(event.keyRelease.key))
      this.pressedKeys.delete(keyStr)
    }
    // Forward event if callback is set
    if (this.eventCallback) {
      this.eventCallback(event)
    }
  }

  /**
   * Normalize key names for comparison
   * Maps KeyCode values to simplified modifier names using enum-based lookup
   */
  private normalizeKeyName(key: string): string {
    const normalizedKey = key.toLowerCase()

    // Map KeyCode values to normalized modifier names
    switch (normalizedKey) {
      case KeyCode.ControlLeft.toLowerCase():
      case KeyCode.ControlRight.toLowerCase():
        return NormalizedModifier.Ctrl
      case KeyCode.ShiftLeft.toLowerCase():
      case KeyCode.ShiftRight.toLowerCase():
        return NormalizedModifier.Shift
      case KeyCode.Alt.toLowerCase():
      case KeyCode.AltGr.toLowerCase():
        return NormalizedModifier.Alt
      case KeyCode.MetaLeft.toLowerCase():
      case KeyCode.MetaRight.toLowerCase():
        return NormalizedModifier.Meta
      default:
        return normalizedKey
    }
  }

  /**
   * Check if a shortcut was triggered
   */
  private checkShortcuts(event: InputEvent): void {
    if (!this.config.globalShortcutsEnabled) return
    if (event.eventType !== EventTypeValue.KeyPress || !event.keyPress) return

    const pressedKey = this.normalizeKeyName(String(event.keyPress.key))

    // Check each configured shortcut
    for (const [action, combo] of Object.entries(this.config.shortcuts)) {
      const parsed = parseKeyCombo(combo)

      // Skip if this is a modifier key being pressed (don't trigger on Ctrl+Shift+Ctrl)
      if (Object.values(NormalizedModifier).includes(pressedKey as NormalizedModifier)) continue

      // Check if key matches (the main key, not modifiers)
      // parsed.key is already lowercase from parseKeyCombo, pressedKey is normalized to lowercase
      if (parsed.key !== pressedKey) continue

      // Check modifiers - use the normalized key names that are stored in pressedKeys
      const hasCtrl = this.pressedKeys.has(NormalizedModifier.Ctrl)
      const hasShift = this.pressedKeys.has(NormalizedModifier.Shift)
      const hasAlt = this.pressedKeys.has(NormalizedModifier.Alt)
      const hasMeta = this.pressedKeys.has(NormalizedModifier.Meta)

      if (hasCtrl === parsed.ctrl && hasShift === parsed.shift && hasAlt === parsed.alt && hasMeta === parsed.meta) {
        logger.info('Shortcut triggered', { action, combo })

        const handler = this.shortcutHandlers.get(action)
        if (handler) {
          try {
            handler()
          } catch (error) {
            logger.error('Shortcut handler error', {
              action,
              error: error instanceof Error ? error.message : String(error),
            })
          }
        }

        break
      }
    }
  }

  /**
   * Get currently pressed keys
   */
  getPressedKeys(): string[] {
    return Array.from(this.pressedKeys)
  }

  /**
   * Check if a key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.pressedKeys.has(key.toLowerCase())
  }

  /**
   * Enable/disable global shortcuts
   */
  setGlobalShortcutsEnabled(enabled: boolean): void {
    this.config.globalShortcutsEnabled = enabled
    logger.info('Global shortcuts', { enabled })
  }

  /**
   * Toggle global shortcuts
   */
  toggleGlobalShortcuts(): boolean {
    this.config.globalShortcutsEnabled = !this.config.globalShortcutsEnabled
    logger.info('Global shortcuts toggled', { enabled: this.config.globalShortcutsEnabled })
    return this.config.globalShortcutsEnabled
  }

  /**
   * Check if listening
   */
  isActive(): boolean {
    return this.isListening
  }

  /**
   * Get configuration
   */
  getConfig(): InputConfig {
    return { ...this.config }
  }

  /**
   * Cleanup
   */
  dispose(): void {
    try {
      this.stop()
      this.shortcutHandlers.clear()
      this.eventCallback = null
      logger.info('Input manager disposed')
    } catch (error) {
      logger.error('Error disposing input manager', { error })
    }
  }
}

/**
 * Default shortcuts configuration
 * Note: Home, End, PageUp, PageDown are modifier keys that don't work well
 * as the main key in shortcuts. Use letter keys instead.
 */
export const DEFAULT_SHORTCUTS: Record<string, string> = {
  'toggle-camera': 'Ctrl+Shift+C',
  screenshot: 'Ctrl+Shift+S',
  'hide-window': 'Ctrl+Shift+H',
  'toggle-always-on-top': 'Ctrl+Shift+T',
  'position-top-left': 'Ctrl+Shift+1',
  'position-top-right': 'Ctrl+Shift+2',
  'position-bottom-left': 'Ctrl+Shift+3',
  'position-bottom-right': 'Ctrl+Shift+4',
  'position-center': 'Ctrl+Shift+5',
  minimize: 'Ctrl+Shift+M',
  restore: 'Ctrl+Shift+R',
}

/**
 * Create default input config
 */
export function createDefaultInputConfig(): InputConfig {
  return {
    globalShortcutsEnabled: true,
    blockInputWhenActive: false,
    shortcuts: { ...DEFAULT_SHORTCUTS },
  }
}
