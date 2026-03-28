import { invoke } from "@tauri-apps/api/core";
import type { MaskedKeyEntry, PasswordValidation, AppSettings } from "./types";

export const api = {
  checkVaultExists: () => invoke<boolean>("check_vault_exists"),

  setupVault: (password: string) => invoke<void>("setup_vault", { password }),

  unlock: (password: string) => invoke<void>("unlock", { password }),

  lock: () => invoke<void>("lock"),

  listKeys: () => invoke<MaskedKeyEntry[]>("list_keys"),

  searchKeys: (query: string) =>
    invoke<MaskedKeyEntry[]>("search_keys", { query }),

  addKey: (name: string, key: string, memo?: string) =>
    invoke<string>("add_key", { name, key, memo: memo || null }),

  updateKey: (
    id: string,
    name?: string,
    key?: string,
    memo?: string | null
  ) =>
    invoke<void>("update_key", {
      id,
      name: name ?? null,
      key: key ?? null,
      memo: memo === undefined ? null : memo,
    }),

  deleteKey: (id: string) => invoke<void>("delete_key", { id }),

  copyKey: (id: string) => invoke<void>("copy_key", { id }),

  validatePassword: (password: string) =>
    invoke<PasswordValidation>("validate_password_strength", { password }),

  changePassword: (oldPassword: string, newPassword: string) =>
    invoke<void>("change_password", { oldPassword, newPassword }),

  exportVault: (path: string) => invoke<void>("export_vault", { path }),

  importVault: (path: string, password: string) =>
    invoke<void>("import_vault", { path, password }),

  getSettings: () => invoke<AppSettings>("get_settings"),

  updateSettings: (settings: AppSettings) =>
    invoke<void>("update_settings", { newSettings: settings }),

  setupVaultWithRecovery: (password: string) =>
    invoke<string>("setup_vault_with_recovery", { password }),

  recoverVault: (recoveryCode: string, newPassword: string) =>
    invoke<void>("recover_vault", { recoveryCode, newPassword }),
};
