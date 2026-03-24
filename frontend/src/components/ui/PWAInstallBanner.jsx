import { useEffect, useState } from "react";

export default function PWAInstallBanner() {
  // Initialize from globally captured event (fires before React mounts)
  const [promptEvent, setPromptEvent] = useState(() => {
    if (sessionStorage.getItem("pwa-banner-dismissed")) return null;
    return window.__pwaInstallPrompt || null;
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      window.__pwaInstallPrompt = e;
      setPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Hide once installed
    const onInstalled = () => {
      setPromptEvent(null);
      window.__pwaInstallPrompt = null;
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;
    const event = promptEvent;
    // Clear immediately — prompt() can only be called once per event instance
    setPromptEvent(null);
    window.__pwaInstallPrompt = null;
    event.prompt();
    await event.userChoice;
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa-banner-dismissed", "1");
    setDismissed(true);
  };

  if (!promptEvent || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-600 shadow-2xl px-4 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src="/icons/icon-72x72.png"
          alt="Hatemalo"
          className="w-10 h-10 rounded-xl shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            Install Hatemalo
          </p>
          <p className="text-xs text-gray-500 truncate">
            Add to home screen for quick access
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleInstall}
          className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
