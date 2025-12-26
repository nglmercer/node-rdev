use rdev::{EventType, Event, Key, Button};
use super::enums::*;
use super::events::*;

// Helper functions to convert rdev types to our enums
pub fn button_to_type(btn: &Button) -> ButtonType {
    match btn {
        Button::Left => ButtonType::Left,
        Button::Right => ButtonType::Right,
        Button::Middle => ButtonType::Middle,
        Button::Unknown(_) => ButtonType::Unknown,
    }
}

pub fn type_to_button(btn: ButtonType) -> Button {
    match btn {
        ButtonType::Left => Button::Left,
        ButtonType::Right => Button::Right,
        ButtonType::Middle => Button::Middle,
        ButtonType::Unknown => Button::Unknown(0),
    }
}

pub fn key_to_type(key: &Key) -> KeyCode {
    match key {
        Key::Alt => KeyCode::Alt,
        Key::AltGr => KeyCode::AltGr,
        Key::Backspace => KeyCode::Backspace,
        Key::CapsLock => KeyCode::CapsLock,
        Key::ControlLeft => KeyCode::ControlLeft,
        Key::ControlRight => KeyCode::ControlRight,
        Key::Delete => KeyCode::Delete,
        Key::DownArrow => KeyCode::DownArrow,
        Key::End => KeyCode::End,
        Key::Escape => KeyCode::Escape,
        Key::F1 => KeyCode::F1,
        Key::F10 => KeyCode::F10,
        Key::F11 => KeyCode::F11,
        Key::F12 => KeyCode::F12,
        Key::F2 => KeyCode::F2,
        Key::F3 => KeyCode::F3,
        Key::F4 => KeyCode::F4,
        Key::F5 => KeyCode::F5,
        Key::F6 => KeyCode::F6,
        Key::F7 => KeyCode::F7,
        Key::F8 => KeyCode::F8,
        Key::F9 => KeyCode::F9,
        Key::Home => KeyCode::Home,
        Key::LeftArrow => KeyCode::LeftArrow,
        Key::MetaLeft => KeyCode::MetaLeft,
        Key::MetaRight => KeyCode::MetaRight,
        Key::NumLock => KeyCode::NumLock,
        Key::PageDown => KeyCode::PageDown,
        Key::PageUp => KeyCode::PageUp,
        Key::Return => KeyCode::Return,
        Key::RightArrow => KeyCode::RightArrow,
        Key::ShiftLeft => KeyCode::ShiftLeft,
        Key::ShiftRight => KeyCode::ShiftRight,
        Key::Space => KeyCode::Space,
        Key::Tab => KeyCode::Tab,
        Key::UpArrow => KeyCode::UpArrow,
        Key::PrintScreen => KeyCode::PrintScreen,
        Key::ScrollLock => KeyCode::ScrollLock,
        Key::Pause => KeyCode::Pause,
        Key::Insert => KeyCode::Insert,
        _ => KeyCode::Unknown,
    }
}

pub fn type_to_key(key: KeyCode) -> Key {
    match key {
        KeyCode::Alt => Key::Alt,
        KeyCode::AltGr => Key::AltGr,
        KeyCode::Backspace => Key::Backspace,
        KeyCode::CapsLock => Key::CapsLock,
        KeyCode::ControlLeft => Key::ControlLeft,
        KeyCode::ControlRight => Key::ControlRight,
        KeyCode::Delete => Key::Delete,
        KeyCode::DownArrow => Key::DownArrow,
        KeyCode::End => Key::End,
        KeyCode::Escape => Key::Escape,
        KeyCode::F1 => Key::F1,
        KeyCode::F10 => Key::F10,
        KeyCode::F11 => Key::F11,
        KeyCode::F12 => Key::F12,
        KeyCode::F2 => Key::F2,
        KeyCode::F3 => Key::F3,
        KeyCode::F4 => Key::F4,
        KeyCode::F5 => Key::F5,
        KeyCode::F6 => Key::F6,
        KeyCode::F7 => Key::F7,
        KeyCode::F8 => Key::F8,
        KeyCode::F9 => Key::F9,
        KeyCode::Home => Key::Home,
        KeyCode::LeftArrow => Key::LeftArrow,
        KeyCode::MetaLeft => Key::MetaLeft,
        KeyCode::MetaRight => Key::MetaRight,
        KeyCode::NumLock => Key::NumLock,
        KeyCode::PageDown => Key::PageDown,
        KeyCode::PageUp => Key::PageUp,
        KeyCode::Return => Key::Return,
        KeyCode::RightArrow => Key::RightArrow,
        KeyCode::ShiftLeft => Key::ShiftLeft,
        KeyCode::ShiftRight => Key::ShiftRight,
        KeyCode::Space => Key::Space,
        KeyCode::Tab => Key::Tab,
        KeyCode::UpArrow => Key::UpArrow,
        KeyCode::PrintScreen => Key::PrintScreen,
        KeyCode::ScrollLock => Key::ScrollLock,
        KeyCode::Pause => Key::Pause,
        KeyCode::Insert => Key::Insert,
        _ => Key::Unknown(0),
    }
}

