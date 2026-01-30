/**
 * Global input handling for Webcam Manager
 * Uses rdev-node for keyboard/mouse event listening and simulation
 */

import { startListener, InputEvent, EventTypeValue } from '../index'

import { createLogger } from './logger.js'

export interface InputConfig {
  globalShortcutsEnabled: boolean
  blockInputWhenActive: boolean
  shortcuts: Record<string, string> // action -> key combination
}

const logger = createLogger('Input')

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

  const key = parts.find((p) => !['ctrl', 'control', 'shift', 'alt', 'option', 'meta', 'command', 'cmd'].includes(p)) || ''

  // Map key names from shortcut format to normalized format used in pressedKeys
  const keyMap: Record<string, string> = {
    '1': 'num1',
    '2': 'num2',
    '3': 'num3',
    '4': 'num4',
    '5': 'num5',
    '6': 'num6',
    '7': 'num7',
    '8': 'num8',
    '9': 'num9',
    '0': 'num0',
    'c': 'keyc',
    's': 'keys',
    'h': 'keyh',
    't': 'keyt',
    'm': 'keym',
    'r': 'keyr',
  }

  return {
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt') || parts.includes('option'),
    meta: parts.includes('meta') || parts.includes('command') || parts.includes('cmd'),
    key: keyMap[key] || key,
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
   * Maps KeyCode values to simplified modifier names
   */
  private normalizeKeyName(key: string): string {
    const keyMap: Record<string, string> = {
      controlleft: 'ctrl',
      controlright: 'ctrl',
      shiftleft: 'shift',
      shiftright: 'shift',
      alt: 'alt',
      altgr: 'alt',
      metaleft: 'meta',
      metaright: 'meta',
    }
    return keyMap[key.toLowerCase()] || key.toLowerCase()
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
      if (['ctrl', 'shift', 'alt', 'meta'].includes(pressedKey)) continue

      // Check if key matches (the main key, not modifiers)
      // parsed.key is already lowercase from parseKeyCombo, pressedKey is normalized to lowercase
      if (parsed.key !== pressedKey) continue

      // Check modifiers - use the normalized key names that are stored in pressedKeys
      const hasCtrl = this.pressedKeys.has('ctrl')
      const hasShift = this.pressedKeys.has('shift')
      const hasAlt = this.pressedKeys.has('alt')
      const hasMeta = this.pressedKeys.has('meta')

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
