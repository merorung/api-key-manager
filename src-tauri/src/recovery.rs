use rand::Rng;
use std::fs;
use std::path::PathBuf;

use crate::crypto;

const CODE_SEGMENTS: usize = 5;
const SEGMENT_LENGTH: usize = 4;

pub fn generate_recovery_code() -> String {
    let mut rng = rand::thread_rng();
    let charset: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1
    let segments: Vec<String> = (0..CODE_SEGMENTS)
        .map(|_| {
            (0..SEGMENT_LENGTH)
                .map(|_| {
                    let idx = rng.gen_range(0..charset.len());
                    charset[idx] as char
                })
                .collect()
        })
        .collect();
    segments.join("-")
}

pub fn recovery_path(vault_path: &PathBuf) -> PathBuf {
    vault_path.with_extension("recovery")
}

pub fn save_recovery(
    vault_path: &PathBuf,
    recovery_code: &str,
    master_password: &str,
) -> Result<(), String> {
    let path = recovery_path(vault_path);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("failed to create recovery directory: {}", e))?;
    }
    let encrypted = crypto::encrypt(master_password.as_bytes(), recovery_code)?;
    fs::write(&path, encrypted.to_bytes())
        .map_err(|e| format!("recovery file write failed: {}", e))?;
    Ok(())
}

pub fn recover_master_password(
    vault_path: &PathBuf,
    recovery_code: &str,
) -> Result<String, String> {
    let path = recovery_path(vault_path);
    let bytes = fs::read(&path).map_err(|e| format!("recovery file read failed: {}", e))?;
    let encrypted = crypto::EncryptedData::from_bytes(&bytes)?;
    let plaintext = crypto::decrypt(&encrypted, recovery_code)?;
    String::from_utf8(plaintext).map_err(|_| "recovery decryption failed".to_string())
}

pub fn recovery_exists(vault_path: &PathBuf) -> bool {
    recovery_path(vault_path).exists()
}
