use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::Argon2;
use rand::{rngs::OsRng, RngCore};

const NONCE_SIZE: usize = 12;
const SALT_SIZE: usize = 32;

pub struct EncryptedData {
    pub salt: Vec<u8>,
    pub nonce: Vec<u8>,
    pub ciphertext: Vec<u8>,
}

impl EncryptedData {
    pub fn to_bytes(&self) -> Vec<u8> {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&(self.salt.len() as u32).to_le_bytes());
        bytes.extend_from_slice(&self.salt);
        bytes.extend_from_slice(&(self.nonce.len() as u32).to_le_bytes());
        bytes.extend_from_slice(&self.nonce);
        bytes.extend_from_slice(&self.ciphertext);
        bytes
    }

    pub fn from_bytes(bytes: &[u8]) -> Result<Self, String> {
        let mut pos = 0;

        let salt_len = u32::from_le_bytes(
            bytes[pos..pos + 4]
                .try_into()
                .map_err(|_| "invalid salt length".to_string())?,
        ) as usize;
        pos += 4;
        let salt = bytes[pos..pos + salt_len].to_vec();
        pos += salt_len;

        let nonce_len = u32::from_le_bytes(
            bytes[pos..pos + 4]
                .try_into()
                .map_err(|_| "invalid nonce length".to_string())?,
        ) as usize;
        pos += 4;
        let nonce = bytes[pos..pos + nonce_len].to_vec();
        pos += nonce_len;

        let ciphertext = bytes[pos..].to_vec();

        Ok(Self {
            salt,
            nonce,
            ciphertext,
        })
    }
}

fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; 32], String> {
    let mut key = [0u8; 32];
    Argon2::default()
        .hash_password_into(password.as_bytes(), salt, &mut key)
        .map_err(|e| format!("key derivation failed: {}", e))?;
    Ok(key)
}

pub fn encrypt(plaintext: &[u8], password: &str) -> Result<EncryptedData, String> {
    let mut salt = vec![0u8; SALT_SIZE];
    OsRng.fill_bytes(&mut salt);

    let mut nonce_bytes = [0u8; NONCE_SIZE];
    OsRng.fill_bytes(&mut nonce_bytes);

    let key = derive_key(password, &salt)?;
    let cipher =
        Aes256Gcm::new_from_slice(&key).map_err(|e| format!("cipher init failed: {}", e))?;
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| format!("encryption failed: {}", e))?;

    Ok(EncryptedData {
        salt,
        nonce: nonce_bytes.to_vec(),
        ciphertext,
    })
}

pub fn decrypt(encrypted: &EncryptedData, password: &str) -> Result<Vec<u8>, String> {
    let key = derive_key(password, &encrypted.salt)?;
    let cipher =
        Aes256Gcm::new_from_slice(&key).map_err(|e| format!("cipher init failed: {}", e))?;
    let nonce = Nonce::from_slice(&encrypted.nonce);

    cipher
        .decrypt(nonce, encrypted.ciphertext.as_ref())
        .map_err(|_| "decryption failed: wrong password or corrupted data".to_string())
}
