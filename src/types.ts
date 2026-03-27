export interface MaskedKeyEntry {
  id: string;
  name: string;
  maskedKey: string;
  memo: string | null;
}

export interface PasswordValidation {
  valid: boolean;
  strength: "Weak" | "Medium" | "Strong";
  errors: string[];
}

export interface AppSettings {
  vaultPath: string;
  clipboardTimeout: number;
}
