# Key Manager

Secure local API key manager with master password encryption.

## Features

- AES-256-GCM encryption with Argon2id key derivation
- Master password protection with strength enforcement
- API keys never shown on screen — clipboard copy only
- Auto-clear clipboard (default 30 seconds)
- Export/import encrypted backups
- Cross-platform: Windows, macOS, Linux

## Install

Download the latest release for your OS from [Releases](../../releases).

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri v2 prerequisites](https://v2.tauri.app/start/prerequisites/)

### Run

```bash
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

## License

MIT
