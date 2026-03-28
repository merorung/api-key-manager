use rand::Rng;
use std::fs;
use std::path::PathBuf;

use crate::crypto;

const CODE_SEGMENTS: usize = 6;
const SEGMENT_LENGTH: usize = 5;

/// Generate a recovery code with ~155 bits of entropy
/// 6 segments x 5 chars x log2(32) = 150 bits
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

/// Save a recovery file: encrypts the vault data directly with the recovery code.
/// The master password is NOT stored anywhere.
pub fn save_recovery(
    vault_path: &PathBuf,
    recovery_code: &str,
    vault_data_json: &[u8],
) -> Result<(), String> {
    let path = recovery_path(vault_path);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("failed to create recovery directory: {}", e))?;
    }
    let encrypted = crypto::encrypt(vault_data_json, recovery_code)?;
    fs::write(&path, encrypted.to_bytes())
        .map_err(|e| format!("recovery file write failed: {}", e))?;
    Ok(())
}

/// Recover vault data using the recovery code.
/// Returns the raw vault JSON bytes (not the master password).
pub fn recover_vault_data(
    vault_path: &PathBuf,
    recovery_code: &str,
) -> Result<Vec<u8>, String> {
    let path = recovery_path(vault_path);
    let bytes = fs::read(&path).map_err(|e| format!("recovery file read failed: {}", e))?;
    let encrypted = crypto::EncryptedData::from_bytes(&bytes)?;
    crypto::decrypt(&encrypted, recovery_code)
}

pub fn recovery_exists(vault_path: &PathBuf) -> bool {
    recovery_path(vault_path).exists()
}
