use arboard::Clipboard;
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

pub struct ClipboardManager {
    clear_handle: Mutex<Option<thread::JoinHandle<()>>>,
}

impl ClipboardManager {
    pub fn new() -> Self {
        Self {
            clear_handle: Mutex::new(None),
        }
    }

    pub fn copy_and_schedule_clear(&self, text: &str, timeout_secs: u64) -> Result<(), String> {
        let mut clipboard =
            Clipboard::new().map_err(|e| format!("clipboard access failed: {}", e))?;
        clipboard
            .set_text(text)
            .map_err(|e| format!("clipboard write failed: {}", e))?;

        let mut handle = self.clear_handle.lock().unwrap();
        if let Some(h) = handle.take() {
            drop(h);
        }

        let timeout = Duration::from_secs(timeout_secs);
        let copied_text = text.to_string();
        *handle = Some(thread::spawn(move || {
            thread::sleep(timeout);
            if let Ok(mut cb) = Clipboard::new() {
                if let Ok(current) = cb.get_text() {
                    if current == copied_text {
                        let _ = cb.set_text(String::new());
                    }
                }
            }
        }));

        Ok(())
    }
}
