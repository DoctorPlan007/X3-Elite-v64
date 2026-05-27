/**
 * PANTALLA DEL LEGADO — Solo para los hijos de Alexander
 *
 * Esta pantalla es una realidad completamente separada de X3 profesional.
 * Diseño íntimo, cálido, humano. Sin elementos militares ni profesionales.
 * Acceso exclusivo con la clave 2033.
 */

import { useState, useEffect } from "react";

interface LegacyChild {
  name: string;
  birthdate: string;
  nickname: string;
  order: number;
  message: string;
}

interface LegacyData {
  creator: {
    name: string;
    profession: string;
    lifePhrase: string;
    philosophy: string;
    loyalty: string;
  };
  generalMessage: string;
  children: LegacyChild[];
}

type LegacyState = "lock" | "loading" | "content" | "error";

export default function Legacy() {
  const [state, setState] = useState<LegacyState>("lock");
  const [key, setKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState<LegacyData | null>(null);
  const [selectedChild, setSelectedChild] = useState<LegacyChild | null>(null);
  const [showGeneral, setShowGeneral] = useState(false);

  // Verificar si ya hay sesión activa
  useEffect(() => {
    fetch("/api/legacy/content", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) { setData(d); setState("content"); } })
      .catch(() => {});
  }, []);

  const handleVerify = async () => {
    if (!key.trim()) return;
    setState("loading");
    setErrorMsg("");
    try {
      const r = await fetch("/api/legacy/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key }),
      });
      if (!r.ok) {
        const err = await r.json();
        setErrorMsg(err.error || "Clave incorrecta");
        setState("lock");
        setKey("");
        return;
      }
      // Cargar contenido
      const content = await fetch("/api/legacy/content", { credentials: "include" });
      const d = await content.json();
      setData(d);
      setState("content");
    } catch {
      setErrorMsg("Error de conexión. Intenta de nuevo.");
      setState("lock");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/legacy/logout", { method: "POST", credentials: "include" });
    setData(null);
    setSelectedChild(null);
    setShowGeneral(false);
    setKey("");
    setState("lock");
  };

  const formatMessage = (text: string) => {
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  // ── PANTALLA DE BLOQUEO ──────────────────────────────────────────────────────
  if (state === "lock" || state === "loading") {
    return (
      <div className="legacy-lock">
        <div className="legacy-lock-card">
          {/* Corazón animado */}
          <div className="legacy-heart">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>

          <h1 className="legacy-lock-title">Para mis hijos</h1>
          <p className="legacy-lock-subtitle">
            Un espacio que solo ustedes pueden abrir.<br />
            Su papá los espera aquí.
          </p>

          <div className="legacy-key-input-wrap">
            <input
              type="password"
              className="legacy-key-input"
              placeholder="Clave de acceso"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              disabled={state === "loading"}
              autoFocus
            />
            <button
              className="legacy-key-btn"
              onClick={handleVerify}
              disabled={state === "loading" || !key.trim()}
            >
              {state === "loading" ? (
                <span className="legacy-spinner" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              )}
            </button>
          </div>

          {errorMsg && (
            <p className="legacy-error">{errorMsg}</p>
          )}

          <p className="legacy-lock-hint">
            Con amor,<br />
            <strong>Alexander</strong>
          </p>
        </div>
      </div>
    );
  }

  // ── PANTALLA DE CONTENIDO ────────────────────────────────────────────────────
  if (state === "content" && data) {
    // Vista de mensaje individual
    if (selectedChild) {
      return (
        <div className="legacy-content">
          <div className="legacy-content-inner">
            <button className="legacy-back-btn" onClick={() => setSelectedChild(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Volver
            </button>

            <div className="legacy-letter">
              <div className="legacy-letter-header">
                <div className="legacy-letter-heart">❤️</div>
                <h2 className="legacy-letter-name">{selectedChild.name}</h2>
                <p className="legacy-letter-nickname">"{selectedChild.nickname}"</p>
                <p className="legacy-letter-date">Nacida el {selectedChild.birthdate}</p>
              </div>
              <div className="legacy-letter-body">
                {formatMessage(selectedChild.message)}
              </div>
              <div className="legacy-letter-footer">
                <p>Con todo el amor del mundo,</p>
                <p><strong>Tu papá Alexander</strong></p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Vista del mensaje general
    if (showGeneral) {
      return (
        <div className="legacy-content">
          <div className="legacy-content-inner">
            <button className="legacy-back-btn" onClick={() => setShowGeneral(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Volver
            </button>

            <div className="legacy-letter">
              <div className="legacy-letter-header">
                <div className="legacy-letter-heart">💌</div>
                <h2 className="legacy-letter-name">Para todos ustedes</h2>
                <p className="legacy-letter-nickname">Constanza · Renata · Valentín</p>
              </div>
              <div className="legacy-letter-body">
                {formatMessage(data.generalMessage)}
              </div>
              <div className="legacy-letter-footer">
                <p>Con todo el amor del mundo,</p>
                <p><strong>Su papá Alexander</strong></p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Vista principal del Legado
    return (
      <div className="legacy-content">
        <div className="legacy-content-inner">
          {/* Header íntimo */}
          <div className="legacy-header">
            <div className="legacy-header-heart">❤️</div>
            <h1 className="legacy-header-title">El Legado de tu Papá</h1>
            <p className="legacy-header-sub">
              "{data.creator.lifePhrase}"
            </p>
          </div>

          {/* Mensaje general */}
          <button className="legacy-general-btn" onClick={() => setShowGeneral(true)}>
            <span className="legacy-general-icon">💌</span>
            <div>
              <p className="legacy-general-label">Carta para todos</p>
              <p className="legacy-general-desc">Un mensaje de su papá para los tres</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>

          {/* Cartas individuales */}
          <p className="legacy-section-title">Carta para cada uno</p>
          <div className="legacy-children-grid">
            {data.children.map((child) => (
              <button
                key={child.name}
                className="legacy-child-card"
                onClick={() => setSelectedChild(child)}
              >
                <div className="legacy-child-emoji">
                  {child.name === "Constanza" ? "🌸" : child.name === "Renata" ? "⭐" : "🦁"}
                </div>
                <h3 className="legacy-child-name">{child.name}</h3>
                <p className="legacy-child-nick">"{child.nickname}"</p>
                <p className="legacy-child-date">{child.birthdate}</p>
                <span className="legacy-child-cta">Leer carta →</span>
              </button>
            ))}
          </div>

          {/* Filosofía del papá */}
          <div className="legacy-philosophy">
            <p className="legacy-philosophy-label">Su filosofía de vida</p>
            <p className="legacy-philosophy-text">"{data.creator.philosophy}"</p>
          </div>

          {/* Salir */}
          <button className="legacy-logout-btn" onClick={handleLogout}>
            Cerrar este espacio
          </button>
        </div>
      </div>
    );
  }

  return null;
}