impl From<Event> for InputEvent {
    fn from(event: Event) -> Self {
        let (event_type, key_press, key_release, mouse_move, button_press, button_release, wheel) = 
            match &event.event_type {
                EventType::KeyPress(key) => (
                    EventTypeValue::KeyPress,
                    Some(KeyPressEvent { key: key_to_type(key) }),
                    None,
                    None,
                    None,
                    None,
                    None,
                ),
                EventType::KeyRelease(key) => (
                    EventTypeValue::KeyRelease,
                    None,
                    Some(KeyReleaseEvent { key: key_to_type(key) }),
                    None,
                    None,
                    None,
                    None,
                ),
                EventType::MouseMove { x, y } => (
                    EventTypeValue::MouseMove,
                    None,
                    None,
                    Some(MouseMoveEvent { x: *x, y: *y }),
                    None,
                    None,
                    None,
                ),
                EventType::ButtonPress(btn) => (
                    EventTypeValue::ButtonPress,
                    None,
                    None,
                    None,
                    Some(ButtonPressEvent { button: button_to_type(btn) }),
                    None,
                    None,
                ),
                EventType::ButtonRelease(btn) => (
                    EventTypeValue::ButtonRelease,
                    None,
                    None,
                    None,
                    None,
                    Some(ButtonReleaseEvent { button: button_to_type(btn) }),
                    None,
                ),
                EventType::Wheel { delta_x, delta_y } => (
                    EventTypeValue::Wheel,
                    None,
                    None,
                    None,
                    None,
                    None,
                    Some(WheelEvent { delta_x: *delta_x, delta_y: *delta_y }),
                ),
            };

        InputEvent {
            event_type,
            key_press,
            key_release,
            mouse_move,
            button_press,
            button_release,
            wheel,
            name: event.name,
            time: event.time.duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_millis() as f64,
        }
    }
}

impl TryFrom<InputEvent> for Event {
    type Error = String;
    
    fn try_from(event: InputEvent) -> Result<Self, Self::Error> {
        let event_type = match event.event_type {
            EventTypeValue::KeyPress => {
                let key = event.key_press
                    .ok_or("Missing key_press data for KeyPress event")?
                    .key;
                EventType::KeyPress(type_to_key(key))
            }
            EventTypeValue::KeyRelease => {
                let key = event.key_release
                    .ok_or("Missing key_release data for KeyRelease event")?
                    .key;
                EventType::KeyRelease(type_to_key(key))
            }
            EventTypeValue::MouseMove => {
                let mv = event.mouse_move
                    .ok_or("Missing mouse_move data for MouseMove event")?;
                EventType::MouseMove { x: mv.x, y: mv.y }
            }
            EventTypeValue::ButtonPress => {
                let btn = event.button_press
                    .ok_or("Missing button_press data for ButtonPress event")?
                    .button;
                EventType::ButtonPress(type_to_button(btn))
            }
            EventTypeValue::ButtonRelease => {
                let btn = event.button_release
                    .ok_or("Missing button_release data for ButtonRelease event")?
                    .button;
                EventType::ButtonRelease(type_to_button(btn))
            }
            EventTypeValue::Wheel => {
                let w = event.wheel
                    .ok_or("Missing wheel data for Wheel event")?;
                EventType::Wheel { delta_x: w.delta_x, delta_y: w.delta_y }
            }
        };

        Ok(Event {
            event_type,
            name: event.name,
            time: std::time::SystemTime::UNIX_EPOCH
                .checked_add(std::time::Duration::from_millis(event.time as u64))
                .unwrap_or(std::time::SystemTime::now()),
        })
    }
}
