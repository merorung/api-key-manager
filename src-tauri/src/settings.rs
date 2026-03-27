use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Clone)]
pub struct AppSettings {
    #[serde(rename = "vaultPath")]
    pub vault_path: String,
    #[serde(rename = "clipboardTimeout")]
    pub clipboard_timeout: u64,
}

impl AppSettings {
    pub fn default_vault_path() -> PathBuf {
        let data_dir = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
        data_dir.join("KeyManager").join("vault.dat")
    }

    pub fn settings_path() -> PathBuf {
        let config_dir = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
        config_dir.join("KeyManager").join("settings.json")
    }

    pub fn load() -> Self {
        let path = Self::settings_path();
        if path.exists() {
            let content = fs::read_to_string(&path).unwrap_or_default();
            serde_json::from_str(&content).unwrap_or_else(|_| Self::default())
        } else {
            Self::default()
        }
    }

    pub fn save(&self) -> Result<(), String> {
        let path = Self::settings_path();
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("failed to create settings dir: {}", e))?;
        }
        let json = serde_json::to_string_pretty(self)
            .map_err(|e| format!("serialization failed: {}", e))?;
        fs::write(&path, json).map_err(|e| format!("settings write failed: {}", e))?;
        Ok(())
    }
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            vault_path: Self::default_vault_path()
                .to_string_lossy()
                .to_string(),
            clipboard_timeout: 30,
        }
    }
}
