mod clipboard;
mod commands;
mod crypto;
mod password;
mod settings;
mod vault;

use clipboard::ClipboardManager;
use commands::AppState;
use settings::AppSettings;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            vault: Mutex::new(None),
            settings: Mutex::new(AppSettings::load()),
            clipboard: ClipboardManager::new(),
        })
        .invoke_handler(tauri::generate_handler![
            commands::check_vault_exists,
            commands::setup_vault,
            commands::unlock,
            commands::lock,
            commands::list_keys,
            commands::search_keys,
            commands::add_key,
            commands::update_key,
            commands::delete_key,
            commands::copy_key,
            commands::validate_password_strength,
            commands::change_password,
            commands::export_vault,
            commands::import_vault,
            commands::get_settings,
            commands::update_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
