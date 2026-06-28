import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handleBeforeInstall(e) {
      e.preventDefault();
      setDeferredEvent(e);
    }
    function handleInstalled() {
      setInstalled(true);
      setDeferredEvent(null);
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (!deferredEvent || installed || dismissed) return null;

  async function handleInstall() {
    deferredEvent.prompt();
    await deferredEvent.userChoice;
    setDeferredEvent(null);
  }

  return (
    <div className="install-banner">
      <span>📲 Install ShareToys on your phone for quick access</span>
      <div className="install-actions">
        <button className="btn-pill" onClick={handleInstall}>Install</button>
        <button className="link-btn" onClick={() => setDismissed(true)}>Not now</button>
      </div>
    </div>
  );
}
