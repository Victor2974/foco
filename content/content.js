// Foco — content script
// Esconde vídeos curtos, bloqueia as páginas deles e pausa qualquer vídeo que tente tocar.

(() => {
  "use strict";

  const SITES = [
    {
      id: "youtube",
      name: "YouTube",
      host: /(^|\.)youtube\.com$/,
      home: "/",
      // /shorts/ID e a aba Shorts dos canais (/@canal/shorts)
      blocksPage: (path) => /(^|\/)shorts(\/|$)/.test(path),
      blocksAllVideos: false,
    },
    {
      id: "instagram",
      name: "Instagram",
      host: /(^|\.)instagram\.com$/,
      home: "/",
      // /reels/, /reel/ID, /usuario/reels/
      blocksPage: (path) => /(^|\/)reels?(\/|$)/.test(path),
      // nada de vídeo: nem no feed, nem nos stories, nem nas mensagens
      blocksAllVideos: true,
    },
    {
      id: "tiktok",
      name: "TikTok",
      host: /(^|\.)tiktok\.com$/,
      home: "https://www.google.com",
      blocksPage: () => true,
      blocksAllVideos: true,
    },
    {
      id: "facebook",
      name: "Facebook",
      host: /(^|\.)facebook\.com$/,
      home: "/",
      blocksPage: (path) => /(^|\/)reels?(\/|$)/.test(path),
      blocksAllVideos: false,
    },
  ];

  const site = SITES.find((s) => s.host.test(location.hostname));
  if (!site) return;

  const root = document.documentElement;
  root.classList.add(`foco-${site.id}`);

  // Começa ligado para não piscar conteúdo antes de ler o storage.
  let enabled = true;
  let lastUrl = "";
  let overlay = null;

  const isPageBlocked = () => enabled && site.blocksPage(location.pathname);
  const shouldStopVideos = () => enabled && (site.blocksAllVideos || isPageBlocked());

  // ---------- vídeos ----------

  function stopVideo(video) {
    try {
      video.pause();
      video.muted = true;
    } catch (_) {}
  }

  function stopAllVideos() {
    document.querySelectorAll("video").forEach(stopVideo);
  }

  // Pega o play antes do site (fase de captura) e pausa na hora.
  for (const type of ["play", "playing"]) {
    document.addEventListener(
      type,
      (e) => {
        if (e.target instanceof HTMLVideoElement && shouldStopVideos()) stopVideo(e.target);
      },
      true
    );
  }

  // Marca o container do vídeo para mostrar o aviso "vídeo bloqueado".
  function markVideos() {
    document.querySelectorAll("video:not([data-foco])").forEach((video) => {
      video.setAttribute("data-foco", "");
      video.parentElement?.setAttribute("data-foco-blocked", "");
    });
  }

  // ---------- tela de bloqueio ----------

  function buildOverlay() {
    const host = document.createElement("foco-overlay");
    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        .wrap {
          position: fixed; inset: 0; z-index: 2147483647;
          display: grid; place-items: center;
          background: #0d0d10; color: #f2f2f5;
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }
        .card { text-align: center; padding: 32px; max-width: 360px; }
        .ring {
          width: 72px; height: 72px; margin: 0 auto 24px; border-radius: 50%;
          border: 3px solid #3ddc97; display: grid; place-items: center;
          box-shadow: 0 0 40px rgba(61, 220, 151, .25);
        }
        .dot { width: 18px; height: 18px; border-radius: 50%; background: #3ddc97; }
        h1 { font-size: 22px; font-weight: 650; margin: 0 0 8px; letter-spacing: -.01em; }
        p { font-size: 14px; line-height: 1.5; color: #9a9aa6; margin: 0 0 28px; }
        button {
          font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
          padding: 10px 22px; border-radius: 999px; border: 1px solid #2a2a33;
          background: #17171c; color: #f2f2f5;
        }
        button:hover { background: #202028; }
      </style>
      <div class="wrap">
        <div class="card">
          <div class="ring"><div class="dot"></div></div>
          <h1>Foco ligado</h1>
          <p>Vídeos curtos estão bloqueados no ${site.name}.<br>Volta pro que importa.</p>
          <button type="button">Voltar</button>
        </div>
      </div>`;
    shadow.querySelector("button").addEventListener("click", () => {
      if (history.length > 1) history.back();
      else location.assign(site.home);
    });
    return host;
  }

  function showOverlay() {
    if (!overlay) overlay = buildOverlay();
    if (!overlay.isConnected) root.appendChild(overlay);
    root.classList.add("foco-locked");
  }

  function hideOverlay() {
    overlay?.remove();
    root.classList.remove("foco-locked");
  }

  // ---------- loop principal ----------

  function apply() {
    root.classList.toggle("foco-on", enabled);
    if (isPageBlocked()) showOverlay();
    else hideOverlay();
    if (shouldStopVideos()) stopAllVideos();
  }

  // Sites como YouTube e Instagram trocam de página sem recarregar,
  // então conferimos a URL e os vídeos novos a cada instante.
  function tick() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      apply();
    }
    if (enabled && site.blocksAllVideos) markVideos();
    if (shouldStopVideos()) stopAllVideos();
  }

  chrome.storage.local.get({ enabled: true }, (data) => {
    enabled = data.enabled;
    apply();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !("enabled" in changes)) return;
    enabled = changes.enabled.newValue !== false;
    apply();
  });

  apply();
  setInterval(tick, 300);
  window.addEventListener("popstate", tick);
})();
