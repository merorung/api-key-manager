use serde::Serialize;

#[derive(Serialize, Clone)]
pub enum PasswordStrength {
    Weak,
    Medium,
    Strong,
}

#[derive(Serialize)]
pub struct PasswordValidation {
    pub valid: bool,
    pub strength: PasswordStrength,
    pub errors: Vec<String>,
}

pub fn validate_password(password: &str) -> PasswordValidation {
    let mut errors = Vec::new();
    let mut category_count = 0;

    if password.len() < 12 {
        errors.push("최소 12자 이상이어야 합니다".to_string());
    }

    let has_upper = password.chars().any(|c| c.is_uppercase());
    let has_lower = password.chars().any(|c| c.is_lowercase());
    let has_digit = password.chars().any(|c| c.is_ascii_digit());
    let has_special = password.chars().any(|c| !c.is_alphanumeric());

    if has_upper {
        category_count += 1;
    }
    if has_lower {
        category_count += 1;
    }
    if has_digit {
        category_count += 1;
    }
    if has_special {
        category_count += 1;
    }

    if category_count < 3 {
        errors.push("대문자, 소문자, 숫자, 특수문자 중 3종 이상 포함해야 합니다".to_string());
    }

    let strength = if password.len() >= 16 && category_count == 4 {
        PasswordStrength::Strong
    } else if password.len() >= 12 && category_count >= 3 {
        PasswordStrength::Medium
    } else {
        PasswordStrength::Weak
    };

    PasswordValidation {
        valid: errors.is_empty(),
        strength,
        errors,
    }
}
