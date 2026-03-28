use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;

use crate::clipboard::ClipboardManager;
use crate::password::{self, PasswordValidation};
use crate::recovery;
use crate::settings::AppSettings;
use crate::vault::{MaskedKeyEntry, Vault};

pub struct AppState {
    pub vault: Mutex<Option<Vault>>,
    pub settings: Mutex<AppSettings>,
    pub clipboard: ClipboardManager,
}

fn with_vault<F, T>(state: &State<'_, AppState>, f: F) -> Result<T, String>
where
    F: FnOnce(&Vault) -> Result<T, String>,
{
    let guard = state.vault.lock().unwrap();
    let vault = guard.as_ref().ok_or("vault is locked")?;
    f(vault)
}

fn with_vault_mut<F, T>(state: &State<'_, AppState>, f: F) -> Result<T, String>
where
    F: FnOnce(&mut Vault) -> Result<T, String>,
{
    let mut guard = state.vault.lock().unwrap();
    let vault = guard.as_mut().ok_or("vault is locked")?;
    f(vault)
}

#[tauri::command]
pub fn check_vault_exists(state: State<'_, AppState>) -> bool {
    let settings = state.settings.lock().unwrap();
    let path = PathBuf::from(&settings.vault_path);
    Vault::exists(&path)
}

#[tauri::command]
pub fn setup_vault(password: String, state: State<'_, AppState>) -> Result<(), String> {
    let validation = password::validate_password(&password);
    if !validation.valid {
        return Err(validation.errors.join(", "));
    }

    let settings = state.settings.lock().unwrap();
    let path = PathBuf::from(&settings.vault_path);
    let vault = Vault::create(&password, path)?;

    let mut vault_state = state.vault.lock().unwrap();
    *vault_state = Some(vault);
    Ok(())
}

#[tauri::command]
pub fn unlock(password: String, state: State<'_, AppState>) -> Result<(), String> {
    let settings = state.settings.lock().unwrap();
    let path = PathBuf::from(&settings.vault_path);
    let vault = Vault::open(&password, path)?;

    let mut vault_state = state.vault.lock().unwrap();
    *vault_state = Some(vault);
    Ok(())
}

#[tauri::command]
pub fn lock(state: State<'_, AppState>) -> Result<(), String> {
    let mut vault_state = state.vault.lock().unwrap();
    *vault_state = None;
    Ok(())
}

#[tauri::command]
pub fn list_keys(state: State<'_, AppState>) -> Result<Vec<MaskedKeyEntry>, String> {
    with_vault(&state, |v| Ok(v.list_masked()))
}

#[tauri::command]
pub fn search_keys(query: String, state: State<'_, AppState>) -> Result<Vec<MaskedKeyEntry>, String> {
    with_vault(&state, |v| Ok(v.search(&query)))
}

#[tauri::command]
pub fn add_key(
    name: String,
    key: String,
    memo: Option<String>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    with_vault_mut(&state, |v| v.add_key(name, key, memo))
}

#[tauri::command]
pub fn update_key(
    id: String,
    name: Option<String>,
    key: Option<String>,
    memo: Option<Option<String>>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    with_vault_mut(&state, |v| v.update_key(&id, name, key, memo))
}

#[tauri::command]
pub fn delete_key(id: String, state: State<'_, AppState>) -> Result<(), String> {
    with_vault_mut(&state, |v| v.delete_key(&id))
}

#[tauri::command]
pub fn copy_key(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let raw_key = with_vault(&state, |v| v.get_raw_key(&id))?;
    let settings = state.settings.lock().unwrap();
    state
        .clipboard
        .copy_and_schedule_clear(&raw_key, settings.clipboard_timeout)
}

#[tauri::command]
pub fn validate_password_strength(password: String) -> PasswordValidation {
    password::validate_password(&password)
}

#[tauri::command]
pub fn change_password(
    old_password: String,
    new_password: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let validation = password::validate_password(&new_password);
    if !validation.valid {
        return Err(validation.errors.join(", "));
    }

    let settings = state.settings.lock().unwrap();
    let path = PathBuf::from(&settings.vault_path);
    let _ = Vault::open(&old_password, path)?;

    with_vault_mut(&state, |v| v.change_password(&new_password))
}

#[tauri::command]
pub fn export_vault(path: String, state: State<'_, AppState>) -> Result<(), String> {
    let export_path = PathBuf::from(path);
    with_vault(&state, |v| v.export_to(&export_path))
}

#[tauri::command]
pub fn import_vault(
    path: String,
    password: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let import_path = PathBuf::from(&path);
    let vault = Vault::open(&password, import_path)?;

    let mut vault_state = state.vault.lock().unwrap();
    *vault_state = Some(vault);
    Ok(())
}

#[tauri::command]
pub fn get_settings(state: State<'_, AppState>) -> AppSettings {
    state.settings.lock().unwrap().clone()
}

#[tauri::command]
pub fn update_settings(
    new_settings: AppSettings,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut settings = state.settings.lock().unwrap();
    *settings = new_settings;
    settings.save()
}

#[tauri::command]
pub fn setup_vault_with_recovery(
    password: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let validation = password::validate_password(&password);
    if !validation.valid {
        return Err(validation.errors.join(", "));
    }

    let settings = state.settings.lock().unwrap();
    let path = PathBuf::from(&settings.vault_path);

    let recovery_code = recovery::generate_recovery_code();
    let vault = Vault::create(&password, path.clone())?;
    recovery::save_recovery(&path, &recovery_code, &password)?;

    let mut vault_state = state.vault.lock().unwrap();
    *vault_state = Some(vault);
    Ok(recovery_code)
}

#[tauri::command]
pub fn recover_vault(
    recovery_code: String,
    new_password: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let validation = password::validate_password(&new_password);
    if !validation.valid {
        return Err(validation.errors.join(", "));
    }

    let settings = state.settings.lock().unwrap();
    let path = PathBuf::from(&settings.vault_path);

    let old_password = recovery::recover_master_password(&path, &recovery_code)?;
    let mut vault = Vault::open(&old_password, path.clone())?;
    vault.change_password(&new_password)?;

    let new_recovery_code = recovery::generate_recovery_code();
    recovery::save_recovery(&path, &new_recovery_code, &new_password)?;

    let mut vault_state = state.vault.lock().unwrap();
    *vault_state = Some(vault);
    Ok(())
}
