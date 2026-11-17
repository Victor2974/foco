const popup = document.querySelector(".popup");
const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const hint = document.getElementById("hint");

function render(enabled) {
  popup.dataset.state = enabled ? "on" : "off";
  toggle.setAttribute("aria-checked", String(enabled));
  toggle.setAttribute("aria-label", enabled ? "Desligar foco" : "Ligar foco");
  status.textContent = enabled ? "Foco ligado" : "Foco desligado";
  hint.textContent = enabled ? "Vídeos curtos bloqueados" : "Toque para ligar";
}

chrome.storage.local.get({ enabled: true }, ({ enabled }) => render(enabled));

toggle.addEventListener("click", async () => {
  const { enabled } = await chrome.storage.local.get({ enabled: true });
  await chrome.storage.local.set({ enabled: !enabled });
  render(!enabled);
});
