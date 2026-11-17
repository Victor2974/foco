// Guarda o estado do foco e mostra "OFF" no ícone quando estiver desligado.

async function syncBadge() {
  const { enabled } = await chrome.storage.local.get({ enabled: true });
  await chrome.action.setBadgeBackgroundColor({ color: "#5b5b66" });
  await chrome.action.setBadgeText({ text: enabled ? "" : "OFF" });
}

chrome.runtime.onInstalled.addListener(async () => {
  const { enabled } = await chrome.storage.local.get("enabled");
  if (enabled === undefined) await chrome.storage.local.set({ enabled: true });
  syncBadge();
});

chrome.runtime.onStartup.addListener(syncBadge);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "enabled" in changes) syncBadge();
});
