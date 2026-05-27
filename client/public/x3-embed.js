/**
 * X3 EMBED — El corazón instalable
 * Una sola línea instala X3 en cualquier proyecto:
 * <script src="https://x3assist-kaks4ehc.manus.space/x3-embed.js"></script>
 *
 * X3 aparece como un botón flotante en la esquina inferior derecha.
 * Al hacer clic, abre el chat completo con streaming y todos los módulos.
 */
(function () {
  "use strict";

  // Evitar doble carga
  if (window.__X3_LOADED__) return;
  window.__X3_LOADED__ = true;

  const X3_URL = "https://x3assist-kaks4ehc.manus.space";
  const ACCENT = "#00d4ff";
  const BG = "#000812";

  // Inyectar estilos
  const style = document.createElement("style");
  style.textContent = `
    #x3-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${BG};
      border: 2px solid ${ACCENT};
      box-shadow: 0 0 20px rgba(0,212,255,0.4), 0 4px 20px rgba(0,0,0,0.5);
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s;
      font-family: 'Orbitron', 'Share Tech Mono', monospace;
      font-size: 0.65rem;
      font-weight: 700;
      color: ${ACCENT};
      letter-spacing: 0.05em;
      text-shadow: 0 0 8px ${ACCENT};
      user-select: none;
    }
    #x3-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 0 35px rgba(0,212,255,0.7), 0 4px 30px rgba(0,0,0,0.6);
    }
    #x3-fab.x3-open {
      border-color: #ff4444;
      box-shadow: 0 0 20px rgba(255,68,68,0.4);
      color: #ff4444;
      text-shadow: 0 0 8px #ff4444;
    }
    #x3-iframe-wrap {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 400px;
      height: 600px;
      max-width: calc(100vw - 48px);
      max-height: calc(100vh - 120px);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid ${ACCENT};
      box-shadow: 0 0 40px rgba(0,212,255,0.2), 0 20px 60px rgba(0,0,0,0.7);
      z-index: 999998;
      display: none;
      background: ${BG};
    }
    #x3-iframe-wrap.x3-visible {
      display: block;
      animation: x3-slide-up 0.25s ease;
    }
    @keyframes x3-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #x3-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    @media (max-width: 480px) {
      #x3-iframe-wrap {
        bottom: 0;
        right: 0;
        width: 100vw;
        height: 100dvh;
        max-width: 100vw;
        max-height: 100dvh;
        border-radius: 0;
      }
      #x3-fab { bottom: 16px; right: 16px; }
    }
  `;
  document.head.appendChild(style);

  // Crear botón flotante
  const fab = document.createElement("button");
  fab.id = "x3-fab";
  fab.title = "Abrir X3";
  fab.textContent = "X3";
  document.body.appendChild(fab);

  // Crear contenedor del iframe
  const wrap = document.createElement("div");
  wrap.id = "x3-iframe-wrap";
  document.body.appendChild(wrap);

  let iframe = null;
  let isOpen = false;

  fab.addEventListener("click", function () {
    isOpen = !isOpen;
    if (isOpen) {
      fab.classList.add("x3-open");
      fab.textContent = "✕";
      fab.title = "Cerrar X3";
      wrap.classList.add("x3-visible");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "x3-iframe";
        iframe.src = X3_URL;
        iframe.allow = "microphone; camera";
        wrap.appendChild(iframe);
      }
    } else {
      fab.classList.remove("x3-open");
      fab.textContent = "X3";
      fab.title = "Abrir X3";
      wrap.classList.remove("x3-visible");
    }
  });

  // Cerrar al hacer clic fuera
  document.addEventListener("click", function (e) {
    if (isOpen && !fab.contains(e.target) && !wrap.contains(e.target)) {
      fab.click();
    }
  });

  console.log("[X3] Embed cargado. El corazón late en tu proyecto.");
})();
