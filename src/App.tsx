import { useState } from "react";
import { LockScreen } from "./components/LockScreen";
import { KeyList } from "./components/KeyList";
import { Settings } from "./components/Settings";

type Screen = "lock" | "main" | "settings";

function App() {
  const [screen, setScreen] = useState<Screen>("lock");

  if (screen === "lock") {
    return <LockScreen onUnlocked={() => setScreen("main")} />;
  }

  if (screen === "settings") {
    return <Settings onBack={() => setScreen("main")} />;
  }

  return (
    <KeyList
      onOpenSettings={() => setScreen("settings")}
      onLock={() => setScreen("lock")}
    />
  );
}

export default App;
