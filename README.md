# Key Manager

API 키를 안전하게 관리하는 로컬 데스크톱 앱입니다.

## 주요 기능

- AES-256-GCM 암호화 + Argon2id 키 파생
- 마스터 비밀번호로 잠금 보호 (강도 검증)
- API 키는 화면에 표시되지 않음 (복사만 가능)
- 클립보드 자동 삭제 (기본 30초)
- 복구 코드로 비밀번호 복구 가능
- 암호화된 백업 내보내기/가져오기
- Windows, macOS, Linux 지원

## 다운로드

다운로드 후 설치하면 바로 사용할 수 있습니다. 별도 설치 요구사항 없음.

| OS | 다운로드 |
|---|---|
| **Windows** | [KeyManager-Windows-x64-setup.exe](https://github.com/merorung/api-key-manager/releases/latest/download/KeyManager-Windows-x64-setup.exe) |
| **Mac (Apple Silicon)** | [KeyManager-Mac-AppleSilicon.dmg](https://github.com/merorung/api-key-manager/releases/latest/download/KeyManager-Mac-AppleSilicon.dmg) |
| **Mac (Intel)** | [KeyManager-Mac-Intel.dmg](https://github.com/merorung/api-key-manager/releases/latest/download/KeyManager-Mac-Intel.dmg) |
| **Linux (Ubuntu/Debian)** | [KeyManager-Linux-amd64.deb](https://github.com/merorung/api-key-manager/releases/latest/download/KeyManager-Linux-amd64.deb) |

---

## 개발자용

소스코드를 직접 빌드하려면 아래 환경이 필요합니다.

### 사전 요구사항

- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri v2 사전 준비](https://v2.tauri.app/start/prerequisites/)

### 실행

```bash
npm install
npm run tauri dev
```

### 빌드

```bash
npm run tauri build
```

## 라이선스

MIT
