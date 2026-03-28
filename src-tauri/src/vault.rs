use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;
use zeroize::Zeroize;

use crate::crypto;

#[derive(Serialize, Deserialize, Clone)]
pub struct KeyEntry {
    pub id: String,
    pub name: String,
    pub key: String,
    pub memo: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Serialize, Deserialize)]
pub struct VaultData {
    pub version: u32,
    pub keys: Vec<KeyEntry>,
}

impl VaultData {
    pub fn new() -> Self {
        Self {
            version: 1,
            keys: Vec::new(),
        }
    }
}

#[derive(Serialize, Clone)]
pub struct MaskedKeyEntry {
    pub id: String,
    pub name: String,
    #[serde(rename = "maskedKey")]
    pub masked_key: String,
    pub memo: Option<String>,
}

pub fn mask_key(key: &str) -> String {
    if key.len() <= 6 {
        return "****".to_string();
    }
    let prefix = &key[..3];
    let suffix = &key[key.len() - 3..];
    format!("{}****{}", prefix, suffix)
}

pub struct Vault {
    pub data: VaultData,
    password: String,
    path: PathBuf,
}

impl Drop for Vault {
    fn drop(&mut self) {
        self.password.zeroize();
        for key in &mut self.data.keys {
            key.key.zeroize();
        }
    }
}

impl Vault {
    pub fn create(password: &str, path: PathBuf) -> Result<Self, String> {
        let vault = Self {
            data: VaultData::new(),
            password: password.to_string(),
            path,
        };
        vault.save()?;
        Ok(vault)
    }

    pub fn open(password: &str, path: PathBuf) -> Result<Self, String> {
        let bytes =
            fs::read(&path).map_err(|e| format!("vault file read failed: {}", e))?;
        let encrypted = crypto::EncryptedData::from_bytes(&bytes)?;
        let plaintext = crypto::decrypt(&encrypted, password)?;
        let data: VaultData = serde_json::from_slice(&plaintext)
            .map_err(|e| format!("vault parse failed: {}", e))?;

        Ok(Self {
            data,
            password: password.to_string(),
            path,
        })
    }

    pub fn exists(path: &PathBuf) -> bool {
        path.exists()
    }

    pub fn save(&self) -> Result<(), String> {
        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("failed to create vault directory: {}", e))?;
        }
        let json = serde_json::to_vec(&self.data)
            .map_err(|e| format!("serialization failed: {}", e))?;
        let encrypted = crypto::encrypt(&json, &self.password)?;
        fs::write(&self.path, encrypted.to_bytes())
            .map_err(|e| format!("vault write failed: {}", e))?;
        Ok(())
    }

    pub fn list_masked(&self) -> Vec<MaskedKeyEntry> {
        self.data
            .keys
            .iter()
            .map(|k| MaskedKeyEntry {
                id: k.id.clone(),
                name: k.name.clone(),
                masked_key: mask_key(&k.key),
                memo: k.memo.clone(),
            })
            .collect()
    }

    pub fn search(&self, query: &str) -> Vec<MaskedKeyEntry> {
        let q = query.to_lowercase();
        self.data
            .keys
            .iter()
            .filter(|k| {
                k.name.to_lowercase().contains(&q)
                    || k.memo
                        .as_ref()
                        .map_or(false, |m| m.to_lowercase().contains(&q))
            })
            .map(|k| MaskedKeyEntry {
                id: k.id.clone(),
                name: k.name.clone(),
                masked_key: mask_key(&k.key),
                memo: k.memo.clone(),
            })
            .collect()
    }

    pub fn add_key(
        &mut self,
        name: String,
        key: String,
        memo: Option<String>,
    ) -> Result<String, String> {
        let now = Utc::now();
        let id = Uuid::new_v4().to_string();
        self.data.keys.push(KeyEntry {
            id: id.clone(),
            name,
            key,
            memo,
            created_at: now,
            updated_at: now,
        });
        self.save()?;
        Ok(id)
    }

    pub fn update_key(
        &mut self,
        id: &str,
        name: Option<String>,
        key: Option<String>,
        memo: Option<Option<String>>,
    ) -> Result<(), String> {
        let entry = self
            .data
            .keys
            .iter_mut()
            .find(|k| k.id == id)
            .ok_or_else(|| "key not found".to_string())?;

        if let Some(n) = name {
            entry.name = n;
        }
        if let Some(k) = key {
            entry.key = k;
        }
        if let Some(m) = memo {
            entry.memo = m;
        }
        entry.updated_at = Utc::now();

        self.save()
    }

    pub fn delete_key(&mut self, id: &str) -> Result<(), String> {
        let len_before = self.data.keys.len();
        self.data.keys.retain(|k| k.id != id);
        if self.data.keys.len() == len_before {
            return Err("key not found".to_string());
        }
        self.save()
    }

    pub fn get_raw_key(&self, id: &str) -> Result<String, String> {
        self.data
            .keys
            .iter()
            .find(|k| k.id == id)
            .map(|k| k.key.clone())
            .ok_or_else(|| "key not found".to_string())
    }

    pub fn change_password(&mut self, new_password: &str) -> Result<(), String> {
        self.password = new_password.to_string();
        self.save()
    }

    pub fn export_to(&self, path: &PathBuf) -> Result<(), String> {
        let bytes =
            fs::read(&self.path).map_err(|e| format!("read failed: {}", e))?;
        fs::write(path, bytes).map_err(|e| format!("export failed: {}", e))?;
        Ok(())
    }
}
