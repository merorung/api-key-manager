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
        // Set clipboard, excluding from Windows clipboard history
        self.set_clipboard_sensitive(text)?;

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
            // copied_text is dropped here, but String doesn't zeroize on drop
            // This is acceptable as the clear thread is short-lived
        }));

        Ok(())
    }

    #[cfg(target_os = "windows")]
    fn set_clipboard_sensitive(&self, text: &str) -> Result<(), String> {
        use std::ptr;

        unsafe {
            if OpenClipboard(ptr::null_mut()) == 0 {
                return self.set_clipboard_fallback(text);
            }
            EmptyClipboard();

            // Set the text
            let wide: Vec<u16> = text.encode_utf16().chain(std::iter::once(0)).collect();
            let size = wide.len() * 2;
            let hmem = GlobalAlloc(0x0002 /* GMEM_MOVEABLE */, size);
            if hmem.is_null() {
                CloseClipboard();
                return self.set_clipboard_fallback(text);
            }
            let ptr = GlobalLock(hmem);
            ptr::copy_nonoverlapping(wide.as_ptr() as *const u8, ptr as *mut u8, size);
            GlobalUnlock(hmem);
            SetClipboardData(13 /* CF_UNICODETEXT */, hmem);

            // Exclude from clipboard history
            let format = RegisterClipboardFormatW(
                "ExcludeClipboardContentFromMonitorProcessing\0"
                    .encode_utf16()
                    .collect::<Vec<u16>>()
                    .as_ptr(),
            );
            if format != 0 {
                let hmem2 = GlobalAlloc(0x0002, 1);
                if !hmem2.is_null() {
                    let ptr2 = GlobalLock(hmem2);
                    *(ptr2 as *mut u8) = 0;
                    GlobalUnlock(hmem2);
                    SetClipboardData(format, hmem2);
                }
            }

            CloseClipboard();
        }
        Ok(())
    }

    #[cfg(not(target_os = "windows"))]
    fn set_clipboard_sensitive(&self, text: &str) -> Result<(), String> {
        self.set_clipboard_fallback(text)
    }

    fn set_clipboard_fallback(&self, text: &str) -> Result<(), String> {
        let mut clipboard =
            Clipboard::new().map_err(|e| format!("clipboard access failed: {}", e))?;
        clipboard
            .set_text(text)
            .map_err(|e| format!("clipboard write failed: {}", e))?;
        Ok(())
    }
}

#[cfg(target_os = "windows")]
extern "system" {
    fn OpenClipboard(hwnd: *mut std::ffi::c_void) -> i32;
    fn CloseClipboard() -> i32;
    fn EmptyClipboard() -> i32;
    fn SetClipboardData(format: u32, hmem: *mut std::ffi::c_void) -> *mut std::ffi::c_void;
    fn GlobalAlloc(flags: u32, bytes: usize) -> *mut std::ffi::c_void;
    fn GlobalLock(hmem: *mut std::ffi::c_void) -> *mut std::ffi::c_void;
    fn GlobalUnlock(hmem: *mut std::ffi::c_void) -> i32;
    fn RegisterClipboardFormatW(name: *const u16) -> u32;
}
